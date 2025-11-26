import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, stripeWebhookSecret } from '@/lib/stripe/config'
import { createClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailure(paymentIntent)
        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentCanceled(paymentIntent)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const supabase = await createClient()

  // Update donation status to 'completed'
  const { error: updateError } = await (supabase.from('donations') as ReturnType<typeof supabase.from>)
    .update({
      status: 'completed',
    } as Record<string, unknown>)
    .eq('payment_id', paymentIntent.id)

  if (updateError) {
    console.error('Error updating donation:', updateError)
    throw updateError
  }

  // Update user reputation (+10 points per donation)
  const userId = paymentIntent.metadata.user_id
  if (userId) {
    const { error: reputationError } = await (supabase.rpc as any)('increment_user_reputation', {
      p_user_id: userId,
      p_points: 10,
      p_donation_increment: 1,
    })

    if (reputationError) {
      console.error('Error updating reputation:', reputationError)
      // Don't throw - reputation update is not critical
    }
  }

  console.log(`Payment succeeded: ${paymentIntent.id}`)
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const supabase = await createClient()

  // Update donation status to 'failed'
  const { error: updateError } = await (supabase.from('donations') as ReturnType<typeof supabase.from>)
    .update({
      status: 'failed',
    } as Record<string, unknown>)
    .eq('payment_id', paymentIntent.id)

  if (updateError) {
    console.error('Error updating donation:', updateError)
    throw updateError
  }

  console.log(`Payment failed: ${paymentIntent.id}`)
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const supabase = await createClient()

  // Update donation status to 'failed'
  const { error: updateError } = await (supabase.from('donations') as ReturnType<typeof supabase.from>)
    .update({
      status: 'failed',
    } as Record<string, unknown>)
    .eq('payment_id', paymentIntent.id)

  if (updateError) {
    console.error('Error updating donation:', updateError)
    throw updateError
  }

  console.log(`Payment canceled: ${paymentIntent.id}`)
}
