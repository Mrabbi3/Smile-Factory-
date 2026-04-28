'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { EXPENSE_CATEGORIES } from '@/lib/constants'
import { safeFormatDate, currency, cn } from '@/lib/utils'
import type { Expense, ExpenseCategory, PaymentType } from '@/types/database'
import { toast } from 'sonner'
import { Receipt } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RoleGuard } from '@/components/admin/role-guard'

function toAmount(n: unknown): number {
  if (typeof n === 'number' && !Number.isNaN(n)) return n
  const parsed = Number(n)
  return Number.isFinite(parsed) ? parsed : 0
}

const CATEGORY_LABEL = Object.fromEntries(
  EXPENSE_CATEGORIES.map((c) => [c.value, c.label])
) as Record<ExpenseCategory, string>

const PAYMENT_LABEL: Record<PaymentType, string> = {
  cash: 'Cash',
  card: 'Card',
}

const CATEGORY_BADGE: Record<ExpenseCategory, string> = {
  maintenance: 'border-amber-200/80 bg-amber-50 text-amber-950',
  supplies: 'border-sky-200/80 bg-sky-50 text-sky-950',
  prizes: 'border-fuchsia-200/80 bg-fuchsia-50 text-fuchsia-950',
  utilities: 'border-violet-200/80 bg-violet-50 text-violet-950',
  other: 'border-gray-200/80 bg-gray-50 text-gray-900',
}

export default function AdminExpensesPage() {
  return (
    <RoleGuard allow={['owner']} reason="Expenses are tracked by the business owner only.">
      <AdminExpensesPageInner />
    </RoleGuard>
  )
}

