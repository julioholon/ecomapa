import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paymentClient } from '@/lib/mercadopago/config'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Check donation exists and belongs to user
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .select('*')
      .eq('payment_id', paymentId)
      .eq('user_id', user.id)
      .single()

    if (donationError || !donation) {
      return NextResponse.json({ error: 'Doação não encontrada' }, { status: 404 })
    }

    // Type assertion for donation data
    const typedDonation = donation as {
      id: string
      ecopoint_id: string
      user_id: string
      amount: number
      payment_id: string
      status: string
      created_at: string
    }

    // If already completed in database, return that status
    if (typedDonation.status === 'completed') {
      return NextResponse.json({
        status: 'completed',
        donation: typedDonation,
      })
    }

    // Otherwise, check MercadoPago for the latest status
    const payment = await paymentClient.get({ id: Number(paymentId) })

    // Map MercadoPago status to our status
    let status = 'pending'
    if (payment.status === 'approved') {
      status = 'completed'
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      status = 'failed'
    }

    return NextResponse.json({
      status,
      donation: typedDonation,
      paymentStatus: payment.status,
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do pagamento' },
      { status: 500 }
    )
  }
}
