'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { EXPENSE_CATEGORIES } from '@/lib/constants'
import { toast } from 'sonner'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Receipt, Plus, DollarSign, Banknote, CreditCard } from 'lucide-react'

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const emptyExpense = {
  description: '', amount: '', category: 'maintenance', payment_method: 'cash', expense_date: format(new Date(), 'yyyy-MM-dd'),
}

export default function ExpensesPage() {
  const { user, isOwner } = useAuth()
  const supabase = createClient()
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(emptyExpense)
  const [saving, setSaving] = useState(false)
  const [monthFilter, setMonthFilter] = useState(format(new Date(), 'yyyy-MM'))

  useEffect(() => { loadExpenses() }, [monthFilter])

  const loadExpenses = async () => {
    const start = `${monthFilter}-01`
    const end = format(endOfMonth(new Date(start)), 'yyyy-MM-dd')
    const { data } = await supabase.from('expenses').select('*')
      .gte('expense_date', start).lte('expense_date', end)
      .order('expense_date', { ascending: false })
    setExpenses(data || [])
    setLoading(false)
  }

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const cashExpenses = expenses.filter(e => e.payment_method === 'cash').reduce((s, e) => s + Number(e.amount), 0)
  const cardExpenses = expenses.filter(e => e.payment_method === 'card').reduce((s, e) => s + Number(e.amount), 0)

  const byCategory = EXPENSE_CATEGORIES.map(c => ({
    ...c,
    total: expenses.filter(e => e.category === c.value).reduce((s, e) => s + Number(e.amount), 0),
  }))

  const saveExpense = async () => {
    if (!form.description || !form.amount) { toast.error('Description and amount required'); return }
    setSaving(true)
    try {
      const { error } = await supabase.from('expenses').insert({
        ...form,
        amount: parseFloat(form.amount),
        recorded_by: user?.id,
      })
      if (error) throw error
      toast.success('Expense recorded')
      setDialogOpen(false)
      setForm(emptyExpense)
      loadExpenses()
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Expense Tracking</h1>
          <p className="text-muted-foreground">Log and monitor business expenses</p>
        </div>
        <div className="flex gap-2">
          <Input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="w-44" />
          <Button onClick={() => { setForm(emptyExpense); setDialogOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />Add Expense
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Expenses</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{currency(totalExpenses)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><Banknote className="h-4 w-4" />Cash</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{currency(cashExpenses)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-1"><CreditCard className="h-4 w-4" />Card</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{currency(cardExpenses)}</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {byCategory.map(c => (
          <Card key={c.value}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{c.label}</p>
              <p className="text-lg font-bold">{currency(c.total)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No expenses this month</TableCell></TableRow>
              ) : expenses.map(e => (
                <TableRow key={e.id}>
                  <TableCell>{format(new Date(e.expense_date), 'MMM dd')}</TableCell>
                  <TableCell className="font-medium">{e.description}</TableCell>
                  <TableCell><Badge variant="outline">{e.category}</Badge></TableCell>
                  <TableCell><Badge variant={e.payment_method === 'cash' ? 'secondary' : 'outline'}>{e.payment_method}</Badge></TableCell>
                  <TableCell className="text-right font-medium">{currency(e.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
            <DialogDescription>Log a new business expense.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Description *</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Amount *</Label><Input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EXPENSE_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Payment Method</Label>
                <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Date</Label><Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveExpense} disabled={saving}>{saving ? 'Saving...' : 'Record Expense'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}