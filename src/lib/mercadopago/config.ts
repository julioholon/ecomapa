import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error('MERCADOPAGO_ACCESS_TOKEN is not set in environment variables')
}

// Initialize MercadoPago client
export const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: {
    timeout: 5000,
  },
})

// Create Payment and Preference clients
export const paymentClient = new Payment(mercadopago)
export const preferenceClient = new Preference(mercadopago)

// MercadoPago Public Key for client-side (safe to expose)
export const mercadopagoPublicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || ''

// Webhook secret for validating webhook signatures
export const mercadopagoWebhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET || ''

// Minimum donation amount in cents (R$ 2.00)
export const MIN_DONATION_AMOUNT = 200

// Maximum donation amount in cents (R$ 1000.00)
export const MAX_DONATION_AMOUNT = 100000

// Suggested donation amounts in cents
export const SUGGESTED_AMOUNTS = [500, 1000, 2000] // R$ 5, 10, 20
