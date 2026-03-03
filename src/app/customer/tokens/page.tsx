'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { TOKEN_PRICING } from '@/lib/constants'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Coins, DollarSign } from 'lucide-react'

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
      const { data } = await supabase.from('token_transactions')
        .select('*').eq('customer_id', user.id)
        .order('created_at', { ascending: false })
      setTransactions(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const totalSpent = transactions.reduce((s, t) => s + Number(t.amount_paid), 0)
  const totalTokens = transactions.reduce((s, t) => s + t.tokens_given, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Token History</h1>
        <p className="text-muted-foreground">Your token purchase history</p>
      </div>

      <div className="grid gap-4 grid-cols-2">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Spent</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{currency(totalSpent)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Tokens</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalTokens}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Token Pricing</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TOKEN_PRICING.map(t => (
              <div key={t.price} className="border rounded-lg p-4 text-center">
                <div className="text-xl font-bold">${t.price}</div>
                <div className="text-sm text-muted-foreground">{t.tokens} tokens</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Purchase History</CardTitle></CardHeader>
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
                <TableRow><TableCell colSpan={4} className="text-center py-12">
                  <Coins className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No token purchases yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Visit the arcade to start earning!</p>
                </TableCell></TableRow>
              ) : transactions.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{format(new Date(t.created_at), 'MMM dd, yyyy h:mm a')}</TableCell>
                  <TableCell className="text-right font-medium">{currency(t.amount_paid)}</TableCell>
                  <TableCell className="text-right">{t.tokens_given}</TableCell>
                  <TableCell><Badge variant="outline">{t.payment_type}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}