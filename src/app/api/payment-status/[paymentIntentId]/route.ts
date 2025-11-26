import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ paymentIntentId: string }> }
) {
  try {
    const { paymentIntentId } = await params

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
      .eq('payment_id', paymentIntentId)
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

    // Otherwise, check Stripe for the latest status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    // Get PIX payment details if available
    let pixDetails = null
    if (
      paymentIntent.status === 'requires_action' &&
      paymentIntent.next_action?.type === 'pix_display_qr_code' &&
      paymentIntent.next_action.pix_display_qr_code
    ) {
      const pixData = paymentIntent.next_action.pix_display_qr_code as {
        hosted_voucher_url?: string
        data?: string
        expires_at?: number
      }
      pixDetails = {
        qrCode: pixData.hosted_voucher_url || null,
        pixCode: pixData.data || null,
        expiresAt: pixData.expires_at || null,
      }
    }

    return NextResponse.json({
      status: paymentIntent.status,
      donation: typedDonation,
      pixDetails,
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status do pagamento' },
      { status: 500 }
    )
  }
}
