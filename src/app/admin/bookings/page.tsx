'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { PARTY_CONFIG } from '@/lib/constants'
import { toast } from 'sonner'
import {
  format, addMinutes, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isBefore, startOfDay, addMonths, subMonths, parseISO
} from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Calendar, CalendarDays, Clock, Users, Phone, DollarSign, Plus,
  ChevronLeft, ChevronRight, AlertTriangle, PartyPopper, Eye, Edit,
  Mail, Download, Loader2
} from 'lucide-react'
import { generateBookingConfirmation } from '@/lib/pdf/generate-pdf'

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
}

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 10
  const min = i % 2 === 0 ? '00' : '30'
  if (hour >= 22) return null
  return `${hour.toString().padStart(2, '0')}:${min}`
}).filter(Boolean) as string[]

const emptyBooking = {
  contact_name: '', contact_phone: '', contact_email: '',
  package_id: '', booking_date: '', start_time: '12:00',
  num_kids: 1, num_adults: 0, is_adult_party: false,
  special_requests: '', deposit_paid: false, deposit_method: '',
  status: 'pending',
}

export default function BookingsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [bookings, setBookings] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(emptyBooking)
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list')
  const [calMonth, setCalMonth] = useState(new Date())
  const [tab, setTab] = useState('upcoming')
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [bRes, pRes] = await Promise.all([
      supabase.from('party_bookings').select('*').order('booking_date', { ascending: true }),
      supabase.from('party_packages').select('*').eq('is_active', true),
    ])
    setBookings(bRes.data || [])
    setPackages(pRes.data || [])
    setLoading(false)
  }

  const today = startOfDay(new Date())
  const upcoming = bookings.filter(b => !isBefore(parseISO(b.booking_date), today) && ['pending', 'confirmed'].includes(b.status))
  const completed = bookings.filter(b => b.status === 'completed')
  const cancelled = bookings.filter(b => b.status === 'cancelled')

  const getEndTime = (start: string) => {
    const [h, m] = start.split(':').map(Number)
    const d = new Date(2000, 0, 1, h, m)
    return format(addMinutes(d, PARTY_CONFIG.durationMinutes), 'HH:mm')
  }

  const checkConflict = (date: string, startTime: string) => {
    const endTime = getEndTime(startTime)
    return bookings.some(b => {
      if (b.booking_date !== date || ['cancelled'].includes(b.status)) return false
      if (editing && b.id === editing.id) return false
      const bEnd = b.end_time || getEndTime(b.start_time)
      const bufferStart = format(addMinutes(parseISO(`2000-01-01T${b.start_time}`), -(PARTY_CONFIG.bufferMinutes)), 'HH:mm')
      const bufferEnd = format(addMinutes(parseISO(`2000-01-01T${bEnd}`), PARTY_CONFIG.bufferMinutes), 'HH:mm')
      return startTime < bufferEnd && endTime > bufferStart
    })
  }

  const saveBooking = async () => {
    if (!form.contact_name || !form.booking_date || !form.start_time) {
      toast.error('Contact name, date, and time are required')
      return
    }
    if (checkConflict(form.booking_date, form.start_time)) {
      toast.error('Time conflict! There is already a booking during this time (including buffer).')
      return
    }

    setSaving(true)
    try {
      const endTime = getEndTime(form.start_time)
      const pkg = packages.find(p => p.id === form.package_id)
      const payload = {
        ...form,
        end_time: endTime,
        total_amount: pkg ? pkg.base_price + Math.max(0, form.num_kids - (pkg.max_kids || 12)) * 14.95 : 0,
        deposit_amount: PARTY_CONFIG.depositAmount,
        customer_id: user?.id,
      }

      if (editing) {
        const { error } = await supabase.from('party_bookings').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('Booking updated')
      } else {
        const { data: inserted, error } = await supabase.from('party_bookings').insert(payload).select('*')
        if (error) throw error
        toast.success('Booking created')

        if (inserted?.[0]?.contact_email) {
          sendBookingEmail(inserted[0])
        }
      }
      setDialogOpen(false)
      loadData()
    } catch (err: any) {
      toast.error(err.message)
    } finally { setSaving(false) }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyBooking)
    setDialogOpen(true)
  }

  const openEdit = (b: any) => {
    setEditing(b)
    setForm({
      contact_name: b.contact_name, contact_phone: b.contact_phone, contact_email: b.contact_email,
      package_id: b.package_id || '', booking_date: b.booking_date, start_time: b.start_time,
      num_kids: b.num_kids, num_adults: b.num_adults, is_adult_party: b.is_adult_party,
      special_requests: b.special_requests || '', deposit_paid: b.deposit_paid,
      deposit_method: b.deposit_method || '', status: b.status,
    })
    setDialogOpen(true)
  }

  const updateStatus = async (id: string, status: string) => {
    const extra: any = {}
    if (status === 'completed') extra.completed_at = new Date().toISOString()
    const { error } = await supabase.from('party_bookings').update({ status, ...extra }).eq('id', id)
    if (error) { toast.error(error.message); return }

    toast.success(`Status updated to ${status}`)
    loadData()

    if (status === 'confirmed') {
      const booking = bookings.find((b) => b.id === id)
      if (booking?.contact_email) {
        sendBookingEmail({ ...booking, status: 'confirmed' })
      }
    }
  }

  const buildBookingEmailData = (b: any) => {
    const pkg = packages.find((p) => p.id === b.package_id)
    return {
      contactName: b.contact_name,
      contactEmail: b.contact_email,
      contactPhone: b.contact_phone,
      bookingDate: b.booking_date,
      startTime: b.start_time,
      endTime: b.end_time || getEndTime(b.start_time),
      packageName: pkg?.name || 'Standard Party',
      numKids: b.num_kids,
      numAdults: b.num_adults || 0,
      totalAmount: Number(b.total_amount || 0),
      depositAmount: Number(b.deposit_amount || PARTY_CONFIG.depositAmount),
      depositPaid: b.deposit_paid,
      specialRequests: b.special_requests || '',
      status: b.status,
    }
  }

  const sendBookingEmail = async (b: any) => {
    if (!b.contact_email) {
      toast.error('No email address for this booking')
      return
    }
    setSendingEmailId(b.id)
    try {
      const data = buildBookingEmailData(b)
      const doc = generateBookingConfirmation(data)
      const pdfBase64 = doc.output('datauristring').split(',')[1]

      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'booking-confirmation',
          to: b.contact_email,
          data,
          pdfBase64,
          pdfFilename: `booking-confirmation-${b.booking_date}.pdf`,
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Failed to send')
      }

      toast.success(`Confirmation emailed to ${b.contact_email}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to send email')
    } finally {
      setSendingEmailId(null)
    }
  }

  const downloadBookingPdf = (b: any) => {
    const data = buildBookingEmailData(b)
    const doc = generateBookingConfirmation(data)
    doc.save(`booking-${b.contact_name.replace(/\s+/g, '-').toLowerCase()}-${b.booking_date}.pdf`)
  }

  // Calendar view helpers
  const monthStart = startOfMonth(calMonth)
  const monthEnd = endOfMonth(calMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart)

  const bookingsForDate = (date: Date) =>
    bookings.filter(b => isSameDay(parseISO(b.booking_date), date) && b.status !== 'cancelled')

  const renderList = (list: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Kids</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Deposit</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No bookings found</TableCell>
          </TableRow>
        ) : list.map((b) => (
          <TableRow key={b.id}>
            <TableCell className="font-medium">{format(parseISO(b.booking_date), 'MMM dd, yyyy')}</TableCell>
            <TableCell>{b.start_time} - {b.end_time || getEndTime(b.start_time)}</TableCell>
            <TableCell>
              <div>{b.contact_name}</div>
              <div className="text-xs text-muted-foreground">{b.contact_phone}</div>
            </TableCell>
            <TableCell>
              {b.num_kids}
              {b.num_kids > PARTY_CONFIG.maxKidsBeforeCall && (
                <AlertTriangle className="inline ml-1 h-3 w-3 text-amber-500" />
              )}
            </TableCell>
            <TableCell><Badge className={STATUS_COLORS[b.status]}>{b.status}</Badge></TableCell>
            <TableCell>
              {b.deposit_paid ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600">Pending</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => openEdit(b)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="Download PDF" onClick={() => downloadBookingPdf(b)}>
                  <Download className="h-4 w-4" />
                </Button>
                {b.contact_email && (
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8" title="Email confirmation"
                    disabled={sendingEmailId === b.id}
                    onClick={() => sendBookingEmail(b)}
                  >
                    {sendingEmailId === b.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  </Button>
                )}
                {b.status === 'pending' && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'confirmed')}>Confirm</Button>
                )}
                {b.status === 'confirmed' && (
                  <Button size="sm" variant="outline" onClick={() => updateStatus(b.id, 'completed')}>Complete</Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Party Bookings</h1>
          <p className="text-muted-foreground">Manage birthday parties and events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'calendar' ? 'list' : 'calendar')}>
            {viewMode === 'calendar' ? <CalendarDays className="mr-2 h-4 w-4" /> : <Calendar className="mr-2 h-4 w-4" />}
            {viewMode === 'calendar' ? 'List View' : 'Calendar View'}
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Upcoming</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{upcoming.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">This Month</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{bookings.filter(b => b.booking_date?.startsWith(format(new Date(), 'yyyy-MM'))).length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Deposits</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{upcoming.filter(b => !b.deposit_paid).length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Revenue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{currency(completed.reduce((s, b) => s + Number(b.total_amount || 0), 0))}</div></CardContent>
        </Card>
      </div>

      {viewMode === 'calendar' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setCalMonth(subMonths(calMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle>{format(calMonth, 'MMMM yyyy')}</CardTitle>
              <Button variant="ghost" onClick={() => setCalMonth(addMonths(calMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="font-medium text-muted-foreground py-2">{d}</div>
              ))}
              {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
              {monthDays.map((day) => {
                const dayBookings = bookingsForDate(day)
                const isToday = isSameDay(day, new Date())
                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-16 border rounded-md p-1 cursor-pointer hover:bg-accent transition-colors ${isToday ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => { setForm({ ...emptyBooking, booking_date: format(day, 'yyyy-MM-dd') }); setEditing(null); setDialogOpen(true) }}
                  >
                    <div className={`text-xs ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                      {format(day, 'd')}
                    </div>
                    {dayBookings.map(b => (
                      <div key={b.id} className={`text-xs rounded px-1 mt-0.5 truncate ${STATUS_COLORS[b.status]}`}>
                        {b.start_time} {b.contact_name}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
                <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="upcoming" className="mt-4">{renderList(upcoming)}</TabsContent>
              <TabsContent value="all" className="mt-4">{renderList(bookings)}</TabsContent>
              <TabsContent value="completed" className="mt-4">{renderList(completed)}</TabsContent>
              <TabsContent value="cancelled" className="mt-4">{renderList(cancelled)}</TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Booking Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Booking' : 'New Booking'}</DialogTitle>
            <DialogDescription>Fill in the party booking details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Contact Name *</Label>
                <Input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Phone *</Label>
                <Input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Package</Label>
              <Select value={form.package_id} onValueChange={(v) => setForm({ ...form, package_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select a package" /></SelectTrigger>
                <SelectContent>
                  {packages.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} - {currency(p.base_price)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date *</Label>
                <Input type="date" value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value })} min={format(new Date(), 'yyyy-MM-dd')} />
              </div>
              <div className="grid gap-2">
                <Label>Start Time *</Label>
                <Select value={form.start_time} onValueChange={(v) => setForm({ ...form, start_time: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.booking_date && form.start_time && checkConflict(form.booking_date, form.start_time) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Time conflict detected! Choose a different time.
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Number of Kids</Label>
                <Input type="number" min={1} value={form.num_kids} onChange={(e) => setForm({ ...form, num_kids: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="grid gap-2">
                <Label>Number of Adults</Label>
                <Input type="number" min={0} value={form.num_adults} onChange={(e) => setForm({ ...form, num_adults: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            {form.num_kids > PARTY_CONFIG.maxKidsBeforeCall && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                For parties with more than {PARTY_CONFIG.maxKidsBeforeCall} kids, a phone call is recommended to discuss arrangements.
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch checked={form.is_adult_party} onCheckedChange={(v) => setForm({ ...form, is_adult_party: v })} />
              <Label>Adult Party</Label>
            </div>
            <div className="grid gap-2">
              <Label>Special Requests</Label>
              <Textarea value={form.special_requests} onChange={(e) => setForm({ ...form, special_requests: e.target.value })} />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.deposit_paid} onCheckedChange={(v) => setForm({ ...form, deposit_paid: v })} />
                <Label>Deposit Paid (${PARTY_CONFIG.depositAmount})</Label>
              </div>
              {form.deposit_paid && (
                <div className="grid gap-2">
                  <Label>Payment Method</Label>
                  <Select value={form.deposit_method} onValueChange={(v) => setForm({ ...form, deposit_method: v })}>
                    <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="venmo">Venmo</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {editing && (
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveBooking} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create Booking'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}