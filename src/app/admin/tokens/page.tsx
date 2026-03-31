'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { format, startOfDay, subDays } from 'date-fns'
import { safeFormatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Coins, DollarSign, CreditCard, Banknote, Search, Download } from 'lucide-react'

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function TokensPage() {
  const { isOwner } = useAuth()
  const supabase = createClient()
  const [transactions, setTransactions] = useState<any[]>([])
  const [pricing, setPricing] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ paymentType: 'all', search: '' })
  const [todayStats, setTodayStats] = useState({ total: 0, cash: 0, card: 0, tokens: 0, count: 0 })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const today = startOfDay(new Date()).toISOString()
      const [txRes, priceRes, todayTxRes] = await Promise.all([
        supabase.from('token_transactions').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('token_pricing').select('*').order('price', { ascending: true }),
        supabase.from('token_transactions').select('*').gte('created_at', today),
      ])

      if (txRes.error) console.error('Transactions fetch error:', txRes.error)
      if (priceRes.error) console.error('Pricing fetch error:', priceRes.error)
      if (todayTxRes.error) console.error('Today TX fetch error:', todayTxRes.error)

      setTransactions(txRes.data || [])
      setPricing(priceRes.data || [])

      const todayTx = todayTxRes.data || []
      setTodayStats({
        total: todayTx.reduce((s, t) => s + Number(t.amount_paid || 0), 0),
        cash: todayTx.filter(t => t.payment_type === 'cash').reduce((s, t) => s + Number(t.amount_paid || 0), 0),
        card: todayTx.filter(t => t.payment_type === 'card').reduce((s, t) => s + Number(t.amount_paid || 0), 0),
        tokens: todayTx.reduce((s, t) => s + (t.tokens_given || 0), 0),
        count: todayTx.length,
      })
    } catch (err) {
      console.error('Token data load error:', err)
      toast.error('Failed to load token data')
    } finally {
      setLoading(false)
    }
  }

  const filtered = transactions.filter((tx) => {
    if (filter.paymentType !== 'all' && tx.payment_type !== filter.paymentType) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Token Management</h1>
        <p className="text-sm text-muted-foreground">Pricing tiers and transaction history</p>
      </div>

      {/* Today's Summary */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Today's Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="font-display text-2xl font-bold">{currency(todayStats.total)}</div>
                <p className="text-xs text-muted-foreground">{todayStats.count} transactions</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Cash</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="font-display text-2xl font-bold text-emerald-600">{currency(todayStats.cash)}</div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Banknote className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Card</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="font-display text-2xl font-bold text-blue-600">{currency(todayStats.card)}</div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="font-display text-2xl font-bold">{todayStats.tokens}</div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Coins className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg. Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="font-display text-2xl font-bold">{todayStats.count > 0 ? currency(todayStats.total / todayStats.count) : '$0.00'}</div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Tiers */}
      <Card className="rounded-2xl shadow-ambient">
        <CardHeader>
          <CardTitle className="font-display tracking-tight">Active Pricing Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {pricing.map((p) => (
              <div key={p.id} className={`rounded-2xl p-4 text-center shadow-ambient ${p.is_loyalty_bonus ? 'bg-[var(--surface-container-low)]' : 'bg-[var(--surface-container-low)]'}`}>
                <div className="font-display text-2xl font-bold">${p.price}</div>
                <div className="text-sm text-muted-foreground">{p.token_count} tokens</div>
                {p.is_loyalty_bonus && <Badge className="mt-2 bg-amber-500 text-white text-xs rounded-lg">Loyalty</Badge>}
                {p.min_role !== 'employee' && (
                  <Badge variant="outline" className="mt-2 text-xs rounded-lg">{p.min_role}+</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="rounded-2xl shadow-ambient">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="font-display tracking-tight">Transaction History</CardTitle>
            <div className="flex gap-2">
              <Select value={filter.paymentType} onValueChange={(v) => setFilter({ ...filter, paymentType: v })}>
                <SelectTrigger className="w-32 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{safeFormatDate(tx.created_at, 'MMM dd, yyyy h:mm a')}</TableCell>
                      <TableCell className="text-right font-medium">{currency(tx.amount_paid)}</TableCell>
                      <TableCell className="text-right">{tx.tokens_given}</TableCell>
                      <TableCell>
                        <Badge variant={tx.payment_type === 'cash' ? 'secondary' : 'outline'} className="rounded-lg">
                          {tx.payment_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.is_loyalty_bonus ? <Badge className="bg-amber-500 text-white rounded-lg">Loyalty</Badge> : <span className="text-muted-foreground">Standard</span>}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Add missing icon import
import { TrendingUp } from 'lucide-react'
