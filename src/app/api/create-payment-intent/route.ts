import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paymentClient, MIN_DONATION_AMOUNT, MAX_DONATION_AMOUNT } from '@/lib/mercadopago/config'

export async function POST(request: Request) {
  try {
    const { amount, ecopointId } = await request.json()

    // Validate amount (amount is in cents)
    if (!amount || amount < MIN_DONATION_AMOUNT || amount > MAX_DONATION_AMOUNT) {
      return NextResponse.json(
        { error: `Valor deve estar entre R$ 2,00 e R$ 1.000,00` },
        { status: 400 }
      )
    }

    // Validate ecopointId
    if (!ecopointId) {
      return NextResponse.json(
        { error: 'ID do ecoponto é obrigatório' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Verify ecopoint exists and accepts donations
    const { data: ecopoint, error: ecopointError } = await supabase
      .from('ecopoints')
      .select('id, name, status, accepts_donations')
      .eq('id', ecopointId)
      .single()

    if (ecopointError || !ecopoint) {
      return NextResponse.json({ error: 'Ecoponto não encontrado' }, { status: 404 })
    }

    // Type assertion for ecopoint
    const typedEcopoint = ecopoint as {
      id: string
      name: string
      accepts_donations?: boolean
      status: string
    }

    if (typedEcopoint.status !== 'validated') {
      return NextResponse.json(
        { error: 'Apenas ecopontos validados podem receber doações' },
        { status: 400 }
      )
    }

    if (!typedEcopoint.accepts_donations) {
      return NextResponse.json(
        { error: 'Este ecoponto não aceita doações' },
        { status: 400 }
      )
    }

    // Create payment with MercadoPago (PIX)
    const payment = await paymentClient.create({
      body: {
        transaction_amount: amount / 100, // Convert cents to reais
        description: `Doação para ${typedEcopoint.name}`,
        payment_method_id: 'pix',
        payer: {
          email: user.email || 'doador@ecomapa.com',
        },
        metadata: {
          ecopoint_id: ecopointId,
          ecopoint_name: typedEcopoint.name,
          user_id: user.id,
          user_email: user.email || '',
        },
      },
    })

    // Create donation record in database
    const { error: insertError } = await (
      supabase.from('donations') as ReturnType<typeof supabase.from>
    ).insert({
      ecopoint_id: ecopointId,
      user_id: user.id,
      amount: amount / 100,
      payment_id: payment.id?.toString() || '',
      status: 'pending',
    } as Record<string, unknown>)

    if (insertError) {
      console.error('Error creating donation record:', insertError)
      return NextResponse.json(
        { error: 'Erro ao criar registro de doação' },
        { status: 500 }
      )
    }

    // Extract PIX information
    const pixData = payment.point_of_interaction?.transaction_data

    return NextResponse.json({
      paymentId: payment.id?.toString(),
      qrCode: pixData?.qr_code || null,
      qrCodeBase64: pixData?.qr_code_base64 || null,
      ticketUrl: pixData?.ticket_url || null,
      expiresAt: payment.date_of_expiration || null,
    })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Erro ao criar pagamento' },
      { status: 500 }
    )
  }
}
