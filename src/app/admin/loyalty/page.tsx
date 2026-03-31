'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LOYALTY_TIERS } from '@/lib/constants'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { safeFormatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Gift, Users, TrendingUp, Search } from 'lucide-react'

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function LoyaltyPage() {
  const supabase = createClient()
  const [accounts, setAccounts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [aRes, tRes] = await Promise.all([
        supabase.from('loyalty_accounts').select('*, profiles(first_name, last_name, email)').order('total_spent', { ascending: false }),
        supabase.from('loyalty_transactions').select('*').order('created_at', { ascending: false }).limit(50),
      ])
      setAccounts(aRes.data || [])
      setTransactions(tRes.data || [])
    } catch (err: any) {
      console.error('Failed to load loyalty data:', err)
      toast.error(err?.message || 'Failed to load loyalty data')
    } finally {
      setLoading(false)
    }
  }

  const totalMembers = accounts.length
  const totalSpent = accounts.reduce((s, a) => s + Number(a.total_spent), 0)
  const totalRewards = accounts.reduce((s, a) => s + Number(a.reward_balance), 0)

  const tierColor = (tier: string) => {
    const t = LOYALTY_TIERS.find(lt => lt.tier === tier)
    return { bronze: 'bg-orange-100 text-orange-800', silver: 'bg-gray-200 text-gray-800', gold: 'bg-yellow-100 text-yellow-800', platinum: 'bg-purple-100 text-purple-800' }[tier] || ''
  }

  const filtered = accounts.filter(a => {
    if (!search) return true
    const profile = a.profiles
    if (!profile) return false
    return `${profile.first_name} ${profile.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      profile.email?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Loyalty Program</h1>
        <p className="text-sm text-muted-foreground">Customer rewards and loyalty tracking</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Members</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="font-display text-3xl font-bold">{totalMembers}</div>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Total Spent</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="font-display text-3xl font-bold">{currency(totalSpent)}</div>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Outstanding Rewards</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="font-display text-3xl font-bold">{currency(totalRewards)}</div>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Gift className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {LOYALTY_TIERS.map(t => (
          <Card key={t.tier} className="rounded-2xl shadow-ambient">
            <CardContent className="pt-4 text-center">
              <div className="font-display text-2xl font-bold" style={{ color: t.color }}>{accounts.filter(a => a.tier === t.tier).length}</div>
              <p className="text-sm font-medium text-foreground">{t.label}</p>
              <p className="text-xs text-muted-foreground">{currency(t.minSpend)}+ spent</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="accounts">
        <TabsList className="rounded-xl">
          <TabsTrigger value="accounts" className="rounded-lg">Member Accounts</TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-lg">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
          </div>
          <Card className="rounded-2xl shadow-ambient">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead className="text-right">Reward Balance</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No loyalty accounts</TableCell></TableRow>
                  ) : filtered.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="font-medium">{a.profiles?.first_name} {a.profiles?.last_name}</div>
                        <div className="text-xs text-muted-foreground">{a.profiles?.email}</div>
                      </TableCell>
                      <TableCell><Badge className={`${tierColor(a.tier)} rounded-lg`}>{a.tier}</Badge></TableCell>
                      <TableCell className="text-right font-medium">{currency(a.total_spent)}</TableCell>
                      <TableCell className="text-right">{currency(a.reward_balance)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{safeFormatDate(a.created_at, 'MMM yyyy')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card className="rounded-2xl shadow-ambient">
            <CardContent className="pt-6">
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
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No transactions</TableCell></TableRow>
                  ) : transactions.map(t => (
                    <TableRow key={t.id}>
                      <TableCell>{safeFormatDate(t.created_at, 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={t.type === 'earn' ? 'secondary' : 'outline'} className="rounded-lg">
                          {t.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{t.description}</TableCell>
                      <TableCell className="text-right font-medium">{t.type === 'earn' ? '+' : '-'}{currency(t.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