function AdminExpensesPageInner() {
  const { user, loading: authLoading, isManager } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'maintenance' as ExpenseCategory,
    payment_method: 'cash' as PaymentType,
    expense_date: new Date().toISOString().slice(0, 10),
  })

  const canManage = isManager()

  const loadExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false })

      if (error) throw error
      setExpenses((data as Expense[]) ?? [])
    } catch (err) {
      console.error('Expenses load error:', err)
      toast.error('Failed to load expenses')
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (authLoading) return
    if (!canManage) {
      setLoading(false)
      return
    }
    loadExpenses()
  }, [authLoading, canManage, loadExpenses])

  const totals = useMemo(() => {
    let total = 0
    const byCategory: Record<ExpenseCategory, number> = {
      maintenance: 0,
      supplies: 0,
      prizes: 0,
      utilities: 0,
      other: 0,
    }
    for (const e of expenses) {
      const amt = toAmount(e.amount)
      total += amt
      if (e.category in byCategory) {
        byCategory[e.category as ExpenseCategory] += amt
      }
    }
    return { total, byCategory }
  }, [expenses])

  const resetForm = () => {
    setForm({
      description: '',
      amount: '',
      category: 'maintenance',
      payment_method: 'cash',
      expense_date: new Date().toISOString().slice(0, 10),
    })
  }

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      toast.error('You must be signed in')
      return
    }
    const description = form.description.trim()
    if (!description) {
      toast.error('Description is required')
      return
    }
    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid amount greater than zero')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.from('expenses').insert({
        description,
        amount,
        category: form.category,
        payment_method: form.payment_method,
        recorded_by: user.id,
        expense_date: form.expense_date,
        receipt_url: null,
      })
      if (error) throw error
      toast.success('Expense recorded')
      resetForm()
      setAddOpen(false)
      await loadExpenses()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not add expense'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || (loading && canManage && expenses.length === 0)) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Skeleton className="h-12 w-72 max-w-full rounded-xl" />
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Receipt className="size-7" aria-hidden />
              </div>
              <h1 className="font-display text-4xl font-black tracking-tight lg:text-5xl">
                Expenses
              </h1>
            </div>
            <p className="max-w-2xl text-lg font-medium text-gray-500">
              Track operating costs, supplies, and other business spending.
            </p>
          </div>
        </header>
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardContent className="py-12 text-center">
            <p className="font-display text-lg font-black tracking-tight text-gray-800">
              Restricted area
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Only owners and managers can view and record expenses.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Receipt className="size-7" aria-hidden />
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight lg:text-5xl">
              Expenses
            </h1>
          </div>
          <p className="max-w-2xl text-lg font-medium text-gray-500">
            Track operating costs, supplies, utilities, and other business spending.
          </p>
        </div>

        <Dialog
          open={addOpen}
          onOpenChange={(open) => {
            setAddOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button
              type="button"
              className="shrink-0 rounded-xl font-black uppercase tracking-widest"
            >
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-black tracking-tight">
                Add expense
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expense-description">Description</Label>
                <Input
                  id="expense-description"
                  value={form.description}
                  onChange={(ev) =>
                    setForm((f) => ({ ...f, description: ev.target.value }))
                  }
                  placeholder="e.g. HVAC filter replacement"
                  className="rounded-xl"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount</Label>
                <Input
                  id="expense-amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(ev) =>
                    setForm((f) => ({ ...f, amount: ev.target.value }))
                  }
                  placeholder="0.00"
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, category: v as ExpenseCategory }))
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {EXPENSE_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment method</Label>
                  <Select
                    value={form.payment_method}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, payment_method: v as PaymentType }))
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-date">Expense date</Label>
                <Input
                  id="expense-date"
                  type="date"
                  value={form.expense_date}
                  onChange={(ev) =>
                    setForm((f) => ({ ...f, expense_date: ev.target.value }))
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl font-semibold"
                  onClick={() => {
                    setAddOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl font-black uppercase tracking-widest"
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm font-black uppercase tracking-widest text-gray-500">
              Total expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-black tracking-tight text-gray-900">
              {currency(totals.total)}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {expenses.length} {expenses.length === 1 ? 'entry' : 'entries'}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm font-black uppercase tracking-widest text-gray-500">
              By category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {EXPENSE_CATEGORIES.map((c) => (
                <div
                  key={c.value}
                  className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2"
                >
                  <span className="text-sm font-semibold text-gray-700">
                    {c.label}
                  </span>
                  <span className="font-mono text-sm font-bold tabular-nums text-gray-900">
                    {currency(totals.byCategory[c.value as ExpenseCategory])}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-lg font-black tracking-tight">
            All expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
              <Receipt className="size-10 text-gray-300" aria-hidden />
              <p className="font-display font-black tracking-tight text-gray-700">
                No expenses yet
              </p>
              <p className="max-w-sm text-sm text-gray-500">
                Record your first expense to see it listed here with totals and
                category breakdown.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto px-2 pb-4 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100 hover:bg-transparent">
                    <TableHead className="font-display font-black tracking-tight">
                      Date
                    </TableHead>
                    <TableHead className="font-display font-black tracking-tight">
                      Description
                    </TableHead>
                    <TableHead className="text-right font-display font-black tracking-tight">
                      Amount
                    </TableHead>
                    <TableHead className="font-display font-black tracking-tight">
                      Category
                    </TableHead>
                    <TableHead className="font-display font-black tracking-tight">
                      Payment
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-gray-100/80 hover:bg-gray-50/80"
                    >
                      <TableCell className="whitespace-nowrap text-gray-700">
                        {safeFormatDate(row.expense_date, 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate font-medium text-gray-900 sm:max-w-md">
                        {row.description}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold tabular-nums text-gray-900">
                        {currency(toAmount(row.amount))}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'rounded-lg font-semibold',
                            CATEGORY_BADGE[row.category]
                          )}
                        >
                          {CATEGORY_LABEL[row.category] ?? row.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="rounded-lg font-medium capitalize"
                        >
                          {PAYMENT_LABEL[row.payment_method] ??
                            row.payment_method}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
