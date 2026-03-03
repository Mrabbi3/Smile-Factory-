'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { format, subDays } from 'date-fns'
import { generateRevenueReport, generateInventoryReport, generateBookingReport, generateExpenseReport } from '@/lib/pdf/generate-pdf'
import { generateExcel, formatTransactionsForExcel, formatPrizesForExcel, formatBookingsForExcel, formatExpensesForExcel, formatEmployeesForExcel } from '@/lib/excel/generate-excel'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  FileText, Download, File, BarChart3, Package, Calendar,
  Receipt, Users, Coins, Loader2
} from 'lucide-react'

export default function DocumentsPage() {
  const supabase = createClient()
  const [generating, setGenerating] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  })

  const gen = async (type: string, handler: () => Promise<void>) => {
    setGenerating(type)
    try { await handler() }
    catch (err: any) { toast.error(err.message) }
    finally { setGenerating(null) }
  }

  const documents = [
    {
      title: 'Revenue Report',
      description: 'Complete revenue breakdown with daily totals and payment type analysis',
      icon: BarChart3,
      color: 'text-green-600',
      pdfAction: () => gen('revenue-pdf', async () => {
        const { data: tx } = await supabase.from('token_transactions').select('*').gte('created_at', dateRange.from).lte('created_at', dateRange.to + 'T23:59:59')
        const transactions = tx || []
        const dailyMap: Record<string, { date: string; cash: number; card: number; total: number }> = {}
        transactions.forEach(t => {
          const d = format(new Date(t.created_at), 'MMM dd')
          if (!dailyMap[d]) dailyMap[d] = { date: d, cash: 0, card: 0, total: 0 }
          const a = Number(t.amount_paid)
          dailyMap[d].total += a
          if (t.payment_type === 'cash') dailyMap[d].cash += a; else dailyMap[d].card += a
        })
        const doc = generateRevenueReport({
          period: `${dateRange.from} to ${dateRange.to}`,
          totalRevenue: transactions.reduce((s, t) => s + Number(t.amount_paid), 0),
          cashRevenue: transactions.filter(t => t.payment_type === 'cash').reduce((s, t) => s + Number(t.amount_paid), 0),
          cardRevenue: transactions.filter(t => t.payment_type === 'card').reduce((s, t) => s + Number(t.amount_paid), 0),
          transactionCount: transactions.length,
          dailyData: Object.values(dailyMap),
        })
        doc.save(`Revenue_Report_${dateRange.from}_to_${dateRange.to}.pdf`)
        toast.success('Revenue PDF generated')
      }),
      excelAction: () => gen('revenue-xlsx', async () => {
        const { data } = await supabase.from('token_transactions').select('*').gte('created_at', dateRange.from).lte('created_at', dateRange.to + 'T23:59:59')
        generateExcel(formatTransactionsForExcel(data || []), `Transactions_${dateRange.from}_to_${dateRange.to}`)
        toast.success('Transactions Excel generated')
      }),
    },
    {
      title: 'Inventory Report',
      description: 'Current prize inventory with stock levels and reorder alerts',
      icon: Package,
      color: 'text-purple-600',
      pdfAction: () => gen('inv-pdf', async () => {
        const { data } = await supabase.from('prizes').select('*').order('name')
        const doc = generateInventoryReport(data || [])
        doc.save(`Inventory_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
        toast.success('Inventory PDF generated')
      }),
      excelAction: () => gen('inv-xlsx', async () => {
        const { data } = await supabase.from('prizes').select('*').order('name')
        generateExcel(formatPrizesForExcel(data || []), `Inventory_${format(new Date(), 'yyyy-MM-dd')}`)
        toast.success('Inventory Excel generated')
      }),
    },
    {
      title: 'Booking Report',
      description: 'Party bookings summary with status tracking and revenue',
      icon: Calendar,
      color: 'text-blue-600',
      pdfAction: () => gen('book-pdf', async () => {
        const { data } = await supabase.from('party_bookings').select('*').gte('booking_date', dateRange.from).lte('booking_date', dateRange.to)
        const doc = generateBookingReport(data || [])
        doc.save(`Booking_Report_${dateRange.from}_to_${dateRange.to}.pdf`)
        toast.success('Booking PDF generated')
      }),
      excelAction: () => gen('book-xlsx', async () => {
        const { data } = await supabase.from('party_bookings').select('*').gte('booking_date', dateRange.from).lte('booking_date', dateRange.to)
        generateExcel(formatBookingsForExcel(data || []), `Bookings_${dateRange.from}_to_${dateRange.to}`)
        toast.success('Booking Excel generated')
      }),
    },
    {
      title: 'Expense Report',
      description: 'Business expenses categorized by type and payment method',
      icon: Receipt,
      color: 'text-red-600',
      pdfAction: () => gen('exp-pdf', async () => {
        const { data } = await supabase.from('expenses').select('*').gte('expense_date', dateRange.from).lte('expense_date', dateRange.to)
        const doc = generateExpenseReport(data || [], `${dateRange.from} to ${dateRange.to}`)
        doc.save(`Expense_Report_${dateRange.from}_to_${dateRange.to}.pdf`)
        toast.success('Expense PDF generated')
      }),
      excelAction: () => gen('exp-xlsx', async () => {
        const { data } = await supabase.from('expenses').select('*').gte('expense_date', dateRange.from).lte('expense_date', dateRange.to)
        generateExcel(formatExpensesForExcel(data || []), `Expenses_${dateRange.from}_to_${dateRange.to}`)
        toast.success('Expense Excel generated')
      }),
    },
    {
      title: 'Employee Directory',
      description: 'Staff listing with roles and contact information',
      icon: Users,
      color: 'text-orange-600',
      pdfAction: undefined,
      excelAction: () => gen('emp-xlsx', async () => {
        const { data } = await supabase.from('profiles').select('*').neq('role', 'customer').order('role')
        generateExcel(formatEmployeesForExcel(data || []), `Employees_${format(new Date(), 'yyyy-MM-dd')}`)
        toast.success('Employee Excel generated')
      }),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Document Center</h1>
        <p className="text-muted-foreground">Generate and download PDF and Excel reports</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="grid gap-1">
              <Label className="text-xs">Date Range From</Label>
              <Input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="w-44" />
            </div>
            <div className="grid gap-1">
              <Label className="text-xs">Date Range To</Label>
              <Input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="w-44" />
            </div>
            <p className="text-sm text-muted-foreground">Date range applies to revenue, booking, and expense reports.</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {documents.map(doc => (
          <Card key={doc.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <doc.icon className={`h-8 w-8 ${doc.color}`} />
                <div>
                  <CardTitle className="text-base">{doc.title}</CardTitle>
                  <CardDescription>{doc.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {doc.pdfAction && (
                  <Button variant="outline" size="sm" onClick={doc.pdfAction} disabled={!!generating}>
                    {generating?.endsWith('pdf') && generating.startsWith(doc.title.substring(0, 3).toLowerCase()) ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    PDF
                  </Button>
                )}
                {doc.excelAction && (
                  <Button variant="outline" size="sm" onClick={doc.excelAction} disabled={!!generating}>
                    {generating?.endsWith('xlsx') ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Excel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}