'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { format, subDays, startOfDay, endOfMonth, startOfMonth } from 'date-fns'
import { safeFormatDate } from '@/lib/utils'
import { generateRevenueReport, generateInventoryReport, generateBookingReport, generateExpenseReport } from '@/lib/pdf/generate-pdf'
import { generateExcel, formatTransactionsForExcel, formatPrizesForExcel, formatBookingsForExcel, formatExpensesForExcel } from '@/lib/excel/generate-excel'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  BarChart3, FileText, Download, DollarSign, TrendingUp,
  Package, Calendar, Receipt
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const COLORS = ['#DC2626', '#2563EB', '#16A34A', '#D97706', '#7C3AED', '#EC4899']

export default function ReportsPage() {
  const supabase = createClient()
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  })
  const [revenueData, setRevenueData] = useState<any>({ total: 0, cash: 0, card: 0, count: 0, daily: [] })
  const [expenseData, setExpenseData] = useState<any[]>([])
  const [bookingData, setBookingData] = useState<any[]>([])
  const [prizeData, setPrizeData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadReportData() }, [dateRange])

  const loadReportData = async () => {
    setLoading(true)
    try {
      const [txRes, expRes, bkRes, prRes] = await Promise.all([
        supabase.from('token_transactions').select('*').gte('created_at', dateRange.from).lte('created_at', dateRange.to + 'T23:59:59'),
        supabase.from('expenses').select('*').gte('expense_date', dateRange.from).lte('expense_date', dateRange.to),
        supabase.from('party_bookings').select('*').gte('booking_date', dateRange.from).lte('booking_date', dateRange.to),
        supabase.from('prizes').select('*').order('name'),
      ])

      const tx = txRes.data || []
      const dailyMap: Record<string, { date: string; cash: number; card: number; total: number }> = {}
      tx.forEach(t => {
        const d = safeFormatDate(t.created_at, 'MMM dd', '')
        if (!d) return
        if (!dailyMap[d]) dailyMap[d] = { date: d, cash: 0, card: 0, total: 0 }
        const amt = Number(t.amount_paid)
        dailyMap[d].total += amt
        if (t.payment_type === 'cash') dailyMap[d].cash += amt
        else dailyMap[d].card += amt
      })

      setRevenueData({
        total: tx.reduce((s, t) => s + Number(t.amount_paid), 0),
        cash: tx.filter(t => t.payment_type === 'cash').reduce((s, t) => s + Number(t.amount_paid), 0),
        card: tx.filter(t => t.payment_type === 'card').reduce((s, t) => s + Number(t.amount_paid), 0),
        count: tx.length,
        daily: Object.values(dailyMap),
        raw: tx,
      })
      setExpenseData(expRes.data || [])
      setBookingData(bkRes.data || [])
      setPrizeData(prRes.data || [])
    } catch (err: any) {
      console.error('Failed to load report data:', err)
      toast.error(err?.message || 'Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  const totalExpenses = expenseData.reduce((s, e) => s + Number(e.amount), 0)
  const netProfit = revenueData.total - totalExpenses + bookingData.filter(b => b.status === 'completed').reduce((s: number, b: any) => s + Number(b.total_amount || 0), 0)

  const paymentPieData = [
    { name: 'Cash', value: revenueData.cash },
    { name: 'Card', value: revenueData.card },
  ].filter(d => d.value > 0)

  const expByCat = expenseData.reduce((acc: Record<string, number>, e: any) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {})
  const expensePieData = Object.entries(expByCat).map(([name, value]) => ({ name, value }))

  const downloadRevenuePdf = () => {
    const doc = generateRevenueReport({
      period: `${dateRange.from} to ${dateRange.to}`,
      totalRevenue: revenueData.total,
      cashRevenue: revenueData.cash,
      cardRevenue: revenueData.card,
      transactionCount: revenueData.count,
      dailyData: revenueData.daily,
    })
    doc.save(`Revenue_Report_${dateRange.from}_to_${dateRange.to}.pdf`)
    toast.success('Revenue PDF downloaded')
  }

  const downloadInventoryPdf = () => {
    const doc = generateInventoryReport(prizeData)
    doc.save(`Inventory_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
    toast.success('Inventory PDF downloaded')
  }

  const downloadBookingPdf = () => {
    const doc = generateBookingReport(bookingData)
    doc.save(`Booking_Report_${dateRange.from}_to_${dateRange.to}.pdf`)
    toast.success('Booking PDF downloaded')
  }

  const downloadExpensePdf = () => {
    const doc = generateExpenseReport(expenseData, `${dateRange.from} to ${dateRange.to}`)
    doc.save(`Expense_Report_${dateRange.from}_to_${dateRange.to}.pdf`)
    toast.success('Expense PDF downloaded')
  }

  const downloadRevenueExcel = () => {
    generateExcel(formatTransactionsForExcel(revenueData.raw || []), `Transactions_${dateRange.from}_to_${dateRange.to}`, 'Transactions')
    toast.success('Excel downloaded')
  }

  const downloadInventoryExcel = () => {
    generateExcel(formatPrizesForExcel(prizeData), `Inventory_${format(new Date(), 'yyyy-MM-dd')}`, 'Prizes')
    toast.success('Excel downloaded')
  }

  const downloadBookingExcel = () => {
    generateExcel(formatBookingsForExcel(bookingData), `Bookings_${dateRange.from}_to_${dateRange.to}`, 'Bookings')
    toast.success('Excel downloaded')
  }

  const downloadExpenseExcel = () => {
    generateExcel(formatExpensesForExcel(expenseData), `Expenses_${dateRange.from}_to_${dateRange.to}`, 'Expenses')
    toast.success('Excel downloaded')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Skeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Comprehensive business reports with PDF and Excel export</p>
        </div>
        <div className="flex gap-2 items-end">
          <div className="grid gap-1">
            <Label className="text-xs font-medium">From</Label>
            <Input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="w-40 rounded-xl" />
          </div>
          <div className="grid gap-1">
            <Label className="text-xs font-medium">To</Label>
            <Input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="w-40 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-ambient"><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Revenue</CardTitle></CardHeader><CardContent><div className="flex items-end justify-between"><div className="font-display text-3xl font-bold text-emerald-600">{currency(revenueData.total)}</div><div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><DollarSign className="h-5 w-5" /></div></div></CardContent></Card>
        <Card className="rounded-2xl shadow-ambient"><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Expenses</CardTitle></CardHeader><CardContent><div className="flex items-end justify-between"><div className="font-display text-3xl font-bold text-destructive">{currency(totalExpenses)}</div><div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><Receipt className="h-5 w-5" /></div></div></CardContent></Card>
        <Card className="rounded-2xl shadow-ambient"><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Net Profit</CardTitle></CardHeader><CardContent><div className="flex items-end justify-between"><div className={`font-display text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>{currency(netProfit)}</div><div className={`flex size-10 items-center justify-center rounded-xl ${netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}><TrendingUp className="h-5 w-5" /></div></div></CardContent></Card>
        <Card className="rounded-2xl shadow-ambient"><CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Bookings</CardTitle></CardHeader><CardContent><div className="flex items-end justify-between"><div className="font-display text-3xl font-bold">{bookingData.length}</div><div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600"><Calendar className="h-5 w-5" /></div></div></CardContent></Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="flex-wrap rounded-xl">
          <TabsTrigger value="revenue" className="rounded-lg"><DollarSign className="mr-1 h-4 w-4" />Revenue</TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-lg"><Package className="mr-1 h-4 w-4" />Inventory</TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-lg"><Calendar className="mr-1 h-4 w-4" />Bookings</TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-lg"><Receipt className="mr-1 h-4 w-4" />Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadRevenuePdf}><FileText className="mr-2 h-4 w-4" />Download PDF</Button>
            <Button variant="outline" onClick={downloadRevenueExcel}><Download className="mr-2 h-4 w-4" />Download Excel</Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-2xl shadow-ambient">
              <CardHeader><CardTitle className="font-display font-bold tracking-tight">Daily Revenue</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={11} />
                    <YAxis fontSize={11} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v) => currency(Number(v))} />
                    <Bar dataKey="cash" fill="#16A34A" name="Cash" stackId="a" />
                    <Bar dataKey="card" fill="#2563EB" name="Card" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-ambient">
              <CardHeader><CardTitle className="font-display font-bold tracking-tight">Payment Breakdown</CardTitle></CardHeader>
              <CardContent>
                {paymentPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={paymentPieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                        {paymentPieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(v) => currency(Number(v))} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-12">No data for this period</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadInventoryPdf}><FileText className="mr-2 h-4 w-4" />Download PDF</Button>
            <Button variant="outline" onClick={downloadInventoryExcel}><Download className="mr-2 h-4 w-4" />Download Excel</Button>
          </div>
          <Card className="rounded-2xl shadow-ambient">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 rounded-2xl bg-[var(--surface-container-low)]"><div className="font-display text-2xl font-bold text-emerald-600">{prizeData.filter(p => p.stock_quantity > p.reorder_threshold).length}</div><p className="text-sm text-muted-foreground">In Stock</p></div>
                <div className="text-center p-4 rounded-2xl bg-[var(--surface-container-low)]"><div className="font-display text-2xl font-bold text-amber-600">{prizeData.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.reorder_threshold).length}</div><p className="text-sm text-muted-foreground">Low Stock</p></div>
                <div className="text-center p-4 rounded-2xl bg-[var(--surface-container-low)]"><div className="font-display text-2xl font-bold text-destructive">{prizeData.filter(p => p.stock_quantity === 0).length}</div><p className="text-sm text-muted-foreground">Out of Stock</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadBookingPdf}><FileText className="mr-2 h-4 w-4" />Download PDF</Button>
            <Button variant="outline" onClick={downloadBookingExcel}><Download className="mr-2 h-4 w-4" />Download Excel</Button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {['pending', 'confirmed', 'completed', 'cancelled'].map(s => (
              <Card key={s} className="rounded-2xl shadow-ambient">
                <CardContent className="pt-4 text-center">
                  <div className="font-display text-2xl font-bold">{bookingData.filter(b => b.status === s).length}</div>
                  <p className="text-sm text-muted-foreground capitalize">{s}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadExpensePdf}><FileText className="mr-2 h-4 w-4" />Download PDF</Button>
            <Button variant="outline" onClick={downloadExpenseExcel}><Download className="mr-2 h-4 w-4" />Download Excel</Button>
          </div>
          <Card className="rounded-2xl shadow-ambient">
            <CardHeader><CardTitle className="font-display font-bold tracking-tight">Expenses by Category</CardTitle></CardHeader>
            <CardContent>
              {expensePieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={expensePieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                      {expensePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(v) => currency(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted-foreground py-12">No expense data for this period</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
