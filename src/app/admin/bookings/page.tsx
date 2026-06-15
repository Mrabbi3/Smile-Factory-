'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { safeFormatDate, currency, cn } from '@/lib/utils'
import type { PartyBooking, BookingStatus } from '@/types/database'
import { toast } from 'sonner'
import { Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const STATUS_FILTERS: Array<'all' | BookingStatus> = [
  'all',
  'pending',
  'confirmed',
  'completed',
  'cancelled',
]

const STATUS_BADGE: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-900 border-amber-200/80',
  confirmed: 'bg-blue-100 text-blue-900 border-blue-200/80',
  completed: 'bg-emerald-100 text-emerald-900 border-emerald-200/80',
  cancelled: 'bg-red-100 text-red-900 border-red-200/80',
}

/** Subtle row styling for status selects (matches badge palette). */
const STATUS_SELECT_TRIGGER: Record<BookingStatus, string> = {
  pending: 'border-amber-200/90 bg-amber-50/60 text-amber-950',
  confirmed: 'border-blue-200/90 bg-blue-50/60 text-blue-950',
  completed: 'border-emerald-200/90 bg-emerald-50/60 text-emerald-950',
  cancelled: 'border-red-200/90 bg-red-50/60 text-red-950',
}

function formatTime(value: string | null | undefined): string {
  if (!value) return '—'
  const s = String(value)
  return s.length >= 5 ? s.slice(0, 5) : s
}

