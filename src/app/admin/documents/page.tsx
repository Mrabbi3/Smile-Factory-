'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { LucideIcon } from 'lucide-react'
import {
  FileText,
  BookOpen,
  Shield,
  PartyPopper,
  Wrench,
  Package,
  Phone,
  ClipboardList,
  BarChart3,
  Calendar,
  ShoppingCart,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { startOfDay } from 'date-fns'

type DocCategory =
  | 'Operations Manual'
  | 'Safety Procedures'
  | 'Employee Handbook'
  | 'Party Planning Guide'
  | 'Machine Maintenance Guide'
  | 'Inventory Procedures'

type DocItem = {
  title: string
  description: string
  category: DocCategory
  icon: LucideIcon
  accent: string
}

const DOCUMENTS: DocItem[] = [
  {
    title: 'Daily operations playbook',
    description:
      'Opening and closing checklists, shift handoffs, cash handling basics, and floor communication standards.',
    category: 'Operations Manual',
    icon: FileText,
    accent: 'bg-primary/10 text-primary',
  },
  {
    title: 'Safety & incident response',
    description:
      'PPE expectations, slip/trip hazards, machine guard rules, and what to do if someone is injured on site.',
    category: 'Safety Procedures',
    icon: Shield,
    accent: 'bg-rose-100 text-rose-700',
  },
  {
    title: 'Roles, time off, and conduct',
    description:
      'Attendance expectations, dress code, customer interaction tone, and escalation paths for HR questions.',
    category: 'Employee Handbook',
    icon: BookOpen,
    accent: 'bg-violet-100 text-violet-800',
  },
  {
    title: 'Birthday parties & group events',
    description:
      'Room setup, timing blocks, add-ons, parent communication, and cleanup so every party runs smoothly.',
    category: 'Party Planning Guide',
    icon: PartyPopper,
    accent: 'bg-amber-100 text-amber-900',
  },
  {
    title: 'Arcade & redemption equipment',
    description:
      'Routine checks, when to tag out a machine, vendor contacts, and basic troubleshooting before calling service.',
    category: 'Machine Maintenance Guide',
    icon: Wrench,
    accent: 'bg-sky-100 text-sky-800',
  },
  {
    title: 'Stock, counts, and shrink',
    description:
      'Receiving steps, prize rotation, low-stock alerts, and how to record waste or damaged inventory.',
    category: 'Inventory Procedures',
    icon: Package,
    accent: 'bg-emerald-100 text-emerald-900',
  },
]

const QUICK_LINKS: { label: string; description: string; href: string; icon: LucideIcon }[] = [
  {
    label: 'Point of sale',
    description: 'Token sales, comps, and end-of-shift reconciliation.',
    href: '/admin/pos',
    icon: ShoppingCart,
  },
  {
    label: 'Bookings',
    description: 'Party calendar, holds, and confirmations.',
    href: '/admin/bookings',
    icon: Calendar,
  },
  {
    label: 'Inventory',
    description: 'Prize catalog, stock levels, and reorders.',
    href: '/admin/inventory',
    icon: Package,
  },
  {
    label: 'Work orders',
    description: 'Repairs, follow-ups, and maintenance tasks.',
    href: '/admin/work-orders',
    icon: ClipboardList,
  },
]

export default function DocumentsPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState({
    openWorkOrders: 0,
    upcomingBookings: 0,
  })

  const loadStats = useCallback(async () => {
    setStatsLoading(true)
    const today = startOfDay(new Date()).toISOString()
    try {
      const [wo, bookings] = await Promise.all([
        supabase
          .from('work_orders')
          .select('id', { count: 'exact', head: true })
          .in('status', ['open', 'in_progress']),
        supabase
          .from('party_bookings')
          .select('id', { count: 'exact', head: true })
          .gte('booking_date', today)
          .in('status', ['pending', 'confirmed']),
      ])
      setStats({
        openWorkOrders: wo.count ?? 0,
        upcomingBookings: bookings.count ?? 0,
      })
    } catch (e) {
      console.error('Documents hub stats error:', e)
      setStats({ openWorkOrders: 0, upcomingBookings: 0 })
    } finally {
      setStatsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (authLoading) return
    void loadStats()
  }, [authLoading, loadStats])

  const loading = authLoading || statsLoading

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 max-w-full rounded-lg" />
          <Skeleton className="h-5 w-full max-w-xl rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="font-display text-4xl font-black tracking-tight text-gray-900 lg:text-5xl">
          Document hub
        </h1>
        <p className="mt-3 max-w-3xl text-lg font-medium text-gray-500">
          Central reference for Smile Factory staff — policies, safety, operations, and quick links to the tools you use
          every day. Hi,{' '}
          <span className="font-semibold text-gray-800">{profile?.first_name?.trim() || 'team'}</span>.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardContent className="flex flex-col gap-1 p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Open work orders</p>
            <p className="font-display text-3xl font-black tracking-tight text-gray-900">{stats.openWorkOrders}</p>
            <Link
              href="/admin/work-orders"
              className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
            >
              View queue
              <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardContent className="flex flex-col gap-1 p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Upcoming bookings</p>
            <p className="font-display text-3xl font-black tracking-tight text-gray-900">{stats.upcomingBookings}</p>
            <Link
              href="/admin/bookings"
              className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
            >
              Calendar
              <ArrowRight className="size-4" />
            </Link>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm sm:col-span-2 lg:col-span-2">
          <CardContent className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Reports</p>
              <p className="font-display text-xl font-black tracking-tight text-gray-900">Generate business reports</p>
              <p className="mt-1 text-sm font-medium text-gray-500">
                Sales, inventory, and operational summaries — export or review in one place.
              </p>
            </div>
            <Button className="shrink-0 rounded-xl font-black" asChild>
              <Link href="/admin/reports">
                <BarChart3 className="size-4" />
                Open reports
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="font-display text-2xl font-black tracking-tight text-gray-900">Quick access</h2>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Jump straight into the systems that pair with these reference docs.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="group block h-full">
              <Card className="h-full rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow group-hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-gray-50 text-primary">
                      <item.icon className="size-5" />
                    </div>
                    <ExternalLink className="size-4 text-gray-300 transition-colors group-hover:text-primary" />
                  </div>
                  <CardTitle className="font-display text-lg font-black tracking-tight">{item.label}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm font-medium leading-relaxed text-gray-500">{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-black tracking-tight text-gray-900">Reference library</h2>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Placeholder links until PDFs or internal pages are wired up — each card maps to a standard document category.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DOCUMENTS.map((doc) => (
            <Card
              key={doc.title}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${doc.accent}`}
                  >
                    <doc.icon className="size-6" aria-hidden />
                  </div>
                  <Badge variant="secondary" className="font-bold">
                    {doc.category}
                  </Badge>
                </div>
                <CardTitle className="font-display pt-2 text-xl font-black tracking-tight leading-snug">
                  {doc.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="mt-auto flex flex-1 flex-col pt-0">
                <p className="text-sm font-medium leading-relaxed text-gray-600">{doc.description}</p>
                <Button className="mt-6 w-full rounded-xl font-black" variant="outline" asChild>
                  <a href="#">
                    View
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl font-black tracking-tight">Staff guide &amp; daily ops</CardTitle>
            <p className="text-sm font-medium text-gray-500">
              Short checklist everyone should know — expand into full SOPs in your Operations Manual.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm font-medium text-gray-700">
            <ul className="list-inside list-disc space-y-2 leading-relaxed">
              <li>Clock in, review the shift handoff note, and confirm who is lead on the floor.</li>
              <li>Walk the game floor before opening — trip hazards, loose cables, and out-of-order signage.</li>
              <li>Balance the drawer per POS policy; never leave cash unattended on the counter.</li>
              <li>Guests first: greet within 30 seconds, use names when on a booking, thank them on the way out.</li>
              <li>Escalate incidents (injury, theft, angry guest) to a manager immediately — document what you saw.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl font-black tracking-tight">Emergency contacts</CardTitle>
            <p className="text-sm font-medium text-gray-500">
              Keep these numbers posted at the register and in the break room. Replace placeholders with your real list.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { role: 'Emergency (police / fire / EMS)', value: '911', note: 'Life safety only' },
              { role: 'After-hours building / landlord', value: '(555) 010-0200', note: 'Lockouts & leaks' },
              { role: 'IT / POS support', value: '(555) 010-0300', note: 'Card readers & registers' },
              { role: 'Arcade service vendor', value: '(555) 010-0400', note: 'Major machine outages' },
            ].map((row) => (
              <div
                key={row.role}
                className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="text-sm font-black text-gray-900">{row.role}</p>
                    <p className="text-xs font-medium text-gray-500">{row.note}</p>
                  </div>
                </div>
                <a
                  href={`tel:${row.value.replace(/\D/g, '')}`}
                  className="shrink-0 font-mono text-sm font-bold text-primary hover:underline"
                >
                  {row.value}
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl font-black tracking-tight">Business policies</CardTitle>
          <p className="text-sm font-medium text-gray-500">
            Plain-language reminders for staff and managers. Align wording with your Employee Handbook and local law.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-gray-400">Customer experience</h3>
              <ul className="space-y-2 text-sm font-medium leading-relaxed text-gray-700">
                <li>We honor posted prices and party packages; surprises get manager approval before the guest leaves.</li>
                <li>Refund and rain-check rules follow the posted policy at the register — never argue in front of kids.</li>
                <li>Photography: respect caregiver wishes; no posting identifiable kids without consent.</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-gray-400">Workplace &amp; safety</h3>
              <ul className="space-y-2 text-sm font-medium leading-relaxed text-gray-700">
                <li>Zero tolerance for harassment; report concerns to a manager or owner in private.</li>
                <li>Only trained staff reset or open machines; use lockout procedures from the Maintenance Guide.</li>
                <li>Accidents get documented the same day — even near-misses help us fix the root cause.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
