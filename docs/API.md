# API Documentation

## API Routes

### AI Chat - `POST /api/ai/chat`

Handles AI chatbot conversations for both customer-facing and admin analytics.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "What are your hours?" }
  ],
  "mode": "customer"  // or "admin"
}
```

**Response:**
```json
{
  "message": "We're open Saturday-Sunday 10AM-10PM and Monday-Friday 12PM-10PM!"
}
```

**Modes:**
- `customer` - Uses Smile Factory business context for customer FAQs
- `admin` - Uses analytics prompt for business data analysis

## Supabase Client-Side Operations

All data operations use the Supabase client directly from the browser via Row Level Security.

### Token Transactions

```typescript
// Create a sale
await supabase.from('token_transactions').insert({
  employee_id: userId,
  amount_paid: 20,
  payment_type: 'cash',
  tokens_given: 66,
  is_loyalty_bonus: false,
})

// Get recent transactions
const { data } = await supabase
  .from('token_transactions')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(20)
```

### Prize Management

```typescript
// Get all prizes
const { data } = await supabase
  .from('prizes')
  .select('*')
  .order('name')

// Update stock
await supabase
  .from('prizes')
  .update({ stock_quantity: newQty })
  .eq('id', prizeId)

// Log redemption
await supabase.from('prize_redemptions').insert({
  prize_id: prizeId,
  employee_id: userId,
  tickets_used: 600,
  quantity: 1,
})
```

### Party Bookings

```typescript
// Create booking
await supabase.from('party_bookings').insert({
  customer_id: userId,
  package_id: packageId,
  booking_date: '2026-03-15',
  start_time: '14:00',
  end_time: '16:00',
  num_kids: 12,
  status: 'pending',
  deposit_amount: 100,
  contact_name: 'John Doe',
  contact_phone: '555-0123',
  contact_email: 'john@example.com',
})
```

### Authentication

```typescript
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
})

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: { first_name: 'John', last_name: 'Doe', phone: '555-0123' }
  }
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

## PDF Generation

Client-side PDF generation using jsPDF:

```typescript
import { generateRevenueReport } from '@/lib/pdf/generate-pdf'

const doc = generateRevenueReport({
  period: 'March 2026',
  totalRevenue: 5000,
  cashRevenue: 3000,
  cardRevenue: 2000,
  transactionCount: 250,
  dailyData: [...]
})
doc.save('Revenue_Report.pdf')
```

Available generators:
- `generateRevenueReport()` - Revenue summary with daily breakdown
- `generateInventoryReport()` - Prize inventory with stock levels
- `generateBookingReport()` - Party booking summary
- `generateExpenseReport()` - Expense summary by category

## Excel Export

```typescript
import { generateExcel, formatTransactionsForExcel } from '@/lib/excel/generate-excel'

const formattedData = formatTransactionsForExcel(transactions)
generateExcel(formattedData, 'Transactions_Report', 'Transactions')
```

Available formatters:
- `formatTransactionsForExcel()` - Token transactions
- `formatPrizesForExcel()` - Prize inventory
- `formatBookingsForExcel()` - Party bookings
- `formatExpensesForExcel()` - Expenses
- `formatEmployeesForExcel()` - Employee directory
