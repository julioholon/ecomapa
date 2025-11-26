import { NextResponse } from 'next/server'
import { stripe, MIN_DONATION_AMOUNT, MAX_DONATION_AMOUNT } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { amount, ecopointId } = await request.json()

    // Validate amount
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
      .select('id, name, accepts_donations, status')
      .eq('id', ecopointId)
      .single()

    if (ecopointError || !ecopoint) {
      return NextResponse.json({ error: 'Ecoponto não encontrado' }, { status: 404 })
    }

    // Type assertion for ecopoint data
    const typedEcopoint = ecopoint as {
      id: string
      name: string
      accepts_donations?: boolean
      status: string
    }

    if (!typedEcopoint.accepts_donations) {
      return NextResponse.json(
        { error: 'Este ecoponto não aceita doações' },
        { status: 400 }
      )
    }

    if (typedEcopoint.status !== 'validated') {
      return NextResponse.json(
        { error: 'Apenas ecopontos validados podem receber doações' },
        { status: 400 }
      )
    }

    // Create Payment Intent with PIX
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'brl',
      payment_method_types: ['pix'],
      metadata: {
        ecopoint_id: ecopointId,
        ecopoint_name: typedEcopoint.name,
        user_id: user.id,
        user_email: user.email || '',
      },
      description: `Doação para ${typedEcopoint.name}`,
    })

    // Create donation record in database (status: pending)
    const { error: donationError } = await (supabase.from('donations') as ReturnType<typeof supabase.from>).insert({
      ecopoint_id: ecopointId,
      user_id: user.id,
      amount: amount / 100, // Convert cents to reais
      payment_id: paymentIntent.id,
      status: 'pending',
    } as Record<string, unknown>)

    if (donationError) {
      console.error('Error creating donation record:', donationError)
      // Don't fail the payment intent, just log the error
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Erro ao criar intenção de pagamento' },
      { status: 500 }
    )
  }
}
