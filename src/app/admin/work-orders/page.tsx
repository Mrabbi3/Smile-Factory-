'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { WORK_ORDER_PRIORITIES } from '@/lib/constants'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { safeFormatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  ClipboardList, Plus, AlertTriangle, CheckCircle, Clock, Wrench
} from 'lucide-react'
import type { WorkOrder } from '@/types/database'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-blue-500/10 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-amber-500/10 text-amber-700' },
  completed: { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500/10 text-gray-700' },
}

const emptyOrder = {
  title: '', description: '', priority: 'medium', assigned_to: '', machine_id: '', due_date: '',
}

export default function WorkOrdersPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const [orders, setOrders] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [machines, setMachines] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(emptyOrder)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('active')

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [oRes, eRes, mRes] = await Promise.all([
        supabase.from('work_orders').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, first_name, last_name, role').neq('role', 'customer'),
        supabase.from('machines').select('id, name'),
      ])
      setOrders(oRes.data || [])
      setEmployees(eRes.data || [])
      setMachines(mRes.data || [])
    } catch (err: any) {
      console.error('Failed to load work orders:', err)
      toast.error(err?.message || 'Failed to load work orders')
    } finally {
      setLoading(false)
    }
  }

  const active = orders.filter(o => ['open', 'in_progress'].includes(o.status))
  const completed = orders.filter(o => o.status === 'completed')
  const open = orders.filter(o => o.status === 'open')
  const inProgress = orders.filter(o => o.status === 'in_progress')
  const urgent = orders.filter(o => o.priority === 'urgent' && o.status !== 'completed' && o.status !== 'cancelled')

  const getEmployeeName = (id: string) => {
    const emp = employees.find(e => e.id === id)
    return emp ? `${emp.first_name} ${emp.last_name}` : 'Unassigned'
  }

  const getMachineName = (id: string) => machines.find(m => m.id === id)?.name || '—'

  const getPriorityBadge = (priority: string) => {
    const p = WORK_ORDER_PRIORITIES.find(wp => wp.value === priority)
    return <Badge className={`${p?.color || ''} rounded-lg`}>{p?.label || priority}</Badge>
  }

  const openCreate = () => { setEditing(null); setForm(emptyOrder); setDialogOpen(true) }
  const openEdit = (o: any) => {
    setEditing(o)
    setForm({
      title: o.title, description: o.description, priority: o.priority,
      assigned_to: o.assigned_to || '', machine_id: o.machine_id || '', due_date: o.due_date || '',
    })
    setDialogOpen(true)
  }

  const saveOrder = async () => {
    if (!form.title) { toast.error('Title is required'); return }
    if (!user?.id) { toast.error('You must be logged in'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        assigned_to: form.assigned_to || null,
        machine_id: form.machine_id || null,
        due_date: form.due_date || null,
        created_by: user?.id,
      }
      if (editing) {
        const { error } = await supabase.from('work_orders').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('Work order updated')
      } else {
        const { error } = await supabase.from('work_orders').insert(payload)
        if (error) throw error
        toast.success('Work order created')
      }
      setDialogOpen(false)
      loadData()
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const updateStatus = async (id: string, status: string) => {
    const extra: any = {}
    if (status === 'completed') extra.completed_at = new Date().toISOString()
    const { error } = await supabase.from('work_orders').update({ status, ...extra }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success(`Status updated`); loadData() }
  }

  const renderTable = (list: any[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead>Machine</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.length === 0 ? (
          <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No work orders</TableCell></TableRow>
        ) : list.map((o) => (
          <TableRow key={o.id}>
            <TableCell>
              <div className="font-medium">{o.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">{o.description}</div>
            </TableCell>
            <TableCell>{getPriorityBadge(o.priority)}</TableCell>
            <TableCell><Badge className={`${STATUS_MAP[o.status]?.color} rounded-lg`}>{STATUS_MAP[o.status]?.label}</Badge></TableCell>
            <TableCell className="text-sm">{getEmployeeName(o.assigned_to)}</TableCell>
            <TableCell className="text-sm">{getMachineName(o.machine_id)}</TableCell>
            <TableCell className="text-sm">{safeFormatDate(o.due_date, 'MMM dd')}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(o)}>Edit</Button>
                {o.status === 'open' && <Button size="sm" variant="outline" onClick={() => updateStatus(o.id, 'in_progress')}>Start</Button>}
                {o.status === 'in_progress' && <Button size="sm" variant="outline" onClick={() => updateStatus(o.id, 'completed')}>Complete</Button>}
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
          <h1 className="font-display text-3xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-sm text-muted-foreground">Track maintenance and tasks</p>
        </div>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New Work Order</Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Open</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="font-display text-3xl font-bold">{open.length}</div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">In Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="font-display text-3xl font-bold text-amber-600">{inProgress.length}</div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Completed</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="font-display text-3xl font-bold text-emerald-600">{completed.length}</div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Urgent</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="font-display text-3xl font-bold text-destructive">{urgent.length}</div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-ambient">
        <CardContent className="pt-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="rounded-xl">
              <TabsTrigger value="active" className="rounded-lg">Active ({active.length})</TabsTrigger>
              <TabsTrigger value="all" className="rounded-lg">All ({orders.length})</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg">Completed ({completed.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-4">{renderTable(active)}</TabsContent>
            <TabsContent value="all" className="mt-4">{renderTable(orders)}</TabsContent>
            <TabsContent value="completed" className="mt-4">{renderTable(completed)}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold tracking-tight">{editing ? 'Edit Work Order' : 'New Work Order'}</DialogTitle>
            <DialogDescription>Fill in the work order details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {WORK_ORDER_PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Assign To</Label>
              <Select value={form.assigned_to} onValueChange={(v) => setForm({ ...form, assigned_to: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Link to Machine (optional)</Label>
              <Select value={form.machine_id} onValueChange={(v) => setForm({ ...form, machine_id: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select machine" /></SelectTrigger>
                <SelectContent>
                  {machines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveOrder} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
