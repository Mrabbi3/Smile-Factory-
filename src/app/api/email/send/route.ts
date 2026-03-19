import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send-email'
import { tokenReceiptEmail, type TokenReceiptData } from '@/lib/email/templates/token-receipt'
import {
  bookingConfirmationEmail,
  type BookingConfirmationData,
} from '@/lib/email/templates/booking-confirmation'

type EmailType = 'token-receipt' | 'booking-confirmation'

interface EmailPayload {
  type: EmailType
  to: string
  data: TokenReceiptData | BookingConfirmationData
  pdfBase64?: string
  pdfFilename?: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: EmailPayload = await request.json()
    const { type, to, data, pdfBase64, pdfFilename } = body

    if (!type || !to || !data) {
      return NextResponse.json({ error: 'Missing required fields: type, to, data' }, { status: 400 })
    }

    let html: string
    let subject: string

    switch (type) {
      case 'token-receipt': {
        const d = data as TokenReceiptData
        html = tokenReceiptEmail(d)
        subject = `Your Token Purchase Receipt — $${d.totalAmount.toFixed(2)}`
        break
      }
      case 'booking-confirmation': {
        const d = data as BookingConfirmationData
        html = bookingConfirmationEmail(d)
        subject = `Party Booking ${d.status === 'confirmed' ? 'Confirmed' : 'Details'} — ${d.bookingDate}`
        break
      }
      default:
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 })
    }

    const attachments =
      pdfBase64 && pdfFilename
        ? [{ filename: pdfFilename, content: Buffer.from(pdfBase64, 'base64') }]
        : undefined

    const result = await sendEmail({ to, subject, html, attachments })

    return NextResponse.json({ success: true, id: result?.id })
  } catch (err: any) {
    console.error('[api/email/send]', err)
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 })
  }
}
