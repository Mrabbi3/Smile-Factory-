'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { WORK_ORDER_PRIORITIES } from '@/lib/constants'
import { safeFormatDate, cn } from '@/lib/utils'
import type { WorkOrder, WorkOrderPriority, WorkOrderStatus } from '@/types/database'
import { toast } from 'sonner'
import { ClipboardList } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const PRIORITY_MAP = Object.fromEntries(
  WORK_ORDER_PRIORITIES.map((p) => [p.value, p])
) as Record<WorkOrderPriority, (typeof WORK_ORDER_PRIORITIES)[number]>

const STATUS_LABEL: Record<WorkOrderStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_BADGE: Record<WorkOrderStatus, string> = {
  open: 'bg-sky-100 text-sky-800 border-sky-200/60',
  in_progress: 'bg-amber-100 text-amber-900 border-amber-200/60',
  completed: 'bg-emerald-100 text-emerald-900 border-emerald-200/60',
  cancelled: 'bg-gray-200 text-gray-800 border-gray-300/60',
}

type StatusFilter = 'all' | WorkOrderStatus

const TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

function truncateText(text: string, max: number): string {
  const t = text?.trim() || ''
  if (!t) return '—'
  if (t.length <= max) return t
  return `${t.slice(0, max)}…`
}

function nextStatusOptions(current: WorkOrderStatus): WorkOrderStatus[] {
  switch (current) {
    case 'open':
      return ['in_progress', 'cancelled']
    case 'in_progress':
      return ['completed', 'cancelled']
    case 'completed':
    case 'cancelled':
    default:
      return []
  }
}

export default function WorkOrdersPage() {
  const { user, loading: authLoading, isManager } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as WorkOrderPriority,
    due_date: '',
  })

  const canManage = isManager()

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders((data as WorkOrder[]) || [])
    } catch (err) {
      console.error('Work orders load error:', err)
      toast.error('Failed to load work orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (authLoading) return
    loadOrders()
  }, [authLoading, loadOrders])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return orders
    return orders.filter((o) => o.status === statusFilter)
  }, [orders, statusFilter])

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
    })
  }

  const handleCreate = async () => {
    if (!user?.id) {
      toast.error('You must be signed in')
      return
    }
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.from('work_orders').insert({
        title: form.title.trim(),
        description: form.description.trim() || '(No description)',
        priority: form.priority,
        due_date: form.due_date || null,
        created_by: user.id,
        status: 'open',
      })
      if (error) throw error
      toast.success('Work order created')
      setCreateOpen(false)
      resetForm()
      await loadOrders()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create work order'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (order: WorkOrder, newStatus: WorkOrderStatus) => {
    if (order.status === newStatus) return
    setUpdatingId(order.id)
    try {
      const patch: Partial<WorkOrder> = { status: newStatus }
      if (newStatus === 'completed') {
        patch.completed_at = new Date().toISOString()
      } else {
        patch.completed_at = null
      }
      const { error } = await supabase.from('work_orders').update(patch).eq('id', order.id)
      if (error) throw error
      toast.success(`Status updated to ${STATUS_LABEL[newStatus]}`)
      await loadOrders()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update status'
      toast.error(message)
    } finally {
      setUpdatingId(null)
    }
  }

  if (authLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardList className="size-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight sm:text-4xl">
              Work orders
            </h1>
            <p className="mt-1 max-w-xl text-muted-foreground text-sm font-medium">
              Track maintenance and operational tasks. New orders start as open; move them through
              in progress, then complete or cancel.
            </p>
          </div>
        </div>
        {canManage && (
          <Button
            className="shrink-0 rounded-xl font-black"
            onClick={() => {
              resetForm()
              setCreateOpen(true)
            }}
          >
            New work order
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              'rounded-full border px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors',
              statusFilter === tab.key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-white text-muted-foreground hover:bg-muted/60'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl border-dashed bg-white">
          <CardContent className="py-16 text-center text-muted-foreground">
            No work orders in this view.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((order) => {
            const pri = PRIORITY_MAP[order.priority]
            const transitions = nextStatusOptions(order.status)
            return (
              <Card key={order.id} className="rounded-2xl border-border/80 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <CardTitle className="font-display text-lg font-black tracking-tight">
                      {order.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn('rounded-lg border font-black', pri.color)}
                      >
                        {pri.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          'rounded-lg border font-black capitalize',
                          STATUS_BADGE[order.status]
                        )}
                      >
                        {STATUS_LABEL[order.status]}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p className="text-muted-foreground leading-relaxed">
                    {truncateText(order.description, 160)}
                  </p>
                  <div className="grid grid-cols-1 gap-2 border-t border-border/60 pt-4 sm:grid-cols-2">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Due
                      </p>
                      <p className="font-semibold">
                        {order.due_date
                          ? safeFormatDate(order.due_date, 'MMM d, yyyy')
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Created
                      </p>
                      <p className="font-semibold">
                        {safeFormatDate(order.created_at, 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>

                  {canManage && transitions.length > 0 && (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground shrink-0">
                        Update status
                      </span>
                      <Select
                        disabled={updatingId === order.id}
                        value={order.status}
                        onValueChange={(v) =>
                          handleStatusChange(order, v as WorkOrderStatus)
                        }
                      >
                        <SelectTrigger className="w-full rounded-xl sm:max-w-[220px] font-semibold">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value={order.status} className="font-medium">
                            {STATUS_LABEL[order.status]} (current)
                          </SelectItem>
                          {transitions.map((s) => (
                            <SelectItem key={s} value={s} className="font-medium">
                              → {STATUS_LABEL[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-black tracking-tight">
              New work order
            </DialogTitle>
            <DialogDescription>
              Add a task for the team. Managers and owners can create orders; employees see
              assignments they receive.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="wo-title">Title</Label>
              <Input
                id="wo-title"
                className="rounded-xl"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Replace claw motor — unit 12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wo-desc">Description</Label>
              <Textarea
                id="wo-desc"
                className="min-h-[100px] rounded-xl"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What needs to be done, parts, location notes…"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, priority: v as WorkOrderPriority }))
                  }
                >
                  <SelectTrigger className="rounded-xl font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {WORK_ORDER_PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value} className="font-medium">
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wo-due">Due date</Label>
                <Input
                  id="wo-due"
                  type="date"
                  className="rounded-xl"
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl font-black"
              onClick={() => setCreateOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl font-black"
              onClick={handleCreate}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
