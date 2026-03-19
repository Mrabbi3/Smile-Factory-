'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { safeFormatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tag, Plus, Trash2, Edit, Percent, DollarSign } from 'lucide-react'
import type { Coupon } from '@/types/database'

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const emptyCoupon = {
  code: '', description: '', discount_type: 'percentage' as string, discount_value: '',
  min_purchase: '0', valid_from: format(new Date(), 'yyyy-MM-dd'),
  valid_until: '', usage_limit: '0', is_active: true,
}

export default function CouponsPage() {
  const supabase = createClient()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [form, setForm] = useState(emptyCoupon)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadCoupons() }, [])

  const loadCoupons = async () => {
    try {
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
      setCoupons((data as Coupon[]) || [])
    } catch (err: any) {
      console.error('Failed to load coupons:', err)
      toast.error(err?.message || 'Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const activeCoupons = coupons.filter(c => c.is_active)
  const totalRedemptions = coupons.reduce((s, c) => s + c.times_used, 0)

  const openAdd = () => { setEditing(null); setForm(emptyCoupon); setDialogOpen(true) }
  const openEdit = (c: Coupon) => {
    setEditing(c)
    setForm({
      code: c.code, description: c.description, discount_type: c.discount_type,
      discount_value: c.discount_value.toString(), min_purchase: c.min_purchase.toString(),
      valid_from: c.valid_from?.split('T')[0] || '', valid_until: c.valid_until?.split('T')[0] || '',
      usage_limit: c.usage_limit.toString(), is_active: c.is_active,
    })
    setDialogOpen(true)
  }

  const saveCoupon = async () => {
    if (!form.code || !form.discount_value) { toast.error('Code and discount value are required'); return }
    setSaving(true)
    try {
      const payload = {
        code: form.code.toUpperCase(),
        description: form.description,
        discount_type: form.discount_type,
        discount_value: parseFloat(form.discount_value),
        min_purchase: parseFloat(form.min_purchase) || 0,
        valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : new Date().toISOString(),
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
        usage_limit: parseInt(form.usage_limit) || 0,
        is_active: form.is_active,
      }
      if (editing) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('Coupon updated')
      } else {
        const { error } = await supabase.from('coupons').insert(payload)
        if (error) throw error
        toast.success('Coupon created')
      }
      setDialogOpen(false)
      loadCoupons()
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const deleteCoupon = async (id: string) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Coupon deleted'); loadCoupons() }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Coupon Management</h1>
          <p className="text-muted-foreground">Create and manage promotional codes</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Create Coupon</Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Coupons</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{coupons.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{activeCoupons.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Redemptions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalRedemptions}</div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No coupons yet</TableCell></TableRow>
              ) : coupons.map(c => (
                <TableRow key={c.id}>
                  <TableCell><code className="bg-muted px-2 py-1 rounded font-mono font-bold">{c.code}</code></TableCell>
                  <TableCell className="text-sm">{c.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {c.discount_type === 'percentage' ? `${c.discount_value}%` : currency(c.discount_value)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{c.times_used}{c.usage_limit > 0 ? `/${c.usage_limit}` : ''}</TableCell>
                  <TableCell className="text-sm">{c.valid_until ? safeFormatDate(c.valid_until, 'MMM dd, yyyy') : 'No expiry'}</TableCell>
                  <TableCell>
                    {c.is_active ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete coupon {c.code}?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCoupon(c.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle>
            <DialogDescription>Set up a promotional coupon code.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Code *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. SUMMER20" className="font-mono" /></div>
              <div className="grid gap-2">
                <Label>Discount Type</Label>
                <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Discount Value *</Label><Input type="number" min={0} value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Min Purchase ($)</Label><Input type="number" min={0} value={form.min_purchase} onChange={(e) => setForm({ ...form, min_purchase: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Valid From</Label><Input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Valid Until</Label><Input type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Usage Limit (0 = unlimited)</Label><Input type="number" min={0} value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} /></div>
              <div className="flex items-center gap-2 pt-6"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveCoupon} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
