'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { AIAnalytics } from '@/components/admin/ai-analytics'
import { safeFormatDate, currency } from '@/lib/utils'
import { startOfDay, subDays, format } from 'date-fns'
import { toast } from 'sonner'
import {
  DollarSign,
  TrendingUp,
  Coins,
  ShoppingCart,
  Calendar,
  Trophy,
  ClipboardList,
  Plus,
  AlertTriangle,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

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
      <section className="mb-4">
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-3 font-display">
          Welcome Back, <span className="text-primary">{profile?.first_name || 'Admin'}</span>
        </h1>
        <p className="text-gray-500 max-w-2xl text-lg font-medium">
          The assembly line is hummin&apos;. Here&apos;s a quick snapshot of the factory floor&apos;s performance for today.
        </p>
      </section>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:shadow-md transition-all">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.15em] text-gray-400 mb-1">{s.title}</p>
              <h2 className="text-2xl font-black">{s.value}</h2>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div />
              <s.icon className="size-5 text-primary/40 group-hover:text-primary transition-colors" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 bg-white p-10 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-black mb-2 font-display">Weekly Performance</h3>
              <p className="text-gray-500 text-sm font-medium">Revenue across all token sales this week.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Sales</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 800 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => currency(Number(v))} />
              <Bar dataKey="revenue" fill="#bb0100" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-100 p-8 rounded-xl border border-gray-200/50">
            <h3 className="text-lg font-black mb-6 flex items-center gap-3 font-display">
              <ShoppingCart className="size-5 text-primary" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="bg-white hover:bg-primary hover:text-white rounded-xl shadow-sm transition-all p-6 flex flex-col items-center justify-center gap-3 group"
                >
                  <a.icon className="size-7 text-primary group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black flex items-center gap-3 font-display">
                <AlertTriangle className="size-5 text-primary" />
                System Alerts
              </h3>
            </div>
            <div className="space-y-4">
              {alerts.lowStock > 0 && (
                <Link href="/admin/inventory" className="flex gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                  <Trophy className="size-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-black">Prize Restock Alert</p>
                    <p className="text-xs text-gray-600 mt-1">{alerts.lowStock} prize(s) low on stock</p>
                  </div>
                </Link>
              )}
              {alerts.upcomingBookings > 0 && (
                <Link href="/admin/bookings" className="flex gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <Calendar className="size-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-sm font-black">{alerts.upcomingBookings} Upcoming Booking(s)</p>
                    <p className="text-xs text-gray-600 mt-1">Confirmed or pending today</p>
                  </div>
                </Link>
              )}
              {alerts.openOrders > 0 && (
                <Link href="/admin/work-orders" className="flex gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <ClipboardList className="size-5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-sm font-black">{alerts.openOrders} Open Work Order(s)</p>
                    <p className="text-xs text-gray-600 mt-1">Requires attention</p>
                  </div>
                </Link>
              )}
              {alerts.lowStock === 0 && alerts.upcomingBookings === 0 && alerts.openOrders === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">All clear! No alerts at this time.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AIAnalytics />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 pb-4">
          <h3 className="text-xl font-black font-display tracking-tight">Recent Transactions</h3>
          <p className="text-sm text-gray-400 mt-1">Last 10 token sales</p>
        </div>
        <div className="px-8 pb-8">
          {recentTx.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No transactions yet. Start making sales from the POS!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 font-display tracking-tight">Time</th>
                    <th className="text-right py-2 font-display tracking-tight">Amount</th>
                    <th className="text-right py-2 font-display tracking-tight">Tokens</th>
                    <th className="text-left py-2 font-display tracking-tight">Payment</th>
                    <th className="text-left py-2 font-display tracking-tight">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.map((tx) => (
                    <tr key={tx.id} className="border-b border-border last:border-0">
                      <td className="py-2">{safeFormatDate(tx.created_at, 'MMM dd, h:mm a')}</td>
                      <td className="text-right font-medium">{currency(tx.amount_paid)}</td>
                      <td className="text-right">{tx.tokens_given}</td>
                      <td><Badge variant={tx.payment_type === 'cash' ? 'secondary' : 'outline'}>{tx.payment_type}</Badge></td>
                      <td>{tx.is_loyalty_bonus && <Badge variant="default" className="bg-warning text-warning-foreground">Loyalty</Badge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
