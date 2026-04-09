'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { currency, safeFormatDate } from '@/lib/utils'
import type { DailyRevenue, Expense } from '@/types/database'
import {
  startOfDay,
  subDays,
  format,
  eachDayOfInterval,
  parseISO,
} from 'date-fns'
import { toast } from 'sonner'
import {
  BarChart3,
  Banknote,
  CreditCard,
  TrendingDown,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  FileJson,
  Download,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { generateRevenueReport, generateExpenseReport } from '@/lib/pdf/generate-pdf'
import { generateMultiSheetExcel, formatExpensesForExcel } from '@/lib/excel/generate-excel'

type RangePreset = '7' | '30' | '90' | 'custom'

type ChartRow = {
  label: string
  dateKey: string
  revenue: number
}

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [preset, setPreset] = useState<RangePreset>('30')
  const [customStart, setCustomStart] = useState(() =>
    format(subDays(new Date(), 30), 'yyyy-MM-dd')
  )
  const [customEnd, setCustomEnd] = useState(() => format(new Date(), 'yyyy-MM-dd'))

  const [dailyRows, setDailyRows] = useState<DailyRevenue[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  const { rangeFrom, rangeTo, fromStr, toStr } = useMemo(() => {
    const end = startOfDay(new Date())
    if (preset === 'custom') {
      const a = startOfDay(parseISO(`${customStart}T12:00:00`))
      const b = startOfDay(parseISO(`${customEnd}T12:00:00`))
      const from = a <= b ? a : b
      const to = a <= b ? b : a
      return {
        rangeFrom: from,
        rangeTo: to,
        fromStr: format(from, 'yyyy-MM-dd'),
        toStr: format(to, 'yyyy-MM-dd'),
      }
    }
    const days = preset === '7' ? 7 : preset === '30' ? 30 : 90
    const from = startOfDay(subDays(end, days - 1))
    return {
      rangeFrom: from,
      rangeTo: end,
      fromStr: format(from, 'yyyy-MM-dd'),
      toStr: format(end, 'yyyy-MM-dd'),
    }
  }, [preset, customStart, customEnd])

  const loadData = useCallback(async () => {
    if (!user) return

    if (preset === 'custom') {
      const a = parseISO(`${customStart}T12:00:00`)
      const b = parseISO(`${customEnd}T12:00:00`)
      if (a > b) {
        toast.error('Custom range: start date must be on or before end date.')
        return
      }
    }

    setLoading(true)
    try {
      const [revRes, expRes] = await Promise.all([
        supabase
          .from('daily_revenue')
          .select('*')
          .gte('date', fromStr)
          .lte('date', toStr)
          .order('date', { ascending: true }),
        supabase
          .from('expenses')
          .select('*')
          .gte('expense_date', fromStr)
          .lte('expense_date', toStr),
      ])

      if (revRes.error) {
        console.error('daily_revenue fetch:', revRes.error)
        toast.error(revRes.error.message || 'Could not load revenue data.')
        setDailyRows([])
      } else {
        setDailyRows((revRes.data as DailyRevenue[]) || [])
      }

      if (expRes.error) {
        console.error('expenses fetch:', expRes.error)
        toast.error(expRes.error.message || 'Could not load expenses.')
        setExpenses([])
      } else {
        setExpenses((expRes.data as Expense[]) || [])
      }
    } catch (e) {
      console.error('Reports load error:', e)
      toast.error('Failed to load reports.')
    } finally {
      setLoading(false)
    }
  }, [user, supabase, fromStr, toStr, preset, customStart, customEnd])

  useEffect(() => {
    if (!authLoading && user) {
      void loadData()
    }
  }, [authLoading, user, loadData])

  const byDate = useMemo(() => {
    const m = new Map<string, DailyRevenue>()
    dailyRows.forEach((row) => m.set(row.date, row))
    return m
  }, [dailyRows])

  const chartData: ChartRow[] = useMemo(() => {
    const days = eachDayOfInterval({ start: rangeFrom, end: rangeTo })
    return days.map((d) => {
      const key = format(d, 'yyyy-MM-dd')
      const row = byDate.get(key)
      return {
        label: format(d, 'MMM d'),
        dateKey: key,
        revenue: row ? Number(row.total_revenue) : 0,
      }
    })
  }, [rangeFrom, rangeTo, byDate])

  const totals = useMemo(() => {
    let totalRevenue = 0
    let totalCash = 0
    let totalCard = 0
    let tokenSales = 0
    let prizeRedemptions = 0
    dailyRows.forEach((r) => {
      totalRevenue += Number(r.total_revenue)
      totalCash += Number(r.total_cash)
      totalCard += Number(r.total_card)
      tokenSales += r.token_sales_count
      prizeRedemptions += r.prize_redemptions_count
    })
    const totalTransactions = tokenSales + prizeRedemptions
    const avgTx =
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0
    const paymentTotal = totalCash + totalCard
    const cashPct = paymentTotal > 0 ? (totalCash / paymentTotal) * 100 : 0
    const cardPct = paymentTotal > 0 ? (totalCard / paymentTotal) * 100 : 0
    return {
      totalRevenue,
      totalCash,
      totalCard,
      tokenSales,
      prizeRedemptions,
      totalTransactions,
      avgTx,
      cashPct,
      cardPct,
    }
  }, [dailyRows])

  const expenseTotal = useMemo(
    () => expenses.reduce((s, e) => s + Number(e.amount), 0),
    [expenses]
  )

  const expensesByCategory = useMemo(() => {
    const m = new Map<string, number>()
    expenses.forEach((e) => {
      const k = e.category
      m.set(k, (m.get(k) || 0) + Number(e.amount))
    })
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [expenses])

  const netProfit = totals.totalRevenue - expenseTotal

  const periodLabel = `${safeFormatDate(fromStr, 'MMM d, yyyy')} – ${safeFormatDate(toStr, 'MMM d, yyyy')}`

  const handleExportPDF = () => {
    if (dailyRows.length === 0 && expenses.length === 0) {
      toast.error('No data to export.')
      return
    }
    try {
      const revDoc = generateRevenueReport({
        period: periodLabel,
        totalRevenue: totals.totalRevenue,
        cashRevenue: totals.totalCash,
        cardRevenue: totals.totalCard,
        transactionCount: totals.totalTransactions,
        dailyData: dailyRows.map((r) => ({
          date: safeFormatDate(r.date, 'MMM d, yyyy'),
          cash: Number(r.total_cash),
          card: Number(r.total_card),
          total: Number(r.total_revenue),
        })),
      })

      if (expenses.length > 0) {
        const expDoc = generateExpenseReport(
          expenses.map((e) => ({
            expense_date: safeFormatDate(e.expense_date, 'MMM d, yyyy'),
            description: e.description,
            category: e.category,
            payment_method: e.payment_method,
            amount: Number(e.amount),
          })),
          periodLabel
        )
        expDoc.save(`smile-factory-expenses-${fromStr}-to-${toStr}.pdf`)
      }

      revDoc.save(`smile-factory-revenue-${fromStr}-to-${toStr}.pdf`)
      toast.success('PDF report(s) downloaded!')
    } catch (err) {
      console.error('PDF export error:', err)
      toast.error('Failed to generate PDF.')
    }
  }

  const handleExportExcel = () => {
    if (dailyRows.length === 0 && expenses.length === 0) {
      toast.error('No data to export.')
      return
    }
    try {
      const sheets: { name: string; data: Record<string, unknown>[] }[] = []

      if (dailyRows.length > 0) {
        sheets.push({
          name: 'Revenue',
          data: dailyRows.map((r) => ({
            Date: safeFormatDate(r.date, 'yyyy-MM-dd'),
            'Total Revenue': Number(r.total_revenue),
            Cash: Number(r.total_cash),
            Card: Number(r.total_card),
            'Token Sales': r.token_sales_count,
            'Prize Redemptions': r.prize_redemptions_count,
          })),
        })
      }

      if (expenses.length > 0) {
        sheets.push({
          name: 'Expenses',
          data: formatExpensesForExcel(expenses),
        })
      }

      sheets.push({
        name: 'Summary',
        data: [
          {
            Metric: 'Total Revenue',
            Value: totals.totalRevenue,
          },
          { Metric: 'Cash Revenue', Value: totals.totalCash },
          { Metric: 'Card Revenue', Value: totals.totalCard },
          { Metric: 'Total Transactions', Value: totals.totalTransactions },
          { Metric: 'Token Sales', Value: totals.tokenSales },
          { Metric: 'Prize Redemptions', Value: totals.prizeRedemptions },
          { Metric: 'Total Expenses', Value: expenseTotal },
          { Metric: 'Net Profit', Value: netProfit },
        ],
      })

      generateMultiSheetExcel(sheets, `smile-factory-report-${fromStr}-to-${toStr}`)
      toast.success('Excel report downloaded!')
    } catch (err) {
      console.error('Excel export error:', err)
      toast.error('Failed to generate Excel file.')
    }
  }

  const handleExportJSON = () => {
    if (dailyRows.length === 0 && expenses.length === 0) {
      toast.error('No data to export.')
      return
    }
    try {
      const report = {
        generatedAt: new Date().toISOString(),
        period: { from: fromStr, to: toStr },
        summary: {
          totalRevenue: totals.totalRevenue,
          cashRevenue: totals.totalCash,
          cardRevenue: totals.totalCard,
          totalTransactions: totals.totalTransactions,
          tokenSales: totals.tokenSales,
          prizeRedemptions: totals.prizeRedemptions,
          averageTransaction: totals.avgTx,
          totalExpenses: expenseTotal,
          netProfit,
        },
        dailyRevenue: dailyRows.map((r) => ({
          date: r.date,
          totalRevenue: Number(r.total_revenue),
          cash: Number(r.total_cash),
          card: Number(r.total_card),
          tokenSales: r.token_sales_count,
          prizeRedemptions: r.prize_redemptions_count,
        })),
        expenses: expenses.map((e) => ({
          date: e.expense_date,
          description: e.description,
          category: e.category,
          paymentMethod: e.payment_method,
          amount: Number(e.amount),
        })),
      }

      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `smile-factory-report-${fromStr}-to-${toStr}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('JSON report downloaded!')
    } catch (err) {
      console.error('JSON export error:', err)
      toast.error('Failed to generate JSON file.')
    }
  }

  if (authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-72 rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <Card className="max-w-lg rounded-2xl border border-gray-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl font-black tracking-tight">
            Sign in required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          You must be signed in as staff to view financial reports.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <BarChart3 className="size-8" strokeWidth={2.5} />
            <span className="font-display text-xs font-black uppercase tracking-widest">
              Analytics
            </span>
          </div>
          <h1 className="font-display text-4xl font-black tracking-tight lg:text-5xl">
            Reports
          </h1>
          <p className="mt-2 max-w-2xl text-lg font-medium text-gray-500">
            Revenue, payment mix, and expenses for{' '}
            <span className="text-gray-800">
              {safeFormatDate(fromStr, 'MMM d, yyyy')} –{' '}
              {safeFormatDate(toStr, 'MMM d, yyyy')}
            </span>
            .
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['7', '7 days'],
                ['30', '30 days'],
                ['90', '90 days'],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                variant={preset === value ? 'default' : 'outline'}
                size="sm"
                className="rounded-full font-black"
                onClick={() => setPreset(value)}
              >
                {label}
              </Button>
            ))}
            <Button
              type="button"
              variant={preset === 'custom' ? 'default' : 'outline'}
              size="sm"
              className="rounded-full font-black"
              onClick={() => setPreset('custom')}
            >
              Custom
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="rounded-full font-black"
              onClick={() => void loadData()}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
            <span className="pl-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Download className="inline size-3.5" /> Export
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full font-black text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleExportPDF}
              disabled={loading || (dailyRows.length === 0 && expenses.length === 0)}
              title="Download PDF report"
            >
              <FileText className="mr-1 size-4" />
              PDF
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full font-black text-green-600 hover:bg-green-50 hover:text-green-700"
              onClick={handleExportExcel}
              disabled={loading || (dailyRows.length === 0 && expenses.length === 0)}
              title="Download Excel spreadsheet"
            >
              <FileSpreadsheet className="mr-1 size-4" />
              Excel
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full font-black text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              onClick={handleExportJSON}
              disabled={loading || (dailyRows.length === 0 && expenses.length === 0)}
              title="Download JSON data"
            >
              <FileJson className="mr-1 size-4" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      {preset === 'custom' && (
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardContent className="flex flex-wrap items-end gap-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="rep-from" className="text-xs font-black uppercase tracking-wider">
                From
              </Label>
              <Input
                id="rep-from"
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="rounded-xl font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rep-to" className="text-xs font-black uppercase tracking-wider">
                To
              </Label>
              <Input
                id="rep-to"
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="rounded-xl font-medium"
              />
            </div>
            <Button
              type="button"
              className="rounded-full font-black"
              onClick={() => void loadData()}
              disabled={loading}
            >
              Apply range
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                  Total revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black tracking-tight">
                  {currency(totals.totalRevenue)}
                </p>
                <p className="mt-1 text-xs font-medium text-gray-500">
                  From daily summaries in range
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                  Total transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black tracking-tight">
                  {totals.totalTransactions.toLocaleString()}
                </p>
                <p className="mt-1 text-xs font-medium text-gray-500">
                  {totals.tokenSales.toLocaleString()} sales ·{' '}
                  {totals.prizeRedemptions.toLocaleString()} prize redemptions
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                  Avg. transaction value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black tracking-tight">
                  {totals.totalTransactions > 0
                    ? currency(totals.avgTx)
                    : '—'}
                </p>
                <p className="mt-1 text-xs font-medium text-gray-500">
                  Revenue ÷ (sales + redemptions)
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                  Net profit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-3xl font-black tracking-tight ${
                    netProfit >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {currency(netProfit)}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-gray-500">
                  {netProfit >= 0 ? (
                    <TrendingUp className="size-3.5 text-green-600" />
                  ) : (
                    <TrendingDown className="size-3.5 text-red-600" />
                  )}
                  Revenue minus expenses in range
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg font-black tracking-tight">
                  Cash vs card
                </CardTitle>
                <p className="text-sm font-medium text-gray-500">
                  Totals from <code className="text-xs">daily_revenue</code> rows
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50/80 p-4">
                  <div className="flex items-center gap-3">
                    <Banknote className="size-8 text-green-600" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                        Cash
                      </p>
                      <p className="text-xl font-black">{currency(totals.totalCash)}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-black">
                    {totals.totalCash + totals.totalCard > 0
                      ? `${totals.cashPct.toFixed(1)}%`
                      : '—'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl bg-gray-50/80 p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="size-8 text-blue-600" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                        Card
                      </p>
                      <p className="text-xl font-black">{currency(totals.totalCard)}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-black">
                    {totals.totalCash + totals.totalCard > 0
                      ? `${totals.cardPct.toFixed(1)}%`
                      : '—'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg font-black tracking-tight">
                  Expense summary
                </CardTitle>
                <p className="text-sm font-medium text-gray-500">
                  {expenses.length} line item{expenses.length === 1 ? '' : 's'} ·{' '}
                  <span className="font-black text-gray-800">
                    {currency(expenseTotal)}
                  </span>{' '}
                  total
                </p>
              </CardHeader>
              <CardContent>
                {expensesByCategory.length === 0 ? (
                  <p className="text-sm font-medium text-gray-500">
                    No expenses recorded for this period.
                  </p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {expensesByCategory.map(([cat, amt]) => (
                      <li key={cat}>
                        <Badge
                          variant="outline"
                          className="rounded-full px-3 py-1 font-black capitalize"
                        >
                          {cat}: {currency(amt)}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="font-display text-xl font-black tracking-tight">
                  Daily revenue
                </CardTitle>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  One bar per day; missing days show as zero.
                </p>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="h-[320px] w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fontWeight: 800 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      formatter={(value) => currency(Number(value ?? 0))}
                      labelFormatter={(label, payload) => {
                        const dateKey = payload?.[0]?.payload?.dateKey as
                          | string
                          | undefined
                        return dateKey
                          ? safeFormatDate(dateKey, 'MMM d, yyyy')
                          : String(label ?? '')
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#bb0100"
                      radius={[8, 8, 0, 0]}
                      name="Revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {dailyRows.length > 0 && (
            <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg font-black tracking-tight">
                  Daily detail
                </CardTitle>
                <p className="text-sm font-medium text-gray-500">
                  Rows from <code className="text-xs">daily_revenue</code> in range
                </p>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Revenue</th>
                      <th className="pb-3 pr-4">Cash</th>
                      <th className="pb-3 pr-4">Card</th>
                      <th className="pb-3 pr-4">Sales</th>
                      <th className="pb-3">Redemptions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-50 font-medium last:border-0"
                      >
                        <td className="py-3 pr-4">
                          {safeFormatDate(row.date, 'MMM d, yyyy')}
                        </td>
                        <td className="py-3 pr-4 font-black">
                          {currency(Number(row.total_revenue))}
                        </td>
                        <td className="py-3 pr-4">
                          {currency(Number(row.total_cash))}
                        </td>
                        <td className="py-3 pr-4">
                          {currency(Number(row.total_card))}
                        </td>
                        <td className="py-3 pr-4">{row.token_sales_count}</td>
                        <td className="py-3">{row.prize_redemptions_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
