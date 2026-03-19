'use server'

import { sendEmail } from '@/lib/email/send-email'
import { contactFormEmail, contactFormAutoReply } from '@/lib/email/templates/contact-form'

interface ContactFormState {
  success?: boolean
  error?: string
}

export async function submitContactForm(
  _prev: ContactFormState | null,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get('name')?.toString()?.trim()
  const email = formData.get('email')?.toString()?.trim()
  const subject = formData.get('subject')?.toString()?.trim() || ''
  const message = formData.get('message')?.toString()?.trim()

  if (!name || !email || !message) {
    return { error: 'Name, email, and message are required.' }
  }

  try {
    await Promise.all([
      sendEmail({
        to: process.env.RESEND_FROM_EMAIL || 'info@thesmilefactoryarcade.com',
        subject: `Contact Form: ${subject || 'New Message'} — from ${name}`,
        html: contactFormEmail({ name, email, subject, message }),
        replyTo: email,
      }),
      sendEmail({
        to: email,
        subject: "We got your message!",
        html: contactFormAutoReply({ name }),
      }),
    ])

    return { success: true }
  } catch (err: any) {
    console.error('[contact-form] send failed:', err)
    return { error: 'Failed to send your message. Please try again or call us directly.' }
  }
}
