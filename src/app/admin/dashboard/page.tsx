'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { format, subDays, startOfDay } from 'date-fns'
import { safeFormatDate } from '@/lib/utils'
import {
  DollarSign, Coins, TrendingUp, Calendar, ShoppingCart,
  ClipboardList, Trophy, AlertTriangle, Plus, ArrowUpRight,
  Users, Package
} from 'lucide-react'
import { AIAnalytics } from '@/components/admin/ai-analytics'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

export default function AdminDashboard() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [stats, setStats] = useState({ todayRev: 0, weekRev: 0, monthRev: 0, totalTx: 0 })
  const [chartData, setChartData] = useState<{ date: string; revenue: number }[]>([])
  const [recentTx, setRecentTx] = useState<any[]>([])
  const [alerts, setAlerts] = useState({ lowStock: 0, upcomingBookings: 0, openOrders: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const today = startOfDay(new Date()).toISOString()
      const weekAgo = startOfDay(subDays(new Date(), 7)).toISOString()
      const monthAgo = startOfDay(subDays(new Date(), 30)).toISOString()

      try {
        const [todayRes, weekRes, monthRes, txCount, recent, lowStock, upcoming, openWo] =
          await Promise.all([
            supabase.from('token_transactions').select('amount_paid').gte('created_at', today),
            supabase.from('token_transactions').select('amount_paid').gte('created_at', weekAgo),
            supabase.from('token_transactions').select('amount_paid').gte('created_at', monthAgo),
            supabase.from('token_transactions').select('id', { count: 'exact', head: true }),
            supabase.from('token_transactions').select('*').order('created_at', { ascending: false }).limit(10),
            supabase.from('prizes').select('id', { count: 'exact', head: true }).lte('stock_quantity', 5).eq('is_active', true),
            supabase.from('party_bookings').select('id', { count: 'exact', head: true }).gte('booking_date', today).in('status', ['pending', 'confirmed']),
            supabase.from('work_orders').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress']),
          ])

        const sumArr = (arr: any[] | null) => (arr || []).reduce((s, r) => s + Number(r.amount_paid || 0), 0)

        setStats({
          todayRev: sumArr(todayRes.data),
          weekRev: sumArr(weekRes.data),
          monthRev: sumArr(monthRes.data),
          totalTx: txCount.count || 0,
        })
        setRecentTx(recent.data || [])
        setAlerts({
          lowStock: lowStock.count || 0,
          upcomingBookings: upcoming.count || 0,
          openOrders: openWo.count || 0,
        })

        const days = Array.from({ length: 7 }, (_, i) => {
          const d = subDays(new Date(), 6 - i)
          return { date: format(d, 'MMM dd'), revenue: 0 }
        })
        const weekTx = weekRes.data || []
        weekTx.forEach((tx: any) => {
          const label = safeFormatDate(tx.created_at, 'MMM dd', '')
          if (!label) return
          const day = days.find(d => d.date === label)
          if (day) day.revenue += Number(tx.amount_paid || 0)
        })
        setChartData(days)
      } catch (err) {
        console.error('Dashboard load error:', err)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  const statCards = [
    { title: "Today's Revenue", value: currency(stats.todayRev), icon: DollarSign, color: 'text-green-600' },
    { title: 'This Week', value: currency(stats.weekRev), icon: TrendingUp, color: 'text-blue-600' },
    { title: 'This Month', value: currency(stats.monthRev), icon: Coins, color: 'text-purple-600' },
    { title: 'Total Transactions', value: stats.totalTx.toLocaleString(), icon: ShoppingCart, color: 'text-orange-600' },
  ]

  const quickActions = [
    { label: 'New Sale', href: '/admin/pos', icon: Plus, color: 'bg-green-600 hover:bg-green-700' },
    { label: 'New Booking', href: '/admin/bookings', icon: Calendar, color: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Add Prize', href: '/admin/inventory', icon: Trophy, color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Work Order', href: '/admin/work-orders', icon: ClipboardList, color: 'bg-orange-600 hover:bg-orange-700' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {profile?.first_name || 'Admin'}</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s happening at The Smile Factory today.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => currency(Number(v))} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {quickActions.map((a) => (
                <Link key={a.label} href={a.href}>
                  <Button className={`w-full ${a.color} text-white`} size="sm">
                    <a.icon className="mr-1 h-4 w-4" />
                    {a.label}
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.lowStock > 0 && (
                <Link href="/admin/inventory" className="flex items-center gap-2 text-sm text-orange-600 hover:underline">
                  <AlertTriangle className="h-4 w-4" />
                  {alerts.lowStock} prize(s) low on stock
                </Link>
              )}
              {alerts.upcomingBookings > 0 && (
                <Link href="/admin/bookings" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <Calendar className="h-4 w-4" />
                  {alerts.upcomingBookings} upcoming booking(s)
                </Link>
              )}
              {alerts.openOrders > 0 && (
                <Link href="/admin/work-orders" className="flex items-center gap-2 text-sm text-red-600 hover:underline">
                  <ClipboardList className="h-4 w-4" />
                  {alerts.openOrders} open work order(s)
                </Link>
              )}
              {alerts.lowStock === 0 && alerts.upcomingBookings === 0 && alerts.openOrders === 0 && (
                <p className="text-sm text-muted-foreground">All clear! No alerts at this time.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AIAnalytics />

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Last 10 token sales</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTx.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No transactions yet. Start making sales from the POS!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2">Time</th>
                    <th className="text-right py-2">Amount</th>
                    <th className="text-right py-2">Tokens</th>
                    <th className="text-left py-2">Payment</th>
                    <th className="text-left py-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.map((tx) => (
                    <tr key={tx.id} className="border-b last:border-0">
                      <td className="py-2">{safeFormatDate(tx.created_at, 'MMM dd, h:mm a')}</td>
                      <td className="text-right font-medium">{currency(tx.amount_paid)}</td>
                      <td className="text-right">{tx.tokens_given}</td>
                      <td><Badge variant={tx.payment_type === 'cash' ? 'secondary' : 'outline'}>{tx.payment_type}</Badge></td>
                      <td>{tx.is_loyalty_bonus && <Badge variant="default" className="bg-yellow-500">Loyalty</Badge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
