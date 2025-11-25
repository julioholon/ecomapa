import { Resend } from 'resend'

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY

if (!resendApiKey) {
  console.warn(
    'RESEND_API_KEY not found. Email functionality will be disabled.'
  )
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null

// Email sender configuration
export const EMAIL_FROM = process.env.EMAIL_FROM || 'EcoMapa <onboarding@resend.dev>'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
