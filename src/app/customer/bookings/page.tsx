'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { PARTY_CONFIG } from '@/lib/constants'
import { toast } from 'sonner'
import { format, addMinutes } from 'date-fns'
import { safeFormatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Calendar, Plus, Phone, AlertTriangle } from 'lucide-react'

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 rounded-xl',
  confirmed: 'bg-emerald-100 text-emerald-800 rounded-xl',
  completed: 'bg-blue-100 text-blue-800 rounded-xl',
  cancelled: 'bg-red-100 text-red-800 rounded-xl',
}

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = Math.floor(i / 2) + 10
  const min = i % 2 === 0 ? '00' : '30'
  if (hour >= 22) return null
  return `${hour.toString().padStart(2, '0')}:${min}`
}).filter(Boolean) as string[]

export default function CustomerBookingsPage() {
  const { user, profile } = useAuth()
  const supabase = createClient()
  const [bookings, setBookings] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    package_id: '', booking_date: '', start_time: '12:00',
    num_kids: 1, num_adults: 0, is_adult_party: false, special_requests: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        const [bRes, pRes] = await Promise.all([
          supabase.from('party_bookings').select('*').eq('customer_id', user.id).order('booking_date', { ascending: false }),
          supabase.from('party_packages').select('*').eq('is_active', true),
        ])
        if (bRes.error) console.error('Bookings fetch error:', bRes.error)
        if (pRes.error) console.error('Packages fetch error:', pRes.error)
        setBookings(bRes.data || [])
        setPackages(pRes.data || [])
      } catch (err) {
        console.error('Bookings load error:', err)
        toast.error('Failed to load bookings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const submitBooking = async () => {
    if (!form.package_id || !form.booking_date || !form.start_time) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      const [h, m] = form.start_time.split(':').map(Number)
      const endTime = format(addMinutes(new Date(2000, 0, 1, h, m), PARTY_CONFIG.durationMinutes), 'HH:mm')
      const pkg = packages.find(p => p.id === form.package_id)
      const extraKids = Math.max(0, form.num_kids - (pkg?.max_kids || 12))
      const totalAmount = (pkg?.base_price || 0) + extraKids * 14.95

      const { error } = await supabase.from('party_bookings').insert({
        customer_id: user?.id,
        package_id: form.package_id,
        booking_date: form.booking_date,
        start_time: form.start_time,
        end_time: endTime,
        num_kids: form.num_kids,
        num_adults: form.num_adults,
        is_adult_party: form.is_adult_party,
        special_requests: form.special_requests,
        total_amount: totalAmount,
        deposit_amount: PARTY_CONFIG.depositAmount,
        contact_name: `${profile?.first_name} ${profile?.last_name}`,
        contact_phone: profile?.phone || '',
        contact_email: profile?.email || '',
        status: 'pending',
      })
      if (error) throw error
      toast.success('Booking request submitted! We\'ll confirm your reservation soon.')
      setDialogOpen(false)
      const { data } = await supabase.from('party_bookings').select('*').eq('customer_id', user?.id).order('booking_date', { ascending: false })
      setBookings(data || [])
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your party reservations</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="rounded-xl"><Plus className="mr-2 h-4 w-4" />Book a Party</Button>
      </div>

      <Card className="rounded-2xl shadow-ambient">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Kids</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deposit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary mx-auto mb-4">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <p className="text-muted-foreground font-medium">No bookings yet</p>
                    <Button className="mt-4 rounded-xl" onClick={() => setDialogOpen(true)}>Book Your First Party</Button>
                  </TableCell>
                </TableRow>
              ) : bookings.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{safeFormatDate(b.booking_date, 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{b.start_time} - {b.end_time}</TableCell>
                  <TableCell>{b.num_kids}</TableCell>
                  <TableCell>{currency(b.total_amount)}</TableCell>
                  <TableCell><Badge className={STATUS_COLORS[b.status]}>{b.status}</Badge></TableCell>
                  <TableCell>{b.deposit_paid ? <Badge className="bg-emerald-100 text-emerald-800 rounded-xl">Paid</Badge> : <Badge variant="outline" className="rounded-xl">Pending</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-display tracking-tight">Book a Party</DialogTitle>
            <DialogDescription>Submit a party reservation request. Our team will confirm availability.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="font-display">Package *</Label>
              <Select value={form.package_id} onValueChange={(v) => setForm({ ...form, package_id: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select a package" /></SelectTrigger>
                <SelectContent>
                  {packages.map(p => <SelectItem key={p.id} value={p.id}>{p.name} — {currency(p.base_price)} (up to {p.max_kids} kids)</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-display">Date *</Label>
                <Input type="date" value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value })} min={format(new Date(), 'yyyy-MM-dd')} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-display">Start Time *</Label>
                <Select value={form.start_time} onValueChange={(v) => setForm({ ...form, start_time: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-display">Number of Kids *</Label>
                <Input type="number" min={1} value={form.num_kids} onChange={(e) => setForm({ ...form, num_kids: parseInt(e.target.value) || 1 })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="font-display">Number of Adults</Label>
                <Input type="number" min={0} value={form.num_adults} onChange={(e) => setForm({ ...form, num_adults: parseInt(e.target.value) || 0 })} className="rounded-xl" />
              </div>
            </div>
            {form.num_kids > PARTY_CONFIG.maxKidsBeforeCall && (
              <div className="rounded-xl bg-amber-50/80 p-3 text-sm text-amber-800 flex items-center gap-2 shadow-ambient">
                <Phone className="h-4 w-4 shrink-0" />
                For parties over {PARTY_CONFIG.maxKidsBeforeCall} kids, please also call us at (609) 266-3866 to discuss arrangements.
              </div>
            )}
            <div className="flex items-center gap-3">
              <Switch checked={form.is_adult_party} onCheckedChange={(v) => setForm({ ...form, is_adult_party: v })} />
              <Label className="font-display cursor-pointer">This is an adult party</Label>
            </div>
            <div className="space-y-2">
              <Label className="font-display">Special Requests</Label>
              <Textarea value={form.special_requests} onChange={(e) => setForm({ ...form, special_requests: e.target.value })} placeholder="Any special requirements..." className="rounded-xl" />
            </div>
            <div className="rounded-xl bg-[var(--surface-container-low)] p-4 text-sm space-y-1">
              <p>A <strong className="text-primary">${PARTY_CONFIG.depositAmount} deposit</strong> is required to confirm your reservation.</p>
              <p className="text-muted-foreground">The party is {PARTY_CONFIG.durationMinutes / 60} hours in a private decorated party room.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={submitBooking} disabled={saving} className="rounded-xl">{saving ? 'Submitting...' : 'Submit Booking Request'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
