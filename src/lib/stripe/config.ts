import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

// Initialize Stripe with the secret key (server-side only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17.clover',
  typescript: true,
})

// Stripe publishable key for client-side (safe to expose)
export const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''

// Webhook secret for validating webhook signatures
export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

// Minimum donation amount in cents (R$ 2.00)
export const MIN_DONATION_AMOUNT = 200

// Maximum donation amount in cents (R$ 1000.00)
export const MAX_DONATION_AMOUNT = 100000

// Suggested donation amounts in cents
export const SUGGESTED_AMOUNTS = [500, 1000, 2000] // R$ 5, 10, 20
