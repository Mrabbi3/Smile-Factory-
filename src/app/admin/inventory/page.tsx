'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Trophy, Package, AlertTriangle, Plus, Search, Edit, Trash2,
  Minus, ArrowUp, Ticket
} from 'lucide-react'
import type { Prize } from '@/types/database'

const CATEGORIES = ['Small Toys', 'Medium Prizes', 'Large Prizes', 'Electronics', 'Candy', 'Special']

const emptyPrize = {
  name: '', description: '', ticket_cost: 0, stock_quantity: 0,
  reorder_threshold: 5, category: 'Small Toys', is_active: true,
}

export default function InventoryPage() {
  const { isManager } = useAuth()
  const supabase = createClient()
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Prize | null>(null)
  const [form, setForm] = useState(emptyPrize)
  const [saving, setSaving] = useState(false)

  // Redemption state
  const [redeemOpen, setRedeemOpen] = useState(false)
  const [redeemPrize, setRedeemPrize] = useState<string>('')
  const [redeemQty, setRedeemQty] = useState(1)
  const [redeemTickets, setRedeemTickets] = useState(0)

  useEffect(() => { loadPrizes() }, [])

  const loadPrizes = async () => {
    try {
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .order('name', { ascending: true })
      if (!error) setPrizes((data as Prize[]) || [])
    } catch (err) {
      console.error('Failed to load prizes:', err)
      toast.error('Failed to load prizes')
    } finally {
      setLoading(false)
    }
  }

  const filtered = prizes.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false
    if (stockFilter === 'low' && p.stock_quantity > p.reorder_threshold) return false
    if (stockFilter === 'out' && p.stock_quantity > 0) return false
    return true
  })

  const lowStockCount = prizes.filter(p => p.is_active && p.stock_quantity <= p.reorder_threshold).length
  const totalPrizes = prizes.filter(p => p.is_active).length

  const openAdd = () => { setEditing(null); setForm(emptyPrize); setDialogOpen(true) }
  const openEdit = (p: Prize) => {
    setEditing(p)
    setForm({
      name: p.name, description: p.description || '', ticket_cost: p.ticket_cost,
      stock_quantity: p.stock_quantity, reorder_threshold: p.reorder_threshold,
      category: p.category, is_active: p.is_active,
    })
    setDialogOpen(true)
  }

  const savePrize = async () => {
    if (!form.name || form.ticket_cost <= 0) {
      toast.error('Name and ticket cost are required')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('prizes').update(form).eq('id', editing.id)
        if (error) throw error
        toast.success('Prize updated')
      } else {
        const { error } = await supabase.from('prizes').insert(form)
        if (error) throw error
        toast.success('Prize added')
      }
      setDialogOpen(false)
      loadPrizes()
    } catch (err: any) {
      toast.error(err.message)
    } finally { setSaving(false) }
  }

  const deletePrize = async (id: string) => {
    const { error } = await supabase.from('prizes').delete().eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Prize deleted'); loadPrizes() }
  }

  const adjustStock = async (id: string, delta: number) => {
    const prize = prizes.find(p => p.id === id)
    if (!prize) return
    const newQty = Math.max(0, prize.stock_quantity + delta)
    const { error } = await supabase.from('prizes').update({ stock_quantity: newQty }).eq('id', id)
    if (error) toast.error(error.message)
    else loadPrizes()
  }

  const logRedemption = async () => {
    if (!redeemPrize || redeemQty <= 0) return
    const prize = prizes.find(p => p.id === redeemPrize)
    if (!prize) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      toast.error('You must be logged in')
      return
    }
    const tickets = prize.ticket_cost * redeemQty

    try {
      const { error: rErr } = await supabase.from('prize_redemptions').insert({
        prize_id: redeemPrize,
        employee_id: user.id,
        tickets_used: tickets,
        quantity: redeemQty,
      })
      if (rErr) throw rErr

      await supabase.from('prizes').update({
        stock_quantity: Math.max(0, prize.stock_quantity - redeemQty)
      }).eq('id', redeemPrize)

      toast.success(`Redeemed ${redeemQty}x ${prize.name} for ${tickets} tickets`)
      setRedeemOpen(false)
      setRedeemPrize('')
      setRedeemQty(1)
      loadPrizes()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const stockBadge = (p: Prize) => {
    if (p.stock_quantity === 0) return <Badge className="bg-destructive/10 text-destructive">Out of Stock</Badge>
    if (p.stock_quantity <= p.reorder_threshold) return <Badge className="bg-amber-500/10 text-amber-700">Low Stock</Badge>
    return <Badge className="bg-emerald-500/10 text-emerald-700">In Stock</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Prize Inventory</h1>
          <p className="text-sm text-muted-foreground">Manage prizes and track redemptions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setRedeemOpen(true)}>
            <Ticket className="mr-2 h-4 w-4" />
            Log Redemption
          </Button>
          <Button onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Prize
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Total Prizes</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="font-display text-3xl font-bold">{totalPrizes}</div>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Low Stock</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="font-display text-3xl font-bold text-amber-600">{lowStockCount}</div>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Categories</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="font-display text-3xl font-bold">{new Set(prizes.map(p => p.category)).size}</div>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                <Trophy className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Total Stock</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="font-display text-3xl font-bold">{prizes.reduce((s, p) => s + p.stock_quantity, 0)}</div>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search prizes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40 rounded-xl"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger className="w-36 rounded-xl"><SelectValue placeholder="Stock" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="out">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Prize Table */}
      <Card className="rounded-2xl shadow-ambient">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prize</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Ticket Cost</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {loading ? 'Loading...' : 'No prizes found'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.name}</div>
                      {p.description && <div className="text-xs text-muted-foreground">{p.description}</div>}
                    </TableCell>
                    <TableCell><Badge variant="outline" className="rounded-xl">{p.category}</Badge></TableCell>
                    <TableCell className="text-right font-mono">{p.ticket_cost.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => adjustStock(p.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-mono w-8 text-center">{p.stock_quantity}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => adjustStock(p.id, 1)}>
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{stockBadge(p)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete {p.name}?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deletePrize(p.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Prize Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold tracking-tight">{editing ? 'Edit Prize' : 'Add New Prize'}</DialogTitle>
            <DialogDescription>Fill in the prize details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Ticket Cost *</Label>
                <Input type="number" min={1} value={form.ticket_cost} onChange={(e) => setForm({ ...form, ticket_cost: parseInt(e.target.value) || 0 })} className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Stock Quantity</Label>
                <Input type="number" min={0} value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: parseInt(e.target.value) || 0 })} className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label>Reorder Threshold</Label>
                <Input type="number" min={0} value={form.reorder_threshold} onChange={(e) => setForm({ ...form, reorder_threshold: parseInt(e.target.value) || 0 })} className="rounded-xl" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={savePrize} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add Prize'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redemption Dialog */}
      <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
        <DialogContent className="rounded-2xl shadow-elevated">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold tracking-tight">Log Prize Redemption</DialogTitle>
            <DialogDescription>Record a customer&apos;s prize redemption.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Prize</Label>
              <Select value={redeemPrize} onValueChange={(v) => { setRedeemPrize(v); setRedeemQty(1) }}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select a prize" /></SelectTrigger>
                <SelectContent>
                  {prizes.filter(p => p.is_active && p.stock_quantity > 0).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.ticket_cost} tickets, {p.stock_quantity} in stock)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Quantity</Label>
              <Input type="number" min={1} value={redeemQty} onChange={(e) => setRedeemQty(parseInt(e.target.value) || 1)} className="rounded-xl" />
            </div>
            {redeemPrize && (
              <div className="rounded-xl bg-[var(--surface-container-low)] px-4 py-3 text-sm">
                <p>Tickets Required: <span className="font-bold">{(prizes.find(p => p.id === redeemPrize)?.ticket_cost || 0) * redeemQty}</span></p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRedeemOpen(false)}>Cancel</Button>
            <Button onClick={logRedemption} disabled={!redeemPrize}>Confirm Redemption</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
