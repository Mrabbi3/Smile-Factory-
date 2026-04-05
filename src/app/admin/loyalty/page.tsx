'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { LOYALTY_TIERS } from '@/lib/constants'
import { currency, cn } from '@/lib/utils'
import type { LoyaltyAccount, LoyaltyTier, Profile } from '@/types/database'
import { toast } from 'sonner'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Gift, Loader2, Minus, Plus } from 'lucide-react'

type LoyaltyAccountRow = LoyaltyAccount & {
  profile: Pick<Profile, 'first_name' | 'last_name' | 'email'> | null
}

function tierMeta(tier: LoyaltyTier) {
  return LOYALTY_TIERS.find((t) => t.tier === tier) ?? LOYALTY_TIERS[0]
}

function TierBadge({ tier }: { tier: LoyaltyTier }) {
  const meta = tierMeta(tier)
  const darkText = tier === 'silver' || tier === 'platinum' || tier === 'gold'
  return (
    <Badge
      className={cn(
        'border-0 font-display font-bold tracking-tight',
        darkText ? 'text-gray-900' : 'text-white'
      )}
      style={{ backgroundColor: meta.color }}
    >
      {meta.label}
    </Badge>
  )
}

export default function AdminLoyaltyPage() {
  const { loading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [rows, setRows] = useState<LoyaltyAccountRow[]>([])
  const [loading, setLoading] = useState(true)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const [selected, setSelected] = useState<LoyaltyAccountRow | null>(null)
  const [adjustmentInput, setAdjustmentInput] = useState('')
  const [saving, setSaving] = useState(false)

  const loadAccounts = useCallback(async () => {
    const { data: accountsData, error: accErr } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .order('total_spent', { ascending: false })

    if (accErr) throw accErr
    const list = (accountsData ?? []) as LoyaltyAccount[]
    if (list.length === 0) {
      setRows([])
      return
    }

    const ids = list.map((a) => a.customer_id)
    const { data: profs, error: profErr } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .in('id', ids)

    if (profErr) throw profErr
    const pmap = new Map(
      (profs ?? []).map((p) => [
        p.id,
        p as Pick<Profile, 'first_name' | 'last_name' | 'email'>,
      ])
    )

    setRows(
      list.map((a) => ({
        ...a,
        profile: pmap.get(a.customer_id) ?? null,
      }))
    )
  }, [supabase])

  useEffect(() => {
    if (authLoading) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      try {
        await loadAccounts()
      } catch (err) {
        console.error('Loyalty accounts load error:', err)
        if (!cancelled) toast.error('Failed to load loyalty accounts')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [authLoading, loadAccounts])

  const tierCounts = useMemo(() => {
    const init: Record<LoyaltyTier, number> = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    }
    for (const r of rows) {
      const t = r.tier as LoyaltyTier
      if (t in init) init[t] += 1
    }
    return init
  }, [rows])

  const openAdjust = (row: LoyaltyAccountRow) => {
    setSelected(row)
    setAdjustmentInput('')
    setAdjustOpen(true)
  }

  const applyAdjustment = async (mode: 'add' | 'subtract') => {
    if (!selected) return
    const raw = adjustmentInput.trim()
    const amt = parseFloat(raw)
    if (raw === '' || Number.isNaN(amt) || amt <= 0) {
      toast.error('Enter a positive dollar amount')
      return
    }

    const current = Number(selected.reward_balance)
    const next =
      mode === 'add' ? current + amt : current - amt
    if (next < 0) {
      toast.error('Reward balance cannot go negative')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('loyalty_accounts')
        .update({ reward_balance: next })
        .eq('id', selected.id)

      if (error) throw error
      toast.success(
        mode === 'add'
          ? `Added ${currency(amt)} to rewards`
          : `Subtracted ${currency(amt)} from rewards`
      )
      setAdjustOpen(false)
      setSelected(null)
      await loadAccounts()
    } catch (err) {
      console.error('Reward balance update error:', err)
      toast.error('Could not update reward balance')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-64 max-w-full rounded-lg" />
          <Skeleton className="mt-2 h-5 w-96 max-w-full rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card
              key={i}
              className="rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-16" />
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
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10">
            <Gift className="size-6 text-primary" aria-hidden />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight md:text-4xl">
              Loyalty program
            </h1>
            <p className="mt-1 text-muted-foreground">
              Member accounts, tiers, and manual reward balance adjustments.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LOYALTY_TIERS.map((t) => (
          <Card
            key={t.tier}
            className="rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                {t.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-3">
                <p
                  className="font-display text-2xl font-black tracking-tight tabular-nums"
                  style={{ color: t.color }}
                >
                  {tierCounts[t.tier as LoyaltyTier].toLocaleString()}
                </p>
                <span
                  className="size-3 shrink-0 rounded-full border border-white/40 shadow-sm"
                  style={{ backgroundColor: t.color }}
                  aria-hidden
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Min. spend {currency(t.minSpend)}+
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="font-display text-xl font-black tracking-tight">
            All loyalty accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted">
                <Gift className="size-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-muted-foreground">
                No loyalty accounts yet
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Total spent</TableHead>
                  <TableHead className="text-right">Reward balance</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const name = row.profile
                    ? `${row.profile.first_name} ${row.profile.last_name}`.trim()
                    : '—'
                  const email = row.profile?.email ?? '—'
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="max-w-[220px] truncate text-muted-foreground">
                        {email}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {currency(Number(row.total_spent))}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {currency(Number(row.reward_balance))}
                      </TableCell>
                      <TableCell>
                        <TierBadge tier={row.tier as LoyaltyTier} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl font-display font-bold"
                          onClick={() => openAdjust(row)}
                        >
                          Adjust rewards
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={adjustOpen}
        onOpenChange={(open) => {
          setAdjustOpen(open)
          if (!open) {
            setSelected(null)
            setAdjustmentInput('')
          }
        }}
      >
        <DialogContent className="rounded-2xl border border-gray-100 bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display font-black tracking-tight">
              Adjust reward balance
            </DialogTitle>
            <DialogDescription>
              {selected?.profile
                ? `${selected.profile.first_name} ${selected.profile.last_name} · ${selected.profile.email}`
                : 'Selected account'}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Current balance:</span>
                <span className="font-display font-black tabular-nums text-foreground">
                  {currency(Number(selected.reward_balance))}
                </span>
                <TierBadge tier={selected.tier as LoyaltyTier} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loyalty-adjust-amount">Amount (USD)</Label>
                <Input
                  id="loyalty-adjust-amount"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={adjustmentInput}
                  onChange={(e) => setAdjustmentInput(e.target.value)}
                  className="rounded-xl"
                  disabled={saving}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl font-display font-bold"
              disabled={saving}
              onClick={() => setAdjustOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-red-200 font-display font-bold text-red-700 hover:bg-red-50"
              disabled={saving}
              onClick={() => void applyAdjustment('subtract')}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Minus className="size-4" />
              )}
              Subtract
            </Button>
            <Button
              type="button"
              className="rounded-xl font-display font-bold"
              disabled={saving}
              onClick={() => void applyAdjustment('add')}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