function toNumber(n: unknown): number {
  if (typeof n === 'number' && !Number.isNaN(n)) return n
  const parsed = Number(n)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function AdminBookingsPage() {
  const { user, loading: authLoading, isManager } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [bookings, setBookings] = useState<PartyBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [detailTarget, setDetailTarget] = useState<PartyBooking | null>(null)

  const canManageBookings = isManager()

  const loadBookings = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('party_bookings')
        .select('*')
        .order('booking_date', { ascending: false })

      if (error) throw error
      setBookings((data as PartyBooking[]) ?? [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load bookings')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    loadBookings()
  }, [authLoading, user, loadBookings])

  const stats = useMemo(() => {
    const byStatus: Record<BookingStatus, number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    }
    let totalRevenue = 0
    for (const b of bookings) {
      if (b.status in byStatus) {
        byStatus[b.status as BookingStatus] += 1
      }
      totalRevenue += toNumber(b.total_amount)
    }
    return {
      total: bookings.length,
      byStatus,
      totalRevenue,
    }
  }, [bookings])

  const filteredBookings = useMemo(() => {
    if (statusFilter === 'all') return bookings
    return bookings.filter((b) => b.status === statusFilter)
  }, [bookings, statusFilter])

  const updateStatus = async (id: string, next: BookingStatus) => {
    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('party_bookings')
        .update({ status: next })
        .eq('id', id)

      if (error) throw error
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: next } : b))
      )
      toast.success('Booking status updated')
    } catch (err) {
      console.error(err)
      toast.error(
        err instanceof Error ? err.message : 'Could not update booking status'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const filterLabel =
    statusFilter === 'all' ? 'All bookings' : `${statusFilter} bookings`

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight text-foreground">
              Party bookings
            </h1>
            <p className="text-muted-foreground">
              Review reservations, deposits, and workflow status.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm font-semibold tracking-tight text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-16 rounded-lg" />
            ) : (
              <p className="font-display text-3xl font-black tracking-tight">
                {stats.total}
              </p>
            )}
          </CardContent>
        </Card>
        {(
          [
            ['pending', 'Pending'],
            ['confirmed', 'Confirmed'],
            ['completed', 'Completed'],
            ['cancelled', 'Cancelled'],
          ] as const
        ).map(([key, label]) => (
          <Card key={key} className="rounded-2xl border-0 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm font-semibold tracking-tight text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-9 w-12 rounded-lg" />
              ) : (
                <p className="font-display text-3xl font-black tracking-tight">
                  {stats.byStatus[key]}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-0 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-display text-lg font-black tracking-tight">
              {filterLabel}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {loading ? (
                'Loading…'
              ) : (
                <>
                  Showing{' '}
                  <span className="font-medium text-foreground">
                    {filteredBookings.length}
                  </span>{' '}
                  of {stats.total}
                  {!loading && stats.total > 0 && (
                    <span className="ml-2">
                      · Pipeline value{' '}
                      <span className="font-medium text-foreground">
                        {currency(stats.totalRevenue)}
                      </span>{' '}
                      (all bookings)
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
          <div
            className="flex flex-wrap gap-1 rounded-2xl bg-muted/50 p-1"
            role="tablist"
            aria-label="Filter by status"
          >
            {STATUS_FILTERS.map((key) => (
              <Button
                key={key}
                type="button"
                role="tab"
                aria-selected={statusFilter === key}
                variant={statusFilter === key ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'rounded-xl font-display text-xs font-semibold tracking-tight',
                  statusFilter === key && 'shadow-sm'
                )}
                onClick={() => setStatusFilter(key)}
              >
                {key === 'all' ? 'All' : key}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                <Calendar className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-display font-semibold tracking-tight">
                No bookings in this view
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {statusFilter === 'all'
                  ? 'Party reservations will appear here when customers book online.'
                  : `There are no ${statusFilter} bookings right now.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border/60">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-display font-semibold tracking-tight">
                      Contact
                    </TableHead>
                    <TableHead className="font-display font-semibold tracking-tight">
                      Phone
                    </TableHead>
                    <TableHead className="font-display font-semibold tracking-tight">
                      Date
                    </TableHead>
                    <TableHead className="font-display font-semibold tracking-tight">
                      Start
                    </TableHead>
                    <TableHead className="font-display font-semibold tracking-tight">
                      Kids
                    </TableHead>
                    <TableHead className="font-display font-semibold tracking-tight">
                      Status
                    </TableHead>
                    <TableHead className="font-display font-semibold tracking-tight">
                      Deposit
                    </TableHead>
                    <TableHead className="text-right font-display font-semibold tracking-tight">
                      Total
                    </TableHead>
                    <TableHead className="text-right font-display font-semibold tracking-tight">
                      Details
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="max-w-[180px] font-medium">
                        {b.contact_name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {b.contact_phone}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {safeFormatDate(b.booking_date, 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatTime(b.start_time)}
                      </TableCell>
                      <TableCell>{b.num_kids}</TableCell>
                      <TableCell>
                        {canManageBookings ? (
                          <Select
                            value={b.status}
                            onValueChange={(v) =>
                              updateStatus(b.id, v as BookingStatus)
                            }
                            disabled={updatingId === b.id}
                          >
                            <SelectTrigger
                              className={cn(
                                'h-9 w-[148px] rounded-xl font-display text-xs font-semibold tracking-tight',
                                STATUS_SELECT_TRIGGER[b.status]
                              )}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="pending">pending</SelectItem>
                              <SelectItem value="confirmed">confirmed</SelectItem>
                              <SelectItem value="completed">completed</SelectItem>
                              <SelectItem value="cancelled">cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant="outline"
                            className={cn(
                              'rounded-xl border font-display font-semibold capitalize tracking-tight',
                              STATUS_BADGE[b.status]
                            )}
                          >
                            {b.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {b.deposit_paid ? (
                          <Badge className="rounded-xl border border-emerald-200/80 bg-emerald-100 font-display font-semibold text-emerald-900 tracking-tight">
                            Paid
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="rounded-xl font-display font-semibold tracking-tight"
                          >
                            Unpaid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {currency(toNumber(b.total_amount))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => setDetailTarget(b)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {!canManageBookings && !authLoading && user && (
        <p className="text-center text-sm text-muted-foreground">
          Status changes are limited to owners and managers.
        </p>
      )}

      <Dialog
        open={!!detailTarget}
        onOpenChange={(open) => {
          if (!open) setDetailTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-black tracking-tight">
              {detailTarget?.contact_name}
            </DialogTitle>
            <DialogDescription>
              {detailTarget
                ? `${safeFormatDate(detailTarget.booking_date, 'EEEE, MMM d, yyyy')} · ${formatTime(
                    detailTarget.start_time
                  )}–${formatTime(detailTarget.end_time)}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {detailTarget && (
            <div className="space-y-4 text-sm">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Phone
                  </dt>
                  <dd className="font-medium">{detailTarget.contact_phone}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Email
                  </dt>
                  <dd className="font-medium break-all">{detailTarget.contact_email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Guests
                  </dt>
                  <dd className="font-medium">
                    {detailTarget.num_kids} kids · {detailTarget.num_adults} adults
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Status
                  </dt>
                  <dd className="font-medium capitalize">{detailTarget.status}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Deposit
                  </dt>
                  <dd className="font-medium">
                    {currency(toNumber(detailTarget.deposit_amount))}{' '}
                    {detailTarget.deposit_paid ? '(paid' : '(unpaid'}
                    {detailTarget.deposit_method ? ` · ${detailTarget.deposit_method})` : ')'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Total
                  </dt>
                  <dd className="font-medium">{currency(toNumber(detailTarget.total_amount))}</dd>
                </div>
              </dl>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Special requests / message
                </p>
                <div className="max-h-[40vh] overflow-y-auto whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50/80 p-4 leading-relaxed">
                  {detailTarget.special_requests?.trim()
                    ? detailTarget.special_requests
                    : 'No special requests provided.'}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
