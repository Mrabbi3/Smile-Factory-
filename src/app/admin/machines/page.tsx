'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { safeFormatDate, cn } from '@/lib/utils'
import type { Machine, MachineStatus } from '@/types/database'
import { toast } from 'sonner'
import { Cpu } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

const STATUS_BADGE: Record<MachineStatus, string> = {
  active: 'border border-emerald-200/80 bg-emerald-50 text-emerald-800',
  maintenance: 'border border-amber-200/80 bg-amber-50 text-amber-800',
  inactive: 'border border-red-200/80 bg-red-50 text-red-800',
}

const STATUS_LABEL: Record<MachineStatus, string> = {
  active: 'Active',
  maintenance: 'Maintenance',
  inactive: 'Inactive',
}

function MachineCardSkeleton() {
  return (
    <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

export default function MachinesPage() {
  const { isManager } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusSavingId, setStatusSavingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    machine_type: '',
    tokens_per_play: '1',
    location_note: '',
    serial_number: '',
  })

  const canManage = isManager()

  const loadMachines = useCallback(async () => {
    const { data, error } = await supabase
      .from('machines')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Machines fetch error:', error)
      toast.error(error.message || 'Failed to load machines')
      return
    }
    setMachines((data as Machine[]) ?? [])
  }, [supabase])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await loadMachines()
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadMachines])

  const counts = useMemo(() => {
    return machines.reduce(
      (acc, m) => {
        acc[m.status] += 1
        return acc
      },
      { active: 0, maintenance: 0, inactive: 0 } as Record<MachineStatus, number>
    )
  }, [machines])

  const setMachineStatus = async (id: string, status: MachineStatus) => {
    if (!canManage) {
      toast.error('Only managers and owners can change machine status')
      return
    }
    setStatusSavingId(id)
    try {
      const { error } = await supabase
        .from('machines')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      setMachines((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status } : m))
      )
      toast.success('Status updated')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed'
      toast.error(message)
      await loadMachines()
    } finally {
      setStatusSavingId(null)
    }
  }

  const resetForm = () => {
    setForm({
      name: '',
      machine_type: '',
      tokens_per_play: '1',
      location_note: '',
      serial_number: '',
    })
  }

  const addMachine = async () => {
    if (!canManage) {
      toast.error('Only managers and owners can add machines')
      return
    }
    const name = form.name.trim()
    const machineType = form.machine_type.trim()
    const tokens = Number.parseInt(form.tokens_per_play, 10)
    if (!name || !machineType) {
      toast.error('Name and machine type are required')
      return
    }
    if (!Number.isFinite(tokens) || tokens < 1) {
      toast.error('Tokens per play must be at least 1')
      return
    }

    setSaving(true)
    try {
      const location_note = form.location_note.trim() || null
      const serial_number = form.serial_number.trim() || null

      const { data, error } = await supabase
        .from('machines')
        .insert({
          name,
          machine_type: machineType,
          tokens_per_play: tokens,
          location_note,
          serial_number,
          status: 'active',
        })
        .select('*')
        .single()

      if (error) throw error
      if (data) {
        setMachines((prev) =>
          [...prev, data as Machine].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        )
      }
      toast.success('Machine added')
      setAddOpen(false)
      resetForm()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not add machine'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Cpu className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight">
              Machines
            </h1>
            <p className="text-sm text-muted-foreground">
              View and manage arcade machines on the floor
            </p>
          </div>
        </div>
        {canManage && (
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => setAddOpen(true)}
          >
            Add Machine
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm font-semibold tracking-tight text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-black tracking-tight text-emerald-700">
              {loading ? '—' : counts.active}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm font-semibold tracking-tight text-muted-foreground">
              Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-black tracking-tight text-amber-700">
              {loading ? '—' : counts.maintenance}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm font-semibold tracking-tight text-muted-foreground">
              Inactive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-black tracking-tight text-red-700">
              {loading ? '—' : counts.inactive}
            </p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <MachineCardSkeleton key={i} />
          ))}
        </div>
      ) : machines.length === 0 ? (
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No machines yet.{' '}
            {canManage ? 'Add your first machine to get started.' : ''}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {machines.map((m) => (
            <Card
              key={m.id}
              className="rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-display text-lg font-black leading-tight tracking-tight">
                    {m.name}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      'shrink-0 rounded-lg font-medium',
                      STATUS_BADGE[m.status]
                    )}
                  >
                    {STATUS_LABEL[m.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{m.machine_type}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Tokens / play</span>
                  <span className="font-semibold tabular-nums">
                    {m.tokens_per_play}
                  </span>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select
                    value={m.status}
                    onValueChange={(v) =>
                      setMachineStatus(m.id, v as MachineStatus)
                    }
                    disabled={!canManage || statusSavingId === m.id}
                  >
                    <SelectTrigger className="w-full rounded-xl" size="default">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {m.location_note ? (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {m.location_note}
                  </p>
                ) : (
                  <p className="text-sm italic text-muted-foreground/70">
                    No location note
                  </p>
                )}

                <div className="space-y-1 border-t border-gray-100 pt-3 text-xs text-muted-foreground">
                  {m.serial_number && (
                    <p>
                      <span className="font-medium text-foreground/80">
                        Serial:
                      </span>{' '}
                      {m.serial_number}
                    </p>
                  )}
                  <p>
                    Purchased:{' '}
                    {safeFormatDate(m.purchase_date, 'MMM d, yyyy')}
                  </p>
                  <p>
                    Updated:{' '}
                    {safeFormatDate(m.updated_at, 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="max-w-lg rounded-2xl border border-gray-100 bg-white shadow-lg sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-black tracking-tight">
              Add machine
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="machine-name">Name</Label>
              <Input
                id="machine-name"
                className="rounded-xl"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Skee-Ball Classic"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="machine-type">Machine type</Label>
              <Input
                id="machine-type"
                className="rounded-xl"
                value={form.machine_type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, machine_type: e.target.value }))
                }
                placeholder="e.g. redemption, racing, pinball"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tokens-per-play">Tokens per play</Label>
              <Input
                id="tokens-per-play"
                type="number"
                min={1}
                className="rounded-xl"
                value={form.tokens_per_play}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tokens_per_play: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location-note">Location note</Label>
              <Input
                id="location-note"
                className="rounded-xl"
                value={form.location_note}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location_note: e.target.value }))
                }
                placeholder="Floor area, row, or landmark"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serial-number">Serial number</Label>
              <Input
                id="serial-number"
                className="rounded-xl"
                value={form.serial_number}
                onChange={(e) =>
                  setForm((f) => ({ ...f, serial_number: e.target.value }))
                }
                placeholder="Optional"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setAddOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              disabled={saving}
              onClick={addMachine}
            >
              {saving ? 'Saving…' : 'Add machine'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
