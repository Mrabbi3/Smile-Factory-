'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { safeFormatDate, currency } from '@/lib/utils'
import type { Coupon, DiscountType } from '@/types/database'
import { toast } from 'sonner'
import { Gift, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function formatDiscountLabel(c: Coupon): string {
  const v = Number(c.discount_value)
  if (c.discount_type === 'percentage') {
    return `${v}%`
  }
  return `${currency(v)} off`
}

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function defaultValidRange(): { from: string; until: string } {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 30)
  end.setHours(23, 59, 0, 0)
  return {
    from: toDatetimeLocalValue(start.toISOString()),
    until: toDatetimeLocalValue(end.toISOString()),
  }
}

function couponLifecycle(c: Coupon, now: Date): 'scheduled' | 'active' | 'expired' {
  const from = new Date(c.valid_from).getTime()
  const until = new Date(c.valid_until).getTime()
  const t = now.getTime()
  if (t < from) return 'scheduled'
  if (t > until) return 'expired'
  return 'active'
}

function isCurrentlyValid(c: Coupon, now: Date): boolean {
  return c.is_active && couponLifecycle(c, now) === 'active'
}

export default function AdminCouponsPage() {
  const { loading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const [form, setForm] = useState(() => {
    const { from, until } = defaultValidRange()
    return {
      code: '',
      description: '',
      discount_type: 'percentage' as DiscountType,
      discount_value: '',
      min_purchase: '0',
      valid_from: from,
      valid_until: until,
      usage_limit: '0',
      is_active: true,
    }
  })

  const now = useMemo(() => new Date(), [])

  const stats = useMemo(() => {
    const n = new Date()
    let activeNow = 0
    let expired = 0
    for (const c of coupons) {
      if (new Date(c.valid_until) < n) expired += 1
      if (isCurrentlyValid(c, n)) activeNow += 1
    }
    return { activeNow, expired }
  }, [coupons])

  const loadCoupons = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Coupons load error:', error.message)
        toast.error(error.message || 'Failed to load coupons')
        setCoupons([])
        return
      }
      setCoupons((data as Coupon[]) ?? [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load coupons')
      setCoupons([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (authLoading) return
    void loadCoupons()
  }, [authLoading, loadCoupons])

  const resetForm = () => {
    const { from, until } = defaultValidRange()
    setForm({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_purchase: '0',
      valid_from: from,
      valid_until: until,
      usage_limit: '0',
      is_active: true,
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = form.code.trim().toUpperCase()
    if (!code) {
      toast.error('Code is required')
      return
    }
    const description = form.description.trim()
    if (!description) {
      toast.error('Description is required')
      return
    }
    const discountValue = Number(form.discount_value)
    if (!Number.isFinite(discountValue) || discountValue < 0) {
      toast.error('Enter a valid discount value')
      return
    }
    if (form.discount_type === 'percentage' && discountValue > 100) {
      toast.error('Percentage cannot exceed 100')
      return
    }
    const minPurchase = Number(form.min_purchase)
    if (!Number.isFinite(minPurchase) || minPurchase < 0) {
      toast.error('Enter a valid minimum purchase')
      return
    }
    const usageLimit = Number(form.usage_limit)
    if (!Number.isFinite(usageLimit) || usageLimit < 0 || !Number.isInteger(usageLimit)) {
      toast.error('Usage limit must be a whole number (0 = unlimited)')
      return
    }

    const validFrom = new Date(form.valid_from)
    const validUntil = new Date(form.valid_until)
    if (isNaN(validFrom.getTime()) || isNaN(validUntil.getTime())) {
      toast.error('Invalid validity dates')
      return
    }
    if (validUntil <= validFrom) {
      toast.error('End date must be after start date')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.from('coupons').insert({
        code,
        description,
        discount_type: form.discount_type,
        discount_value: discountValue,
        min_purchase: minPurchase,
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString(),
        usage_limit: usageLimit,
        is_active: form.is_active,
      })

      if (error) {
        toast.error(error.message || 'Could not create coupon')
        return
      }
      toast.success('Coupon created')
      resetForm()
      setCreateOpen(false)
      await loadCoupons()
    } catch (err) {
      console.error(err)
      toast.error('Could not create coupon')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (coupon: Coupon) => {
    setTogglingId(coupon.id)
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id)

      if (error) {
        toast.error(error.message || 'Could not update status')
        return
      }
      toast.success(coupon.is_active ? 'Coupon deactivated' : 'Coupon activated')
      await loadCoupons()
    } catch (err) {
      console.error(err)
      toast.error('Could not update status')
    } finally {
      setTogglingId(null)
    }
  }

  const usageLabel = (limit: number, used: number) =>
    limit === 0 ? `${used} / ∞` : `${used} / ${limit}`

  const createForm = (
    <form onSubmit={handleCreate}>
      <DialogHeader>
        <DialogTitle className="font-display text-xl font-black tracking-tight">
          Create coupon
        </DialogTitle>
      </DialogHeader>
      <div className="mt-4 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="coupon-code">Code</Label>
          <Input
            id="coupon-code"
            className="rounded-xl font-mono uppercase"
            placeholder="SUMMER20"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            autoComplete="off"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="coupon-desc">Description</Label>
          <Input
            id="coupon-desc"
            className="rounded-xl"
            placeholder="Summer sale discount"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
          <div className="grid gap-2">
            <Label>Discount type</Label>
            <Select
              value={form.discount_type}
              onValueChange={(v: DiscountType) =>
                setForm((f) => ({ ...f, discount_type: v }))
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="discount-value">
              {form.discount_type === 'percentage' ? 'Percent off' : 'Amount off'}
            </Label>
            <Input
              id="discount-value"
              className="rounded-xl tabular-nums"
              type="number"
              min={0}
              step={form.discount_type === 'percentage' ? 1 : 0.01}
              value={form.discount_value}
              onChange={(e) =>
                setForm((f) => ({ ...f, discount_value: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="min-purchase">Minimum purchase (USD)</Label>
          <Input
            id="min-purchase"
            className="rounded-xl tabular-nums"
            type="number"
            min={0}
            step={0.01}
            value={form.min_purchase}
            onChange={(e) => setForm((f) => ({ ...f, min_purchase: e.target.value }))}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
          <div className="grid gap-2">
            <Label htmlFor="valid-from">Valid from</Label>
            <Input
              id="valid-from"
              className="rounded-xl"
              type="datetime-local"
              value={form.valid_from}
              onChange={(e) => setForm((f) => ({ ...f, valid_from: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="valid-until">Valid until</Label>
            <Input
              id="valid-until"
              className="rounded-xl"
              type="datetime-local"
              value={form.valid_until}
              onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="usage-limit">Usage limit (0 = unlimited)</Label>
          <Input
            id="usage-limit"
            className="rounded-xl tabular-nums"
            type="number"
            min={0}
            step={1}
            value={form.usage_limit}
            onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value }))}
          />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-muted/30 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Active</p>
            <p className="text-xs text-muted-foreground">
              Inactive codes cannot be applied at checkout.
            </p>
          </div>
          <Switch
            checked={form.is_active}
            onCheckedChange={(checked) =>
              setForm((f) => ({ ...f, is_active: checked }))
            }
            aria-label="Coupon active"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => setCreateOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-xl font-black uppercase tracking-widest"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving
              </>
            ) : (
              'Create'
            )}
          </Button>
        </div>
      </div>
    </form>
  )

  if (authLoading || (loading && coupons.length === 0)) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Skeleton className="h-10 w-64 max-w-full rounded-lg" />
            <Skeleton className="mt-2 h-5 w-96 max-w-full rounded-lg" />
          </div>
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Card
              key={i}
              className="rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Dialog
      open={createOpen}
      onOpenChange={(open) => {
        setCreateOpen(open)
        if (open) resetForm()
      }}
    >
      <div className="space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Gift className="size-7" aria-hidden />
              </div>
              <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">
                Coupons
              </h1>
            </div>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              Create and manage promotional codes, discounts, and validity windows.
            </p>
          </div>

          <DialogTrigger asChild>
            <Button
              type="button"
              className="shrink-0 rounded-xl font-black uppercase tracking-widest"
            >
              Create Coupon
            </Button>
          </DialogTrigger>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                Active now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-3">
                <p className="font-display text-2xl font-black tracking-tight text-foreground">
                  {stats.activeNow.toLocaleString()}
                </p>
                <Badge variant="default" className="font-black uppercase tracking-wide">
                  Live
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Turned on and within the valid date range.
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                Expired
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-3">
                <p className="font-display text-2xl font-black tracking-tight text-foreground">
                  {stats.expired.toLocaleString()}
                </p>
                <Badge variant="secondary" className="font-black uppercase tracking-wide">
                  Past end
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Valid until date is before today.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl font-black tracking-tight">
              All coupons
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coupons.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted">
                  <Gift className="size-6 text-muted-foreground" />
                </div>
                <p className="font-display font-black tracking-tight text-muted-foreground">
                  No coupons yet
                </p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Create a coupon to offer percentage or fixed discounts with optional
                  limits and date windows.
                </p>
                <Button
                  type="button"
                  className="mt-4 rounded-xl font-black uppercase tracking-widest"
                  onClick={() => {
                    resetForm()
                    setCreateOpen(true)
                  }}
                >
                  Create Coupon
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="hidden overflow-x-auto rounded-xl border border-gray-100 md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Valid from</TableHead>
                        <TableHead>Valid until</TableHead>
                        <TableHead className="text-right">Usage</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coupons.map((c) => {
                        const life = couponLifecycle(c, now)
                        return (
                          <TableRow key={c.id}>
                            <TableCell className="font-mono font-semibold">
                              {c.code}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground">
                              {c.description}
                            </TableCell>
                            <TableCell>
                              <span className="font-medium tabular-nums">
                                {formatDiscountLabel(c)}
                              </span>
                              <span className="ml-1 text-xs text-muted-foreground">
                                (min {currency(Number(c.min_purchase))})
                              </span>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {safeFormatDate(c.valid_from, 'MMM d, yyyy h:mm a')}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {safeFormatDate(c.valid_until, 'MMM d, yyyy h:mm a')}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">
                              {usageLabel(c.usage_limit, c.times_used)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  life === 'expired'
                                    ? 'secondary'
                                    : life === 'scheduled'
                                      ? 'outline'
                                      : 'default'
                                }
                                className="font-black uppercase tracking-wide"
                              >
                                {life === 'expired'
                                  ? 'Expired'
                                  : life === 'scheduled'
                                    ? 'Scheduled'
                                    : 'In window'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-center">
                                <Switch
                                  checked={c.is_active}
                                  disabled={togglingId === c.id}
                                  onCheckedChange={() => toggleActive(c)}
                                  aria-label={`Toggle active for ${c.code}`}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="grid gap-4 md:hidden">
                  {coupons.map((c) => {
                    const life = couponLifecycle(c, now)
                    return (
                      <Card
                        key={c.id}
                        className="rounded-2xl border border-gray-100 bg-white shadow-sm"
                      >
                        <CardHeader className="gap-2 pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="font-display font-mono text-lg font-black tracking-tight">
                              {c.code}
                            </CardTitle>
                            <Badge
                              variant={
                                life === 'expired'
                                  ? 'secondary'
                                  : life === 'scheduled'
                                    ? 'outline'
                                    : 'default'
                              }
                              className="shrink-0 font-black uppercase tracking-wide"
                            >
                              {life === 'expired'
                                ? 'Expired'
                                : life === 'scheduled'
                                  ? 'Scheduled'
                                  : 'In window'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{c.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <dl className="grid grid-cols-2 gap-3 text-sm">
                            <div className="col-span-2">
                              <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Discount
                              </dt>
                              <dd className="font-bold tabular-nums">
                                {formatDiscountLabel(c)}{' '}
                                <span className="text-xs font-normal text-muted-foreground">
                                  (min {currency(Number(c.min_purchase))})
                                </span>
                              </dd>
                            </div>
                            <div>
                              <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Valid from
                              </dt>
                              <dd className="text-muted-foreground">
                                {safeFormatDate(c.valid_from, 'MMM d, yyyy h:mm a')}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Valid until
                              </dt>
                              <dd className="text-muted-foreground">
                                {safeFormatDate(c.valid_until, 'MMM d, yyyy h:mm a')}
                              </dd>
                            </div>
                            <div className="col-span-2">
                              <dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Usage
                              </dt>
                              <dd className="tabular-nums">
                                {usageLabel(c.usage_limit, c.times_used)}
                              </dd>
                            </div>
                          </dl>
                          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              Active
                            </span>
                            <Switch
                              checked={c.is_active}
                              disabled={togglingId === c.id}
                              onCheckedChange={() => toggleActive(c)}
                              aria-label={`Toggle active for ${c.code}`}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <DialogContent className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg">
          {createForm}
        </DialogContent>
      </div>
    </Dialog>
  )
}
