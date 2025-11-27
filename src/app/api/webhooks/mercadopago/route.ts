import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { paymentClient } from '@/lib/mercadopago/config'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // MercadoPago sends notifications in this format
    const { type, data } = body

    // We're only interested in payment notifications
    if (type !== 'payment') {
      return NextResponse.json({ received: true })
    }

    // Get payment ID from notification
    const paymentId = data?.id

    if (!paymentId) {
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 })
    }

    // Fetch payment details from MercadoPago
    const payment = await paymentClient.get({ id: paymentId })

    // Handle different payment statuses
    switch (payment.status) {
      case 'approved':
        await handlePaymentSuccess(payment.id?.toString() || '', payment.metadata)
        break

      case 'rejected':
      case 'cancelled':
        await handlePaymentFailure(payment.id?.toString() || '')
        break

      case 'in_process':
      case 'pending':
        // Payment is still pending, nothing to do
        console.log(`Payment ${payment.id} is still pending`)
        break

      default:
        console.log(`Unhandled payment status: ${payment.status}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentId: string, metadata: any) {
  const supabase = await createClient()

  // Update donation status to 'completed'
  const { error: updateError } = await (
    supabase.from('donations') as ReturnType<typeof supabase.from>
  )
    .update({
      status: 'completed',
    } as Record<string, unknown>)
    .eq('payment_id', paymentId)

  if (updateError) {
    console.error('Error updating donation:', updateError)
    throw updateError
  }

  // Update user reputation (+10 points per donation)
  const userId = metadata?.user_id

  if (userId) {
    const { error: reputationError } = await (supabase.rpc as any)(
      'increment_user_reputation',
      {
        p_user_id: userId,
        p_points: 10,
        p_donation_increment: 1,
      }
    )

    if (reputationError) {
      console.error('Error updating reputation:', reputationError)
      // Don't throw - reputation update is not critical
    }
  }

  console.log(`Payment succeeded: ${paymentId}`)
}

async function handlePaymentFailure(paymentId: string) {
  const supabase = await createClient()

  // Update donation status to 'failed'
  const { error: updateError } = await (
    supabase.from('donations') as ReturnType<typeof supabase.from>
  )
    .update({
      status: 'failed',
    } as Record<string, unknown>)
    .eq('payment_id', paymentId)

  if (updateError) {
    console.error('Error updating donation:', updateError)
    throw updateError
  }

  console.log(`Payment failed or cancelled: ${paymentId}`)
}
