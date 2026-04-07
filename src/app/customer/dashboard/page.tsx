'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { format } from 'date-fns'
import { safeFormatDate } from '@/lib/utils'
import { LOYALTY_TIERS } from '@/lib/constants'
import { Calendar, Coins, Gift, User, ArrowRight } from 'lucide-react'

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function CustomerDashboard() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [stats, setStats] = useState({ bookings: 0, totalSpent: 0, tier: 'bronze', rewardBalance: 0 })
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    const load = async () => {
      try {
        const [bookingRes, loyaltyRes, upcomingRes] = await Promise.all([
          supabase.from('party_bookings').select('id', { count: 'exact', head: true }).eq('customer_id', profile.id),
          supabase.from('loyalty_accounts').select('*').eq('customer_id', profile.id).maybeSingle(),
          supabase.from('party_bookings').select('*').eq('customer_id', profile.id).gte('booking_date', new Date().toISOString().split('T')[0]).in('status', ['pending', 'confirmed']).order('booking_date').limit(3),
        ])
        if (bookingRes.error) console.error('Bookings fetch error:', bookingRes.error)
        if (loyaltyRes.error) console.error('Loyalty fetch error:', loyaltyRes.error)
        if (upcomingRes.error) console.error('Upcoming bookings fetch error:', upcomingRes.error)

        setStats({
          bookings: bookingRes.count || 0,
          totalSpent: loyaltyRes.data?.total_spent || 0,
          tier: loyaltyRes.data?.tier || 'bronze',
          rewardBalance: loyaltyRes.data?.reward_balance || 0,
        })
        setUpcomingBookings(upcomingRes.data || [])
      } catch (err) {
        console.error('Dashboard load error:', err)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile])

  if (loading) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
  }

  const currentTierIdx = LOYALTY_TIERS.findIndex(t => t.tier === stats.tier)
  const nextTier = LOYALTY_TIERS[currentTierIdx + 1]
  const progress = nextTier ? Math.min(100, (stats.totalSpent / nextTier.minSpend) * 100) : 100

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Welcome back, <span className="bg-gradient-to-r from-primary to-[var(--primary-container)] bg-clip-text text-transparent">{profile?.first_name}</span>!
        </h1>
        <p className="text-muted-foreground">Here&apos;s your Smile Factory account overview.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-ambient hover:shadow-elevated hover:-translate-y-1 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-display">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="font-display text-3xl font-bold">{stats.bookings}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-ambient hover:shadow-elevated hover:-translate-y-1 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-display">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="font-display text-3xl font-bold">{currency(stats.totalSpent)}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-ambient hover:shadow-elevated hover:-translate-y-1 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-display">Loyalty Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl text-primary" style={{ backgroundColor: `${LOYALTY_TIERS[currentTierIdx]?.color}20`, color: LOYALTY_TIERS[currentTierIdx]?.color }}>
                <Trophy className="h-5 w-5" />
              </div>
              <div className="font-display text-3xl font-bold capitalize" style={{ color: LOYALTY_TIERS[currentTierIdx]?.color }}>{stats.tier}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-ambient hover:shadow-elevated hover:-translate-y-1 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-display">Reward Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100/50 text-emerald-600">
                <Gift className="h-5 w-5" />
              </div>
              <div className="font-display text-3xl font-bold text-emerald-600">{currency(stats.rewardBalance)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {nextTier && (
        <Card className="rounded-2xl shadow-ambient">
          <CardContent className="pt-6">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-muted-foreground">Progress to {nextTier.label}</span>
              <span className="font-medium">{currency(stats.totalSpent)} / {currency(nextTier.minSpend)}</span>
            </div>
            <Progress value={progress} className="h-3 bg-gradient-primary" />
            <p className="text-xs text-muted-foreground mt-3">Spend {currency(nextTier.minSpend - stats.totalSpent)} more to reach {nextTier.label} tier!</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader>
            <CardTitle className="font-display tracking-tight flex items-center justify-between">
              <span>Upcoming Bookings</span>
              <Link href="/customer/bookings">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <p className="text-muted-foreground font-medium">No upcoming bookings</p>
                <Link href="/customer/bookings"><Button className="mt-4">Book a Party</Button></Link>
              </div>
            ) : upcomingBookings.map(b => (
              <div key={b.id} className="flex items-center justify-between py-3 border-b border-[var(--surface-container-low)] last:border-0">
                <div>
                  <p className="font-medium">{safeFormatDate(b.booking_date, 'MMM dd, yyyy')}</p>
                  <p className="text-sm text-muted-foreground">{b.start_time} · {b.num_kids} kids</p>
                </div>
                <Badge className={b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 rounded-xl' : 'bg-amber-100 text-amber-800 rounded-xl'}>{b.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-ambient">
          <CardHeader>
            <CardTitle className="font-display tracking-tight">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/customer/bookings">
              <Button variant="outline" className="w-full justify-start rounded-xl hover:bg-[var(--surface-container-low)]"><Calendar className="mr-2 h-4 w-4" />Book a Birthday Party</Button>
            </Link>
            <Link href="/customer/tokens">
              <Button variant="outline" className="w-full justify-start rounded-xl hover:bg-[var(--surface-container-low)]"><Coins className="mr-2 h-4 w-4" />View Token History</Button>
            </Link>
            <Link href="/customer/loyalty">
              <Button variant="outline" className="w-full justify-start rounded-xl hover:bg-[var(--surface-container-low)]"><Gift className="mr-2 h-4 w-4" />Loyalty Rewards</Button>
            </Link>
            <Link href="/customer/profile">
              <Button variant="outline" className="w-full justify-start rounded-xl hover:bg-[var(--surface-container-low)]"><User className="mr-2 h-4 w-4" />Edit Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Add missing imports at the top
import { DollarSign, Trophy } from 'lucide-react'
