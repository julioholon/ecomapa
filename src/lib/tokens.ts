import crypto from 'crypto'

const SECRET = process.env.VALIDATION_TOKEN_SECRET || 'ecomapa-secret-change-in-production'
const EXPIRATION_DAYS = parseInt(process.env.VALIDATION_TOKEN_EXPIRATION_DAYS || "90") // Default to 90 days;

export interface ValidationToken {
  ecopointId: string
  email: string
  expiresAt: number
}

/**
 * Generate a validation token for an ecopoint
 * Token expires in EXPIRATION_DAYS (default 90 days) 
 */
export function generateValidationToken(ecopointId: string, email: string): string {
  const now = new Date()
  const expiresAt = new Date(now.getFullYear(),now.getMonth(),now.getDate()+EXPIRATION_DAYS).getTime();

  const payload: ValidationToken = {
    ecopointId,
    email,
    expiresAt,
  }

  const jsonPayload = JSON.stringify(payload)
  const base64Payload = Buffer.from(jsonPayload).toString('base64url')

  // Create HMAC signature
  const hmac = crypto.createHmac('sha256', SECRET)
  hmac.update(base64Payload)
  const signature = hmac.digest('base64url')

  return `${base64Payload}.${signature}`
}

/**
 * Verify and decode a validation token
 */
export function verifyValidationToken(token: string): ValidationToken | null {
  try {
    const [base64Payload, signature] = token.split('.')

    if (!base64Payload || !signature) {
      return null
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', SECRET)
    hmac.update(base64Payload)
    const expectedSignature = hmac.digest('base64url')

    if (signature !== expectedSignature) {
      return null
    }

    // Decode payload
    const jsonPayload = Buffer.from(base64Payload, 'base64url').toString('utf-8')
    const payload: ValidationToken = JSON.parse(jsonPayload)

    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return null
    }

    return payload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}