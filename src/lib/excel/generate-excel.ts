import * as XLSX from 'xlsx'

export function generateExcel(data: Record<string, unknown>[], filename: string, sheetName = 'Data') {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function generateMultiSheetExcel(
  sheets: { name: string; data: Record<string, unknown>[] }[],
  filename: string
) {
  const wb = XLSX.utils.book_new()
  sheets.forEach(({ name, data }) => {
    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, name)
  })
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function formatTransactionsForExcel(transactions: any[]) {
  return transactions.map(t => ({
    'Date': t.created_at ? new Date(t.created_at).toLocaleString() : '',
    'Amount': t.amount_paid,
    'Tokens': t.tokens_given,
    'Payment Type': t.payment_type,
    'Loyalty Bonus': t.is_loyalty_bonus ? 'Yes' : 'No',
    'Notes': t.notes || '',
  }))
}

export function formatPrizesForExcel(prizes: any[]) {
  return prizes.map(p => ({
    'Name': p.name,
    'Category': p.category,
    'Ticket Cost': p.ticket_cost,
    'Stock': p.stock_quantity,
    'Reorder At': p.reorder_threshold,
    'Active': p.is_active ? 'Yes' : 'No',
  }))
}

export function formatBookingsForExcel(bookings: any[]) {
  return bookings.map(b => ({
    'Date': b.booking_date,
    'Time': `${b.start_time} - ${b.end_time}`,
    'Contact': b.contact_name,
    'Phone': b.contact_phone,
    'Email': b.contact_email,
    'Kids': b.num_kids,
    'Adults': b.num_adults,
    'Status': b.status,
    'Total': b.total_amount,
    'Deposit Paid': b.deposit_paid ? 'Yes' : 'No',
  }))
}

export function formatExpensesForExcel(expenses: any[]) {
  return expenses.map(e => ({
    'Date': e.expense_date,
    'Description': e.description,
    'Category': e.category,
    'Payment Method': e.payment_method,
    'Amount': e.amount,
  }))
}

export function formatEmployeesForExcel(employees: any[]) {
  return employees.map(e => ({
    'Name': `${e.first_name} ${e.last_name}`,
    'Email': e.email,
    'Phone': e.phone || '',
    'Role': e.role,
    'Active': e.is_active ? 'Yes' : 'No',
    'Joined': e.created_at ? new Date(e.created_at).toLocaleDateString() : '',
  }))
}