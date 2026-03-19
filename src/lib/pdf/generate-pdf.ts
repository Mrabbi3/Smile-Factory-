import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'

const BRAND_COLOR: [number, number, number] = [220, 38, 38]
const HEADER_BG: [number, number, number] = [220, 38, 38]

function addHeader(doc: jsPDF, title: string) {
  doc.setFillColor(...BRAND_COLOR)
  doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.text('The Smile Factory', 14, 18)
  doc.setFontSize(10)
  doc.text('Arcade & Family Fun Center | Brigantine, NJ', 14, 28)

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(16)
  doc.text(title, 14, 55)
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy h:mm a')}`, 14, 62)
}

function addFooter(doc: jsPDF, text?: string) {
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} of ${pageCount} | ${text || 'The Smile Factory - Confidential'}`,
      doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }
}

export function generateRevenueReport(data: {
  period: string
  totalRevenue: number
  cashRevenue: number
  cardRevenue: number
  transactionCount: number
  dailyData: { date: string; cash: number; card: number; total: number }[]
}) {
  const doc = new jsPDF()
  addHeader(doc, `Revenue Report — ${data.period}`)

  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  let y = 75

  const summaryData = [
    ['Total Revenue', `$${data.totalRevenue.toFixed(2)}`],
    ['Cash Revenue', `$${data.cashRevenue.toFixed(2)}`],
    ['Card Revenue', `$${data.cardRevenue.toFixed(2)}`],
    ['Total Transactions', data.transactionCount.toString()],
    ['Average Transaction', data.transactionCount > 0 ? `$${(data.totalRevenue / data.transactionCount).toFixed(2)}` : '$0.00'],
  ]

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: HEADER_BG, textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
  })

  if (data.dailyData.length > 0) {
    const finalY = (doc as any).lastAutoTable?.finalY || y + 60
    autoTable(doc, {
      startY: finalY + 10,
      head: [['Date', 'Cash', 'Card', 'Total']],
      body: data.dailyData.map(d => [d.date, `$${d.cash.toFixed(2)}`, `$${d.card.toFixed(2)}`, `$${d.total.toFixed(2)}`]),
      theme: 'striped',
      headStyles: { fillColor: HEADER_BG, textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
    })
  }

  addFooter(doc)
  return doc
}

export function generateInventoryReport(prizes: {
  name: string; category: string; ticket_cost: number;
  stock_quantity: number; reorder_threshold: number
}[]) {
  const doc = new jsPDF()
  addHeader(doc, 'Prize Inventory Report')

  autoTable(doc, {
    startY: 75,
    head: [['Prize', 'Category', 'Ticket Cost', 'Stock', 'Reorder At', 'Status']],
    body: prizes.map(p => [
      p.name, p.category, p.ticket_cost.toLocaleString(),
      p.stock_quantity.toString(), p.reorder_threshold.toString(),
      p.stock_quantity <= p.reorder_threshold ? 'LOW' : 'OK',
    ]),
    theme: 'striped',
    headStyles: { fillColor: HEADER_BG, textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
  })

  addFooter(doc)
  return doc
}

export function generateBookingReport(bookings: {
  booking_date: string; start_time: string; contact_name: string;
  num_kids: number; status: string; total_amount: number; deposit_paid: boolean
}[]) {
  const doc = new jsPDF('landscape')
  addHeader(doc, 'Party Booking Report')

  autoTable(doc, {
    startY: 75,
    head: [['Date', 'Time', 'Contact', 'Kids', 'Status', 'Total', 'Deposit']],
    body: bookings.map(b => [
      b.booking_date, b.start_time, b.contact_name,
      b.num_kids.toString(), b.status,
      `$${b.total_amount?.toFixed(2) || '0.00'}`,
      b.deposit_paid ? 'Paid' : 'Pending',
    ]),
    theme: 'striped',
    headStyles: { fillColor: HEADER_BG, textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
  })

  addFooter(doc)
  return doc
}

export function generateExpenseReport(expenses: {
  expense_date: string; description: string; category: string;
  payment_method: string; amount: number
}[], period: string) {
  const doc = new jsPDF()
  addHeader(doc, `Expense Report — ${period}`)

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  doc.setFontSize(11)
  doc.text(`Total Expenses: $${total.toFixed(2)}`, 14, 75)

  autoTable(doc, {
    startY: 82,
    head: [['Date', 'Description', 'Category', 'Payment', 'Amount']],
    body: expenses.map(e => [
      e.expense_date, e.description, e.category, e.payment_method, `$${e.amount.toFixed(2)}`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: HEADER_BG, textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
  })

  addFooter(doc)
  return doc
}

// ---------------------------------------------------------------------------
// Customer-facing receipts
// ---------------------------------------------------------------------------

export function generateTokenReceipt(data: {
  transactionId: string
  date: string
  items: { tokens: number; amount: number; isLoyalty: boolean }[]
  totalAmount: number
  totalTokens: number
  paymentType: 'cash' | 'card'
  customerName?: string
}) {
  const doc = new jsPDF({ format: [80, 200] })
  const w = doc.internal.pageSize.width

  doc.setFillColor(...BRAND_COLOR)
  doc.rect(0, 0, w, 22, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.text('The Smile Factory', w / 2, 10, { align: 'center' })
  doc.setFontSize(7)
  doc.text('Arcade & Family Fun Center | Brigantine, NJ', w / 2, 16, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  doc.text('TOKEN PURCHASE RECEIPT', w / 2, 30, { align: 'center' })

  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  doc.text(`Date: ${data.date}`, 6, 38)
  doc.text(`Txn: ${data.transactionId.slice(0, 8)}`, 6, 43)
  if (data.customerName) {
    doc.text(`Customer: ${data.customerName}`, 6, 48)
  }

  const startY = data.customerName ? 54 : 49

  autoTable(doc, {
    startY,
    margin: { left: 4, right: 4 },
    head: [['Item', 'Amt']],
    body: data.items.map((i) => [
      `${i.tokens} Tokens${i.isLoyalty ? ' (Loyalty)' : ''}`,
      `$${i.amount.toFixed(2)}`,
    ]),
    theme: 'plain',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontSize: 7 },
    styles: { fontSize: 7, cellPadding: 2 },
    columnStyles: { 1: { halign: 'right' } },
  })

  const finalY = (doc as any).lastAutoTable?.finalY || startY + 30

  doc.setDrawColor(200, 200, 200)
  doc.line(4, finalY + 2, w - 4, finalY + 2)

  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)
  doc.text(`Total: $${data.totalAmount.toFixed(2)}`, w - 6, finalY + 9, { align: 'right' })
  doc.text(`Tokens: ${data.totalTokens}`, 6, finalY + 9)

  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  const capPayment = data.paymentType.charAt(0).toUpperCase() + data.paymentType.slice(1)
  doc.text(`Payment: ${capPayment}`, 6, finalY + 15)

  doc.setFontSize(8)
  doc.setTextColor(0, 0, 0)
  doc.text('Thank you! Have fun playing!', w / 2, finalY + 24, { align: 'center' })

  return doc
}

export function generateBookingConfirmation(data: {
  contactName: string
  contactPhone: string
  contactEmail: string
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
}) {
  const doc = new jsPDF()
  addHeader(doc, 'Party Booking Confirmation')

  let y = 75

  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text(`Booking for ${data.contactName}`, 14, y)
  y += 8

  const details = [
    ['Date', data.bookingDate],
    ['Time', `${data.startTime} — ${data.endTime}`],
    ['Package', data.packageName],
    ['Number of Kids', data.numKids.toString()],
    ['Number of Adults', data.numAdults.toString()],
    ['Total Amount', `$${data.totalAmount.toFixed(2)}`],
    ['Deposit ($' + data.depositAmount.toFixed(2) + ')', data.depositPaid ? 'Paid' : 'Pending'],
    ['Status', data.status.charAt(0).toUpperCase() + data.status.slice(1)],
    ['Contact Phone', data.contactPhone],
    ['Contact Email', data.contactEmail],
  ]

  if (data.specialRequests) {
    details.push(['Special Requests', data.specialRequests])
  }

  autoTable(doc, {
    startY: y,
    head: [['Detail', 'Value']],
    body: details,
    theme: 'grid',
    headStyles: { fillColor: HEADER_BG, textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 } },
  })

  const tableEnd = (doc as any).lastAutoTable?.finalY || y + 80

  if (!data.depositPaid) {
    doc.setFillColor(254, 249, 195)
    doc.roundedRect(14, tableEnd + 8, doc.internal.pageSize.width - 28, 18, 3, 3, 'F')
    doc.setFontSize(9)
    doc.setTextColor(133, 77, 14)
    doc.text(
      `Deposit of $${data.depositAmount.toFixed(2)} is required to confirm your booking. Please call (609) 266-3866.`,
      doc.internal.pageSize.width / 2,
      tableEnd + 19,
      { align: 'center', maxWidth: doc.internal.pageSize.width - 40 }
    )
  }

  addFooter(doc, 'The Smile Factory — Thank you for choosing us!')
  return doc
}
