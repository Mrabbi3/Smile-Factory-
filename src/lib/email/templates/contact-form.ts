import { emailLayout } from './layout'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

/** Email sent to the business when someone submits the contact form. */
export function contactFormEmail(data: ContactFormData): string {
  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#18181b">New Contact Form Submission</h2>
    <p style="margin:0 0 24px;color:#71717a;font-size:14px">Someone reached out through the website contact form.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td style="padding:12px 16px;background:#f4f4f5;border-radius:8px 8px 0 0;border-bottom:1px solid #e4e4e7">
          <strong style="font-size:13px;color:#71717a">From</strong><br/>
          <span style="font-size:15px;color:#18181b">${data.name}</span>
          <span style="font-size:13px;color:#71717a"> &lt;${data.email}&gt;</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#f4f4f5;border-bottom:1px solid #e4e4e7">
          <strong style="font-size:13px;color:#71717a">Subject</strong><br/>
          <span style="font-size:15px;color:#18181b">${data.subject || '(no subject)'}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;background:#f4f4f5;border-radius:0 0 8px 8px">
          <strong style="font-size:13px;color:#71717a">Message</strong><br/>
          <p style="margin:8px 0 0;font-size:15px;color:#18181b;white-space:pre-wrap;line-height:1.6">${data.message}</p>
        </td>
      </tr>
    </table>

    <p style="font-size:13px;color:#a1a1aa">Reply directly to this email to respond to the customer.</p>
  `
  return emailLayout('New Contact Form Message', body)
}

/** Auto-reply sent to the person who submitted the contact form. */
export function contactFormAutoReply(data: { name: string }): string {
  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#18181b">Thanks for reaching out, ${data.name}!</h2>
    <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.6">
      We&rsquo;ve received your message and will get back to you as soon as possible &mdash;
      usually within 24 hours.
    </p>
    <p style="margin:0;color:#52525b;font-size:15px;line-height:1.6">
      In the meantime, feel free to give us a call if you need immediate assistance.
    </p>
  `
  return emailLayout('We Got Your Message!', body)
}