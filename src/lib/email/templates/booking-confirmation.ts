import { emailLayout } from './layout'
import { BUSINESS_INFO } from '@/lib/constants'

export interface BookingConfirmationData {
  contactName: string
  contactEmail: string
  contactPhone: string
  bookingDate: string
  startTime: string
  endTime: string
  packageName: string
  numKids: number
  numAdults: number
  totalAmount: number
  depositAmount: number
  depositPaid: boolean
  specialRequests?: string
  status: string
}

export function bookingConfirmationEmail(data: BookingConfirmationData): string {
  const statusLabel =
    data.status === 'confirmed'
      ? '<span style="color:#16a34a;font-weight:600">Confirmed</span>'
      : '<span style="color:#ca8a04;font-weight:600">Pending Confirmation</span>'

  const depositBadge = data.depositPaid
    ? '<span style="display:inline-block;background:#dcfce7;color:#166534;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600">Paid</span>'
    : '<span style="display:inline-block;background:#fef9c3;color:#854d0e;padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600">Pending</span>'

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#18181b">Party Booking ${data.status === 'confirmed' ? 'Confirmed' : 'Received'}!</h2>
    <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.6">
      Hi ${data.contactName}, ${data.status === 'confirmed' ? 'your party is confirmed! Here are the details:' : 'we received your booking request. We\'ll confirm it shortly.'}
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden">
      <tr style="background:#fef2f2">
        <td colspan="2" style="padding:16px;text-align:center">
          <div style="font-size:13px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px">Party Date</div>
          <div style="font-size:22px;font-weight:700;color:#DC2626">${data.bookingDate}</div>
          <div style="font-size:15px;color:#52525b;margin-top:2px">${data.startTime} &ndash; ${data.endTime}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;font-size:13px;color:#71717a;width:40%">Package</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;font-size:14px;color:#18181b;font-weight:500">${data.packageName}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;font-size:13px;color:#71717a">Kids</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;font-size:14px;color:#18181b">${data.numKids}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;font-size:13px;color:#71717a">Adults</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;font-size:14px;color:#18181b">${data.numAdults}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;font-size:13px;color:#71717a">Total</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;font-size:14px;color:#18181b;font-weight:600">$${data.totalAmount.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;font-size:13px;color:#71717a">Deposit ($${data.depositAmount.toFixed(2)})</td>
        <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;font-size:14px;color:#18181b">${depositBadge}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#71717a">Status</td>
        <td style="padding:12px 16px;font-size:14px">${statusLabel}</td>
      </tr>
    </table>

    ${
      data.specialRequests
        ? `
    <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin-bottom:24px">
      <div style="font-size:13px;color:#71717a;margin-bottom:4px;font-weight:600">Special Requests</div>
      <p style="margin:0;font-size:14px;color:#18181b;line-height:1.5">${data.specialRequests}</p>
    </div>`
        : ''
    }

    ${
      !data.depositPaid
        ? `
    <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:24px">
      <p style="margin:0;font-size:14px;color:#854d0e;line-height:1.5">
        <strong>Deposit Required:</strong> A $${data.depositAmount.toFixed(2)} deposit is needed to confirm your booking.
        Please call us at <a href="tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}" style="color:#DC2626;font-weight:600">${BUSINESS_INFO.phone}</a> to arrange payment.
      </p>
    </div>`
        : ''
    }

    <p style="font-size:14px;color:#52525b;line-height:1.6">
      Questions or need to make changes? Call us at
      <a href="tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}" style="color:#DC2626;text-decoration:none;font-weight:500">${BUSINESS_INFO.phone}</a>
      and we&rsquo;ll be happy to help.
    </p>

    <p style="font-size:13px;color:#a1a1aa;text-align:center;margin-top:24px">We can&rsquo;t wait to celebrate with you! 🎉</p>
  `
  return emailLayout('Your Party Booking Details', body)
}
