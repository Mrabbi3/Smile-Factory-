import { getResend, getFromEmail } from './resend'
import { SITE_NAME } from '@/lib/constants'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  attachments?: { filename: string; content: Buffer }[]
  replyTo?: string
}

export async function sendEmail(options: SendEmailOptions) {
  const resend = getResend()
  const from = `${SITE_NAME} <${getFromEmail()}>`

  const { data, error } = await resend.emails.send({
    from,
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
    attachments: options.attachments?.map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  })

  if (error) {
    console.error('[email] send failed:', error)
    throw new Error(error.message)
  }

  return data
}