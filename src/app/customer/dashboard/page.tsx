'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { safeFormatDate } from '@/lib/utils'
import { Calendar, Coins, Trophy, Ticket, ArrowRight } from 'lucide-react'

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function CustomerDashboard() {
  const { profile, user } = useAuth()
  const supabase = createClient()
  const [bookingsCount, setBookingsCount] = useState(0)
  const [spent, setSpent] = useState(0)
  const [tokens, setTokens] = useState(0)
  const [ticketCount, setTicketCount] = useState<number | null>(null)
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const [bookingRes, txRes, tkRes] = await Promise.all([
          supabase.from('party_bookings').select('id', { count: 'exact', head: true }).eq('customer_id', profile?.id ?? user.id),
          supabase.from('token_transactions').select('amount_paid,tokens_given').eq('customer_id', user.id),
          supabase.from('customer_tickets').select('ticket_count').eq('customer_id', user.id).maybeSingle(),
        ])
        const tx = txRes.data ?? []
        setSpent(tx.reduce((s, t) => s + Number(t.amount_paid), 0))
        setTokens(tx.reduce((s, t) => s + Number(t.tokens_given), 0))
        setTicketCount(typeof tkRes.data?.ticket_count === 'number' ? tkRes.data.ticket_count : 0)

        const upcomingRes = await supabase
          .from('party_bookings')
          .select('*')
          .eq('customer_id', profile?.id ?? user.id)
          .gte('booking_date', new Date().toISOString().split('T')[0])
          .in('status', ['pending', 'confirmed'])
          .order('booking_date')
          .limit(3)

        setBookingsCount(bookingRes.count ?? 0)
        setUpcomingBookings(upcomingRes.data ?? [])
      } catch (err) {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [profile, user, supabase])

  if (loading) {
    return <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Welcome back, <span className="text-primary">{profile?.first_name}</span>!
        </h1>
        <p className="text-muted-foreground">Your Smile Factory overview.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-display">Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div className="font-display text-3xl font-bold">{bookingsCount}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-display">Purchases total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-display text-2xl font-bold">{fmtMoney(spent)}</div>
            <p className="text-xs text-muted-foreground mt-1">Historical token buys</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-display">Tokens credited</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <Coins className="h-8 w-8 text-amber-600" />
              <div className="font-display text-3xl font-bold text-amber-700">{tokens}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-display">Prize tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <Ticket className="h-8 w-8 text-emerald-600" />
              <div className="font-display text-3xl font-bold text-emerald-700">{ticketCount ?? '—'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="font-display tracking-tight flex items-center justify-between">
              Upcoming bookings
              <Link href="/customer/bookings">
                <Button variant="ghost" size="sm" className="text-primary">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm">None scheduled.</p>
            ) : (
              upcomingBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{safeFormatDate(b.booking_date, 'MMM dd, yyyy')}</p>
                    <p className="text-sm text-muted-foreground">{b.start_time}</p>
                  </div>
                  <Badge>{b.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="font-display tracking-tight">Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/customer/buy-tokens">
              <Button variant="outline" className="w-full justify-start rounded-xl"><Coins className="mr-2 h-4 w-4" />Buy tokens (QR)</Button>
            </Link>
            <Link href="/customer/prizes">
              <Button variant="outline" className="w-full justify-start rounded-xl"><Trophy className="mr-2 h-4 w-4" />Redeem prizes</Button>
            </Link>
            <Link href="/customer/coupons">
              <Button variant="outline" className="w-full justify-start rounded-xl">My coupons</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
