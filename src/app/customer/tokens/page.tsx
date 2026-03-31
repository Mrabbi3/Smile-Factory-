'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { TOKEN_PRICING } from '@/lib/constants'
import { format } from 'date-fns'
import { safeFormatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Coins, DollarSign, Zap } from 'lucide-react'

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function TokenHistoryPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const { data, error } = await supabase.from('token_transactions')
          .select('*').eq('customer_id', user.id)
          .order('created_at', { ascending: false })
        if (error) console.error('Token transactions fetch error:', error)
        setTransactions(data || [])
      } catch (err) {
        console.error('Tokens load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const totalSpent = transactions.reduce((s, t) => s + Number(t.amount_paid), 0)
  const totalTokens = transactions.reduce((s, t) => s + t.tokens_given, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Token History</h1>
        <p className="text-muted-foreground">Your token purchase history</p>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <Card className="rounded-2xl shadow-ambient hover:shadow-elevated hover:-translate-y-1 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-display">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="font-display text-3xl font-bold">{currency(totalSpent)}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-ambient hover:shadow-elevated hover:-translate-y-1 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-display">Total Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100/50 text-amber-600">
                <Zap className="h-5 w-5" />
              </div>
              <div className="font-display text-3xl font-bold text-amber-600">{totalTokens}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-ambient">
        <CardHeader>
          <CardTitle className="font-display tracking-tight">Token Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TOKEN_PRICING.map(t => (
              <div key={t.price} className="rounded-xl bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)] transition-colors p-4 text-center border-0">
                <div className="font-display text-2xl font-bold text-primary">${t.price}</div>
                <div className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <Zap className="h-4 w-4" />
                  {t.tokens} tokens
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-ambient">
        <CardHeader>
          <CardTitle className="font-display tracking-tight">Purchase History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-4">
                      <Coins className="h-6 w-6" />
                    </div>
                    <p className="text-muted-foreground font-medium">No token purchases yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Visit the arcade to start earning!</p>
                  </TableCell>
                </TableRow>
              ) : transactions.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">{safeFormatDate(t.created_at, 'MMM dd, yyyy h:mm a')}</TableCell>
                  <TableCell className="text-right font-medium">{currency(t.amount_paid)}</TableCell>
                  <TableCell className="text-right font-medium text-amber-600">{t.tokens_given}</TableCell>
                  <TableCell><Badge variant="outline" className="rounded-xl">{t.payment_type}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
