import { Resend } from 'resend'

let resendInstance: Resend | null = null

export function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error(
        'RESEND_API_KEY is not set. Add it to .env.local — see .env.local.example for instructions.'
      )
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
}