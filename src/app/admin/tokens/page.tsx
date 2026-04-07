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
import { Calendar, Coins, DollarSign, Loader2, Receipt } from 'lucide-react'

const PAGE_SIZE = 25

export default function AdminTokensPage() {
  const { loading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [transactions, setTransactions] = useState<TokenTransaction[]>([])
  const [stats, setStats] = useState({
    totalCount: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

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
          All token sales and loyalty bonuses, newest first.
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
                    <TableHead>Loyalty bonus</TableHead>
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
                            Loyalty bonus
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
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
    </div>
  )
}
