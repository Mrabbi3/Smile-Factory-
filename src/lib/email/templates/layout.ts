import { BUSINESS_INFO, SITE_NAME } from '@/lib/constants'

export function emailLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%">

<!-- Header -->
<tr>
<td style="background:#DC2626;padding:28px 32px;text-align:center">
  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px">${SITE_NAME}</h1>
  <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px">Arcade &amp; Family Fun Center &bull; Brigantine, NJ</p>
</td>
</tr>

<!-- Body -->
<tr>
<td style="padding:32px">
  ${body}
</td>
</tr>

<!-- Footer -->
<tr>
<td style="background:#fafafa;padding:24px 32px;border-top:1px solid #e4e4e7">
  <table width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="font-size:13px;color:#71717a;line-height:1.6">
    <strong style="color:#3f3f46">${BUSINESS_INFO.name}</strong><br/>
    ${BUSINESS_INFO.address}<br/>
    <a href="tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}" style="color:#DC2626;text-decoration:none">${BUSINESS_INFO.phone}</a>
  </td></tr>
  <tr><td style="font-size:11px;color:#a1a1aa;padding-top:12px">
    &copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
  </td></tr>
  </table>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`
}
