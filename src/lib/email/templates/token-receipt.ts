import { emailLayout } from './layout'

export interface TokenReceiptData {
  transactionId: string
  date: string
  items: { tokens: number; amount: number; isLoyalty: boolean }[]
  totalAmount: number
  totalTokens: number
  paymentType: 'cash' | 'card'
  customerName?: string
}

export function tokenReceiptEmail(data: TokenReceiptData): string {
  const rows = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e4e4e7;font-size:14px;color:#18181b">
        ${item.tokens} Tokens${item.isLoyalty ? ' <span style="color:#ca8a04;font-weight:600">(Loyalty Bonus)</span>' : ''}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #e4e4e7;font-size:14px;color:#18181b;text-align:right">
        $${item.amount.toFixed(2)}
      </td>
    </tr>`
    )
    .join('')

  const body = `
    <h2 style="margin:0 0 8px;font-size:20px;color:#18181b">Token Purchase Receipt</h2>
    <p style="margin:0 0 24px;color:#71717a;font-size:14px">
      ${data.customerName ? `Hi ${data.customerName}, thanks` : 'Thanks'} for your purchase!
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden">
      <tr style="background:#f4f4f5">
        <td style="padding:10px 12px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px">Item</td>
        <td style="padding:10px 12px;font-size:12px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;text-align:right">Amount</td>
      </tr>
      ${rows}
      <tr style="background:#f4f4f5">
        <td style="padding:12px;font-size:15px;font-weight:700;color:#18181b">
          Total &mdash; ${data.totalTokens} Tokens
        </td>
        <td style="padding:12px;font-size:15px;font-weight:700;color:#18181b;text-align:right">
          $${data.totalAmount.toFixed(2)}
        </td>
      </tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#71717a">Transaction ID</td>
        <td style="padding:6px 0;font-size:13px;color:#18181b;text-align:right;font-family:monospace">${data.transactionId.slice(0, 8)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#71717a">Date</td>
        <td style="padding:6px 0;font-size:13px;color:#18181b;text-align:right">${data.date}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#71717a">Payment Method</td>
        <td style="padding:6px 0;font-size:13px;color:#18181b;text-align:right;text-transform:capitalize">${data.paymentType}</td>
      </tr>
    </table>

    <p style="font-size:13px;color:#a1a1aa;text-align:center">Have fun playing! 🎮</p>
  `
  return emailLayout('Your Token Purchase Receipt', body)
}
