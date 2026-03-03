'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Cpu, Plus, Wrench, Search, Edit } from 'lucide-react'
import type { Machine } from '@/types/database'

const MACHINE_TYPES = ['Skill Game', 'Racing', 'Sports', 'Classic', 'Redemption', 'Other']
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
}

const emptyMachine = {
  name: '', machine_type: 'Skill Game', tokens_per_play: 1, status: 'active',
  location_note: '', serial_number: '', purchase_date: '',
}

export default function MachinesPage() {
  const supabase = createClient()
  const [machines, setMachines] = useState<Machine[]>([])
  const [maintenance, setMaintenance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Machine | null>(null)
  const [form, setForm] = useState(emptyMachine)
  const [saving, setSaving] = useState(false)
  const [detailMachine, setDetailMachine] = useState<Machine | null>(null)
  const [maintForm, setMaintForm] = useState({ description: '', cost: '' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [mRes, maintRes] = await Promise.all([
      supabase.from('machines').select('*').order('name'),
      supabase.from('machine_maintenance').select('*').order('created_at', { ascending: false }).limit(100),
    ])
    setMachines((mRes.data as Machine[]) || [])
    setMaintenance(maintRes.data || [])
    setLoading(false)
  }

  const filtered = machines.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.machine_type.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setEditing(null); setForm(emptyMachine); setDialogOpen(true) }
  const openEdit = (m: Machine) => {
    setEditing(m)
    setForm({
      name: m.name, machine_type: m.machine_type, tokens_per_play: m.tokens_per_play,
      status: m.status, location_note: m.location_note || '', serial_number: m.serial_number || '',
      purchase_date: m.purchase_date || '',
    })
    setDialogOpen(true)
  }

  const saveMachine = async () => {
    if (!form.name) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('machines').update(form).eq('id', editing.id)
        if (error) throw error
        toast.success('Machine updated')
      } else {
        const { error } = await supabase.from('machines').insert(form)
        if (error) throw error
        toast.success('Machine added')
      }
      setDialogOpen(false)
      loadData()
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const addMaintenance = async () => {
    if (!detailMachine || !maintForm.description) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('machine_maintenance').insert({
        machine_id: detailMachine.id,
        description: maintForm.description,
        cost: maintForm.cost ? parseFloat(maintForm.cost) : null,
        reported_by: user?.id,
      })
      if (error) throw error
      toast.success('Maintenance entry added')
      setMaintForm({ description: '', cost: '' })
      loadData()
    } catch (err: any) { toast.error(err.message) }
  }

  const resolveMaint = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('machine_maintenance').update({
      resolved: true, resolved_at: new Date().toISOString(), resolved_by: user?.id
    }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Marked as resolved'); loadData() }
  }

  const machMaint = detailMachine ? maintenance.filter(m => m.machine_id === detailMachine.id) : []

  const activeCount = machines.filter(m => m.status === 'active').length
  const maintCount = machines.filter(m => m.status === 'maintenance').length
  const inactiveCount = machines.filter(m => m.status === 'inactive').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Machine Management</h1>
          <p className="text-muted-foreground">Arcade machine directory and maintenance</p>
        </div>
        <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add Machine</Button>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{machines.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{activeCount}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Maintenance</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{maintCount}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Inactive</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-gray-600">{inactiveCount}</div></CardContent></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search machines..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Tokens/Play</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">{loading ? 'Loading...' : 'No machines found'}</TableCell></TableRow>
              ) : filtered.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell><Badge variant="outline">{m.machine_type}</Badge></TableCell>
                  <TableCell className="text-center">{m.tokens_per_play}</TableCell>
                  <TableCell><Badge className={STATUS_COLORS[m.status]}>{m.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.location_note || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setDetailMachine(m)}>
                        <Wrench className="h-4 w-4 mr-1" />Maint.
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Machine Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Machine' : 'Add Machine'}</DialogTitle>
            <DialogDescription>Enter machine details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={form.machine_type} onValueChange={(v) => setForm({ ...form, machine_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MACHINE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Tokens per Play</Label>
                <Input type="number" min={1} value={form.tokens_per_play} onChange={(e) => setForm({ ...form, tokens_per_play: parseInt(e.target.value) || 1 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Serial Number</Label><Input value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} /></div>
            </div>
            <div className="grid gap-2"><Label>Location Note</Label><Input value={form.location_note} onChange={(e) => setForm({ ...form, location_note: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Purchase Date</Label><Input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveMachine} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Machine Detail / Maintenance Dialog */}
      <Dialog open={!!detailMachine} onOpenChange={(o) => !o && setDetailMachine(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailMachine?.name} — Maintenance Log</DialogTitle>
            <DialogDescription>View and add maintenance entries.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>New Entry</Label>
              <Textarea placeholder="Describe the maintenance..." value={maintForm.description} onChange={(e) => setMaintForm({ ...maintForm, description: e.target.value })} />
              <div className="flex gap-2">
                <Input placeholder="Cost (optional)" type="number" value={maintForm.cost} onChange={(e) => setMaintForm({ ...maintForm, cost: e.target.value })} className="w-32" />
                <Button onClick={addMaintenance} disabled={!maintForm.description}>Add Entry</Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              {machMaint.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No maintenance history</p>
              ) : machMaint.map(m => (
                <div key={m.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm">{m.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(m.created_at), 'MMM dd, yyyy')}
                        {m.cost && ` · $${m.cost}`}
                      </p>
                    </div>
                    {m.resolved ? (
                      <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => resolveMaint(m.id)}>Resolve</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}