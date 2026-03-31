'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { LOYALTY_TIERS } from '@/lib/constants'
import { safeFormatDate } from '@/lib/utils'
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
      try {
        const [aRes, tRes] = await Promise.all([
          supabase.from('loyalty_accounts').select('*').eq('customer_id', user.id).maybeSingle(),
          supabase.from('loyalty_transactions').select('*').order('created_at', { ascending: false }).limit(20),
        ])
        if (aRes.error) console.error('Loyalty account fetch error:', aRes.error)
        if (tRes.error) console.error('Loyalty transactions fetch error:', tRes.error)
        setAccount(aRes.data)
        setTransactions(tRes.data || [])
      } catch (err) {
        console.error('Loyalty load error:', err)
      } finally {
        setLoading(false)
      }
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
        <h1 className="font-display text-3xl font-bold tracking-tight">Loyalty Rewards</h1>
        <p className="text-muted-foreground">Track your rewards and earn bonuses</p>
      </div>

      <Card className="rounded-2xl shadow-ambient overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        <CardContent className="pt-6 relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex size-16 items-center justify-center rounded-xl" style={{ backgroundColor: `${currentTier.color}20`, color: currentTier.color }}>
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight capitalize">{currentTier.label} Member</h2>
              <p className="text-muted-foreground">Total Spent: {currency(spent)}</p>
            </div>
          </div>
          {nextTier && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to {nextTier.label}</span>
                <span className="font-medium">{currency(spent)} / {currency(nextTier.minSpend)}</span>
              </div>
              <Progress value={progress} className="h-3 bg-gradient-primary" />
              <p className="text-xs text-muted-foreground">
                Spend {currency(nextTier.minSpend - spent)} more to reach {nextTier.label}!
              </p>
            </div>
          )}
          {!nextTier && <p className="text-sm text-muted-foreground">You&apos;ve reached the highest tier! Thank you for being a loyal customer.</p>}
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-2">
        <Card className="rounded-2xl shadow-ambient hover:shadow-elevated hover:-translate-y-1 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-display">Reward Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100/50 text-emerald-600">
                <Gift className="h-5 w-5" />
              </div>
              <div className="font-display text-3xl font-bold text-emerald-600">{currency(account?.reward_balance || 0)}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-ambient hover:shadow-elevated hover:-translate-y-1 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-display">Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${currentTier.color}20`, color: currentTier.color }}>
                <Trophy className="h-5 w-5" />
              </div>
              <div className="font-display text-3xl font-bold capitalize" style={{ color: currentTier.color }}>{currentTier.label}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-ambient">
        <CardHeader>
          <CardTitle className="font-display tracking-tight">Loyalty Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {LOYALTY_TIERS.map((tier, i) => (
              <div key={tier.tier} className={`flex items-center justify-between p-4 rounded-xl transition-all ${tier.tier === (account?.tier || 'bronze') ? 'bg-[var(--surface-container-high)] shadow-ambient' : 'bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)]'}`}>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl font-bold text-sm" style={{ backgroundColor: `${tier.color}20`, color: tier.color }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-display font-bold tracking-tight capitalize">{tier.label}</p>
                    <p className="text-xs text-muted-foreground">Spend {currency(tier.minSpend)}+</p>
                  </div>
                </div>
                {tier.tier === (account?.tier || 'bronze') && <Badge className="rounded-xl" style={{ backgroundColor: tier.color, color: 'white' }}>Current</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-ambient">
        <CardHeader>
          <CardTitle className="font-display tracking-tight">Recent Activity</CardTitle>
        </CardHeader>
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
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-4">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <p className="text-muted-foreground font-medium">No loyalty activity yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Start spending to earn rewards!</p>
                  </TableCell>
                </TableRow>
              ) : transactions.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="text-muted-foreground">{safeFormatDate(t.created_at, 'MMM dd, yyyy')}</TableCell>
                  <TableCell><Badge variant={t.type === 'earn' ? 'secondary' : 'outline'} className="rounded-xl">{t.type}</Badge></TableCell>
                  <TableCell>{t.description}</TableCell>
                  <TableCell className={`text-right font-medium ${t.type === 'earn' ? 'text-emerald-600' : 'text-red-600'}`}>{t.type === 'earn' ? '+' : '-'}{currency(t.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
