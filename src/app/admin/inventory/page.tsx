'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import type { Prize } from '@/types/database'
import { toast } from 'sonner'
import { Trophy, Package, PencilLine } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { ImageUploadField } from '@/components/admin/image-upload-field'
import { cn } from '@/lib/utils'

function isLowStock(prize: Prize) {
  return prize.stock_quantity <= prize.reorder_threshold
}

type PrizeForm = {
  name: string
  description: string
  ticket_cost: string
  stock_quantity: string
  reorder_threshold: string
  category: string
  is_active: boolean
  image_url: string | null
}

const EMPTY_PRIZE_FORM: PrizeForm = {
  name: '',
  description: '',
  ticket_cost: '',
  stock_quantity: '0',
  reorder_threshold: '5',
  category: 'general',
  is_active: true,
  image_url: null,
}

export default function InventoryPage() {
  const { loading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<PrizeForm>(EMPTY_PRIZE_FORM)

  const [editTarget, setEditTarget] = useState<Prize | null>(null)
  const [editForm, setEditForm] = useState<PrizeForm>(EMPTY_PRIZE_FORM)
  const [editSaving, setEditSaving] = useState(false)

  const [stockTarget, setStockTarget] = useState<Prize | null>(null)
  const [stockInput, setStockInput] = useState('')
  const [stockSaving, setStockSaving] = useState(false)

  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadPrizes = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Prizes load error:', error.message)
        toast.error(error.message || 'Failed to load prizes')
        setPrizes([])
        return
      }
      setPrizes((data as Prize[]) ?? [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load prizes')
      setPrizes([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (authLoading) return
    loadPrizes()
  }, [authLoading, loadPrizes])

  const resetAddForm = () => {
    setForm(EMPTY_PRIZE_FORM)
  }

  const handleAddPrize = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = form.name.trim()
    if (!name) {
      toast.error('Name is required')
      return
    }
    const ticketCost = Number(form.ticket_cost)
    const stockQty = Number(form.stock_quantity)
    const reorder = Number(form.reorder_threshold)
    if (!Number.isFinite(ticketCost) || ticketCost < 0) {
      toast.error('Enter a valid ticket cost')
      return
    }
    if (!Number.isFinite(stockQty) || stockQty < 0) {
      toast.error('Enter a valid stock quantity')
      return
    }
    if (!Number.isFinite(reorder) || reorder < 0) {
      toast.error('Enter a valid reorder threshold')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.from('prizes').insert({
        name,
        description: form.description.trim() || null,
        ticket_cost: Math.round(ticketCost),
        stock_quantity: Math.round(stockQty),
        reorder_threshold: Math.round(reorder),
        category: form.category.trim() || 'general',
        is_active: form.is_active,
        image_url: form.image_url,
      })

      if (error) {
        toast.error(error.message || 'Could not add prize')
        return
      }
      toast.success('Prize added')
      resetAddForm()
      setAddOpen(false)
      await loadPrizes()
    } catch (err) {
      console.error(err)
      toast.error('Could not add prize')
    } finally {
      setSaving(false)
    }
  }

  const openEditDialog = (prize: Prize) => {
    setEditTarget(prize)
    setEditForm({
      name: prize.name,
      description: prize.description ?? '',
      ticket_cost: String(prize.ticket_cost),
      stock_quantity: String(prize.stock_quantity),
      reorder_threshold: String(prize.reorder_threshold),
      category: prize.category,
      is_active: prize.is_active,
      image_url: prize.image_url,
    })
  }

  const handleEditPrize = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTarget) return
    const name = editForm.name.trim()
    if (!name) {
      toast.error('Name is required')
      return
    }
    const ticketCost = Number(editForm.ticket_cost)
    const reorder = Number(editForm.reorder_threshold)
    if (!Number.isFinite(ticketCost) || ticketCost < 0) {
      toast.error('Enter a valid ticket cost')
      return
    }
    if (!Number.isFinite(reorder) || reorder < 0) {
      toast.error('Enter a valid reorder threshold')
      return
    }

    setEditSaving(true)
    try {
      const { error } = await supabase
        .from('prizes')
        .update({
          name,
          description: editForm.description.trim() || null,
          ticket_cost: Math.round(ticketCost),
          reorder_threshold: Math.round(reorder),
          category: editForm.category.trim() || 'general',
          is_active: editForm.is_active,
          image_url: editForm.image_url,
        })
        .eq('id', editTarget.id)

      if (error) {
        toast.error(error.message || 'Could not update prize')
        return
      }
      toast.success('Prize updated')
      setEditTarget(null)
      await loadPrizes()
    } catch (err) {
      console.error(err)
      toast.error('Could not update prize')
    } finally {
      setEditSaving(false)
    }
  }

  const openStockDialog = (prize: Prize) => {
    setStockTarget(prize)
    setStockInput(String(prize.stock_quantity))
  }

  const saveStock = async () => {
    if (!stockTarget) return
    const next = Number(stockInput)
    if (!Number.isFinite(next) || next < 0) {
      toast.error('Enter a valid stock quantity')
      return
    }
    setStockSaving(true)
    try {
      const { error } = await supabase
        .from('prizes')
        .update({ stock_quantity: Math.round(next) })
        .eq('id', stockTarget.id)

      if (error) {
        toast.error(error.message || 'Could not update stock')
        return
      }
      toast.success('Stock updated')
      setStockTarget(null)
      await loadPrizes()
    } catch (err) {
      console.error(err)
      toast.error('Could not update stock')
    } finally {
      setStockSaving(false)
    }
  }

  const toggleActive = async (prize: Prize) => {
    setTogglingId(prize.id)
    try {
      const { error } = await supabase
        .from('prizes')
        .update({ is_active: !prize.is_active })
        .eq('id', prize.id)

      if (error) {
        toast.error(error.message || 'Could not update status')
        return
      }
      toast.success(prize.is_active ? 'Prize deactivated' : 'Prize activated')
      await loadPrizes()
    } catch (err) {
      console.error(err)
      toast.error('Could not update status')
    } finally {
      setTogglingId(null)
    }
  }

  if (authLoading || (loading && prizes.length === 0)) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Skeleton className="h-12 w-72 max-w-full rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Trophy className="size-7" aria-hidden />
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight lg:text-5xl">
              Prize Inventory
            </h1>
          </div>
          <p className="max-w-2xl text-lg font-medium text-gray-500">
            Manage ticket redemption prizes, stock levels, and availability on the floor.
          </p>
        </div>
        <Button
          type="button"
          className="shrink-0 rounded-xl font-black uppercase tracking-widest"
          onClick={() => {
            resetAddForm()
            setAddOpen(true)
          }}
        >
          Add Prize
        </Button>
      </header>

      {prizes.length === 0 ? (
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Package className="size-12 text-gray-300" />
            <p className="font-display text-lg font-black tracking-tight text-gray-700">
              No prizes yet
            </p>
            <p className="max-w-md text-sm text-gray-500">
              Add your first prize to start tracking inventory and ticket costs.
            </p>
            <Button
              type="button"
              className="mt-2 rounded-xl font-black uppercase tracking-widest"
              onClick={() => {
                resetAddForm()
                setAddOpen(true)
              }}
            >
              Add Prize
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {prizes.map((prize) => {
            const low = isLowStock(prize)
            return (
              <Card
                key={prize.id}
                className={cn(
                  'rounded-2xl border bg-white shadow-sm',
                  low
                    ? 'border-red-200 bg-red-50/40 ring-1 ring-red-100'
                    : 'border-gray-100'
                )}
              >
                <CardHeader className="gap-3">
                  {prize.image_url && (
                    <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prize.image_url}
                        alt={prize.name}
                        className="h-36 w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="font-display text-lg font-black tracking-tight">
                      {prize.name}
                    </CardTitle>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                      {low && (
                        <Badge variant="destructive" className="font-black uppercase tracking-wide">
                          Low stock
                        </Badge>
                      )}
                      <Badge
                        variant={prize.is_active ? 'default' : 'secondary'}
                        className="font-black uppercase tracking-wide"
                      >
                        {prize.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  {prize.description ? (
                    <p className="text-sm leading-relaxed text-gray-600">{prize.description}</p>
                  ) : (
                    <p className="text-sm italic text-gray-400">No description</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Ticket cost
                      </dt>
                      <dd className="font-bold text-gray-900">{prize.ticket_cost.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Stock
                      </dt>
                      <dd
                        className={cn(
                          'font-bold',
                          low ? 'text-red-700' : 'text-gray-900'
                        )}
                      >
                        {prize.stock_quantity.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Reorder at
                      </dt>
                      <dd className="font-medium text-gray-700">
                        {prize.reorder_threshold.toLocaleString()}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Category
                      </dt>
                      <dd className="font-medium capitalize text-primary">{prize.category}</dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
                    <div className="flex flex-1 items-center gap-2 min-w-[140px]">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Active
                      </span>
                      <Switch
                        checked={prize.is_active}
                        disabled={togglingId === prize.id}
                        onCheckedChange={() => toggleActive(prize)}
                        aria-label={`Toggle active for ${prize.name}`}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-black uppercase tracking-widest"
                      onClick={() => openStockDialog(prize)}
                    >
                      <PencilLine className="size-4" />
                      Stock
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="rounded-xl font-black uppercase tracking-widest"
                      onClick={() => openEditDialog(prize)}
                    >
                      <PencilLine className="size-4" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddPrize}>
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-black tracking-tight">
                Add Prize
              </DialogTitle>
              <DialogDescription>
                Create a new redeemable prize. Stock and thresholds can be adjusted anytime.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="prize-name">Name</Label>
                <Input
                  id="prize-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Giant plush bear"
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prize-desc">Description</Label>
                <Input
                  id="prize-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description"
                  className="rounded-xl"
                />
              </div>
              <ImageUploadField
                folder="prizes"
                entityId="new"
                value={form.image_url}
                onChange={(url) => setForm((f) => ({ ...f, image_url: url }))}
                disabled={saving}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="ticket-cost">Ticket cost</Label>
                  <Input
                    id="ticket-cost"
                    type="number"
                    min={0}
                    value={form.ticket_cost}
                    onChange={(e) => setForm((f) => ({ ...f, ticket_cost: e.target.value }))}
                    placeholder="0"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock-qty">Stock quantity</Label>
                  <Input
                    id="stock-qty"
                    type="number"
                    min={0}
                    value={form.stock_quantity}
                    onChange={(e) => setForm((f) => ({ ...f, stock_quantity: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="reorder">Reorder threshold</Label>
                  <Input
                    id="reorder"
                    type="number"
                    min={0}
                    value={form.reorder_threshold}
                    onChange={(e) => setForm((f) => ({ ...f, reorder_threshold: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="general"
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
                <Label htmlFor="prize-active" className="cursor-pointer font-medium">
                  Listed as active
                </Label>
                <Switch
                  id="prize-active"
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl font-black uppercase tracking-widest"
                onClick={() => setAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl font-black uppercase tracking-widest"
              >
                {saving ? 'Saving…' : 'Save prize'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleEditPrize}>
            <DialogHeader>
              <DialogTitle className="font-display text-xl font-black tracking-tight">
                Edit prize
              </DialogTitle>
              <DialogDescription>
                Update pricing, details, and the product picture.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-prize-name">Name</Label>
                <Input
                  id="edit-prize-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  className="rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-prize-desc">Description</Label>
                <Input
                  id="edit-prize-desc"
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description"
                  className="rounded-xl"
                />
              </div>
              <ImageUploadField
                folder="prizes"
                entityId={editTarget?.id ?? 'prize'}
                value={editForm.image_url}
                onChange={(url) => setEditForm((f) => ({ ...f, image_url: url }))}
                disabled={editSaving}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="edit-ticket-cost">Ticket cost</Label>
                  <Input
                    id="edit-ticket-cost"
                    type="number"
                    min={0}
                    value={editForm.ticket_cost}
                    onChange={(e) => setEditForm((f) => ({ ...f, ticket_cost: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-reorder">Reorder threshold</Label>
                  <Input
                    id="edit-reorder"
                    type="number"
                    min={0}
                    value={editForm.reorder_threshold}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, reorder_threshold: e.target.value }))
                    }
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editForm.category}
                  onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="general"
                  className="rounded-xl"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3">
                <Label htmlFor="edit-prize-active" className="cursor-pointer font-medium">
                  Listed as active
                </Label>
                <Switch
                  id="edit-prize-active"
                  checked={editForm.is_active}
                  onCheckedChange={(v) => setEditForm((f) => ({ ...f, is_active: v }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl font-black uppercase tracking-widest"
                onClick={() => setEditTarget(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editSaving}
                className="rounded-xl font-black uppercase tracking-widest"
              >
                {editSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!stockTarget}
        onOpenChange={(open) => {
          if (!open) setStockTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-black tracking-tight">
              Update stock
            </DialogTitle>
            <DialogDescription>
              {stockTarget ? (
                <>
                  Set on-hand quantity for <span className="font-semibold text-foreground">{stockTarget.name}</span>.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="stock-quick">Quantity</Label>
            <Input
              id="stock-quick"
              type="number"
              min={0}
              value={stockInput}
              onChange={(e) => setStockInput(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl font-black uppercase tracking-widest"
              onClick={() => setStockTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl font-black uppercase tracking-widest"
              disabled={stockSaving}
              onClick={saveStock}
            >
              {stockSaving ? 'Saving…' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
