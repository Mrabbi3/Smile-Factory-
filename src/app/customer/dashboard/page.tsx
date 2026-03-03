'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { format } from 'date-fns'
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
      const [bookingRes, loyaltyRes, upcomingRes] = await Promise.all([
        supabase.from('party_bookings').select('id', { count: 'exact', head: true }).eq('customer_id', profile.id),
        supabase.from('loyalty_accounts').select('*').eq('customer_id', profile.id).single(),
        supabase.from('party_bookings').select('*').eq('customer_id', profile.id).gte('booking_date', new Date().toISOString().split('T')[0]).in('status', ['pending', 'confirmed']).order('booking_date').limit(3),
      ])
      setStats({
        bookings: bookingRes.count || 0,
        totalSpent: loyaltyRes.data?.total_spent || 0,
        tier: loyaltyRes.data?.tier || 'bronze',
        rewardBalance: loyaltyRes.data?.reward_balance || 0,
      })
      setUpcomingBookings(upcomingRes.data || [])
      setLoading(false)
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
        <h1 className="text-2xl font-bold">Welcome back, {profile?.first_name}!</h1>
        <p className="text-muted-foreground">Here&apos;s your Smile Factory account overview.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Bookings</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.bookings}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Spent</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{currency(stats.totalSpent)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Loyalty Tier</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize" style={{ color: LOYALTY_TIERS[currentTierIdx]?.color }}>{stats.tier}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Reward Balance</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{currency(stats.rewardBalance)}</div></CardContent>
        </Card>
      </div>

      {nextTier && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to {nextTier.label}</span>
              <span>{currency(stats.totalSpent)} / {currency(nextTier.minSpend)}</span>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">Spend {currency(nextTier.minSpend - stats.totalSpent)} more to reach {nextTier.label} tier!</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upcoming Bookings</span>
              <Link href="/customer/bookings">
                <Button variant="ghost" size="sm">View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No upcoming bookings</p>
                <Link href="/customer/bookings"><Button className="mt-4">Book a Party</Button></Link>
              </div>
            ) : upcomingBookings.map(b => (
              <div key={b.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{format(new Date(b.booking_date), 'MMM dd, yyyy')}</p>
                  <p className="text-sm text-muted-foreground">{b.start_time} · {b.num_kids} kids</p>
                </div>
                <Badge className={b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{b.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/customer/bookings">
              <Button variant="outline" className="w-full justify-start"><Calendar className="mr-2 h-4 w-4" />Book a Birthday Party</Button>
            </Link>
            <Link href="/customer/tokens">
              <Button variant="outline" className="w-full justify-start"><Coins className="mr-2 h-4 w-4" />View Token History</Button>
            </Link>
            <Link href="/customer/loyalty">
              <Button variant="outline" className="w-full justify-start"><Gift className="mr-2 h-4 w-4" />Loyalty Rewards</Button>
            </Link>
            <Link href="/customer/profile">
              <Button variant="outline" className="w-full justify-start"><User className="mr-2 h-4 w-4" />Edit Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}