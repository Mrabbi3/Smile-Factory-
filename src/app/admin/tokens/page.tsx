'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { safeFormatDate, currency } from '@/lib/utils'
import type { TokenTransaction } from '@/types/database'
import { startOfDay } from 'date-fns'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PaymentType } from '@/types/database'
import { Calendar, Coins, DollarSign, Loader2, Pencil, Receipt, Trash2 } from 'lucide-react'

const PAGE_SIZE = 25

export default function AdminTokensPage() {
  const { loading: authLoading, isManager } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const canManage = isManager()

  const [transactions, setTransactions] = useState<TokenTransaction[]>([])
  const [stats, setStats] = useState({
    totalCount: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const [editTarget, setEditTarget] = useState<TokenTransaction | null>(null)
  const [editForm, setEditForm] = useState({
    amount_paid: '',
    tokens_given: '',
    payment_type: 'cash' as PaymentType,
  })
  const [editSaving, setEditSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<TokenTransaction | null>(null)
  const [deleting, setDeleting] = useState(false)

  const sumAmountPaid = (rows: { amount_paid: number | string }[] | null) =>
    (rows ?? []).reduce((s, r) => s + Number(r.amount_paid ?? 0), 0)

  const fetchStats = useCallback(async () => {
    const todayStart = startOfDay(new Date()).toISOString()

    const [countRes, allPaidRes, todayRes] = await Promise.all([
      supabase.from('token_transactions').select('id', { count: 'exact', head: true }),
      supabase.from('token_transactions').select('amount_paid'),
      supabase
        .from('token_transactions')
        .select('amount_paid')
        .gte('created_at', todayStart),
    ])

    if (countRes.error) throw countRes.error
    if (allPaidRes.error) throw allPaidRes.error
    if (todayRes.error) throw todayRes.error

    setStats({
      totalCount: countRes.count ?? 0,
      totalRevenue: sumAmountPaid(allPaidRes.data),
      todayRevenue: sumAmountPaid(todayRes.data),
    })
  }, [supabase])

  const fetchPage = useCallback(
    async (from: number) => {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1)

      if (error) throw error
      return (data ?? []) as TokenTransaction[]
    },
    [supabase]
  )

  useEffect(() => {
    if (authLoading) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      try {
        await fetchStats()
        if (cancelled) return
        const first = await fetchPage(0)
        if (cancelled) return
        setTransactions(first)
        setHasMore(first.length === PAGE_SIZE)
      } catch (err) {
        console.error('Token transactions load error:', err)
        toast.error('Failed to load token transactions')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [authLoading, fetchStats, fetchPage])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const next = await fetchPage(transactions.length)
      setTransactions((prev) => [...prev, ...next])
      setHasMore(next.length === PAGE_SIZE)
    } catch (err) {
      console.error('Load more token transactions error:', err)
      toast.error('Failed to load more transactions')
    } finally {
      setLoadingMore(false)
    }
  }

  const openEdit = (tx: TokenTransaction) => {
    setEditTarget(tx)
    setEditForm({
      amount_paid: String(tx.amount_paid),
      tokens_given: String(tx.tokens_given),
      payment_type: tx.payment_type,
    })
  }

  const saveEdit = async () => {
    if (!editTarget) return
    const amount = Number(editForm.amount_paid)
    const tokens = Number(editForm.tokens_given)
    if (!Number.isFinite(amount) || amount < 0) {
      toast.error('Enter a valid amount paid')
      return
    }
    if (!Number.isInteger(tokens) || tokens < 0) {
      toast.error('Enter a valid token count')
      return
    }
    setEditSaving(true)
    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .update({
          amount_paid: amount,
          tokens_given: tokens,
          payment_type: editForm.payment_type,
        })
        .eq('id', editTarget.id)
        .select('*')
        .single()

      if (error) throw error
      if (data) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === editTarget.id ? (data as TokenTransaction) : t))
        )
      }
      await fetchStats()
      toast.success('Transaction updated')
      setEditTarget(null)
    } catch (err) {
      console.error('Token transaction update error:', err)
      toast.error(err instanceof Error ? err.message : 'Could not update transaction')
    } finally {
      setEditSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('token_transactions')
        .delete()
        .eq('id', deleteTarget.id)

      if (error) throw error
      setTransactions((prev) => prev.filter((t) => t.id !== deleteTarget.id))
      await fetchStats()
      toast.success('Transaction deleted')
      setDeleteTarget(null)
    } catch (err) {
      console.error('Token transaction delete error:', err)
      toast.error(err instanceof Error ? err.message : 'Could not delete transaction')
    } finally {
      setDeleting(false)
    }
  }

  const statCards = [
    {
      title: 'Total transactions',
      value: stats.totalCount.toLocaleString(),
      icon: Receipt,
    },
    {
      title: 'Total revenue',
      value: currency(stats.totalRevenue),
      icon: DollarSign,
    },
    {
      title: "Today's revenue",
      value: currency(stats.todayRevenue),
      icon: Calendar,
    },
  ]

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-64 max-w-full rounded-lg" />
          <Skeleton className="mt-2 h-5 w-96 max-w-full rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card
              key={i}
              className="rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">
          Token transactions
        </h1>
        <p className="mt-1 text-muted-foreground">
          All token sales (standard and bonus-tier packages), newest first.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map((s) => (
          <Card
            key={s.title}
            className="rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                {s.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-3">
                <p className="font-display text-2xl font-black tracking-tight text-foreground">
                  {s.value}
                </p>
                <s.icon className="size-5 shrink-0 text-primary/35" aria-hidden />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl font-black tracking-tight">
            Transaction log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted">
                <Coins className="size-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-muted-foreground">
                No token transactions yet
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date / time</TableHead>
                    <TableHead className="text-right">Amount paid</TableHead>
                    <TableHead className="text-right">Tokens given</TableHead>
                    <TableHead>Payment type</TableHead>
                    <TableHead>Bonus</TableHead>
                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-muted-foreground">
                        {safeFormatDate(
                          tx.created_at,
                          'MMM d, yyyy h:mm a'
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {currency(Number(tx.amount_paid))}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {tx.tokens_given}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.payment_type === 'cash' ? 'secondary' : 'outline'
                          }
                          className="capitalize"
                        >
                          {tx.payment_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.is_loyalty_bonus ? (
                          <Badge
                            variant="warning"
                            className="font-semibold shadow-sm"
                          >
                            Bonus
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                              onClick={() => openEdit(tx)}
                            >
                              <Pencil className="size-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => setDeleteTarget(tx)}
                            >
                              <Trash2 className="size-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={loadingMore}
                    onClick={() => void loadMore()}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Loading…
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-black tracking-tight">
              Edit transaction
            </DialogTitle>
            <DialogDescription>
              Correct a processed token sale. Totals update automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="tx-amount">Amount paid ($)</Label>
              <Input
                id="tx-amount"
                type="number"
                min={0}
                step="0.01"
                className="rounded-xl"
                value={editForm.amount_paid}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, amount_paid: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tx-tokens">Tokens given</Label>
              <Input
                id="tx-tokens"
                type="number"
                min={0}
                className="rounded-xl"
                value={editForm.tokens_given}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, tokens_given: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tx-payment">Payment type</Label>
              <Select
                value={editForm.payment_type}
                onValueChange={(v) =>
                  setEditForm((f) => ({ ...f, payment_type: v as PaymentType }))
                }
              >
                <SelectTrigger id="tx-payment" className="w-full rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setEditTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              disabled={editSaving}
              onClick={() => void saveEdit()}
            >
              {editSaving ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will permanently remove the ${currency(
                    Number(deleteTarget.amount_paid)
                  )} sale (${deleteTarget.tokens_given} tokens). Revenue totals will adjust. This can't be undone.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void confirmDelete()
              }}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? 'Deleting…' : 'Delete transaction'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
