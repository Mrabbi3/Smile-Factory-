'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { LOYALTY_TIERS } from '@/lib/constants'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Gift, Trophy, TrendingUp } from 'lucide-react'

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function LoyaltyRewardsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [account, setAccount] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const [aRes, tRes] = await Promise.all([
        supabase.from('loyalty_accounts').select('*').eq('customer_id', user.id).single(),
        supabase.from('loyalty_transactions').select('*').order('created_at', { ascending: false }).limit(20),
      ])
      setAccount(aRes.data)
      setTransactions(tRes.data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const currentTier = LOYALTY_TIERS.find(t => t.tier === (account?.tier || 'bronze')) || LOYALTY_TIERS[0]
  const currentIdx = LOYALTY_TIERS.indexOf(currentTier)
  const nextTier = LOYALTY_TIERS[currentIdx + 1]
  const spent = account?.total_spent || 0
  const progress = nextTier ? Math.min(100, (spent / nextTier.minSpend) * 100) : 100

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Loyalty Rewards</h1>
        <p className="text-muted-foreground">Track your rewards and earn bonuses</p>
      </div>

      <Card className="border-2" style={{ borderColor: currentTier.color }}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: currentTier.color + '20', color: currentTier.color }}>
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold capitalize">{currentTier.label} Member</h2>
              <p className="text-muted-foreground">Total Spent: {currency(spent)}</p>
            </div>
          </div>
          {nextTier && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to {nextTier.label}</span>
                <span>{currency(spent)} / {currency(nextTier.minSpend)}</span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                Spend {currency(nextTier.minSpend - spent)} more to reach {nextTier.label}!
              </p>
            </div>
          )}
          {!nextTier && <p className="text-sm text-muted-foreground">You&apos;ve reached the highest tier! Thank you for being a loyal customer.</p>}
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-2">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Reward Balance</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{currency(account?.reward_balance || 0)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Tier</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold capitalize" style={{ color: currentTier.color }}>{currentTier.label}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Loyalty Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {LOYALTY_TIERS.map((tier, i) => (
              <div key={tier.tier} className={`flex items-center justify-between p-3 rounded-lg border ${tier.tier === (account?.tier || 'bronze') ? 'border-2 bg-muted' : ''}`} style={tier.tier === (account?.tier || 'bronze') ? { borderColor: tier.color } : {}}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: tier.color + '20', color: tier.color }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{tier.label}</p>
                    <p className="text-xs text-muted-foreground">Spend {currency(tier.minSpend)}+</p>
                  </div>
                </div>
                {tier.tier === (account?.tier || 'bronze') && <Badge style={{ backgroundColor: tier.color, color: 'white' }}>Current</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No loyalty activity yet. Start spending to earn rewards!</TableCell></TableRow>
              ) : transactions.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{format(new Date(t.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell><Badge variant={t.type === 'earn' ? 'secondary' : 'outline'}>{t.type}</Badge></TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell className={`text-right font-medium ${t.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'earn' ? '+' : '-'}{currency(t.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}