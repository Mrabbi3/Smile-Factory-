'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { safeFormatDate, cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/constants'
import type { Profile, UserRole } from '@/types/database'
import { toast } from 'sonner'
import { UserCog } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { RoleGuard } from '@/components/admin/role-guard'

const STAFF_ROLES: UserRole[] = ['owner', 'manager', 'employee']

const ROLE_ORDER: Record<UserRole, number> = {
  owner: 0,
  manager: 1,
  employee: 2,
  customer: 99,
}

const ROLE_BADGE: Record<UserRole, string> = {
  owner: 'border border-violet-200/80 bg-violet-50 text-violet-800',
  manager: 'border border-sky-200/80 bg-sky-50 text-sky-800',
  employee: 'border border-slate-200/80 bg-slate-50 text-slate-800',
  customer: 'border border-gray-200/80 bg-gray-50 text-gray-800',
}

function sortStaff(a: Profile, b: Profile): number {
  const ra = ROLE_ORDER[a.role] ?? 99
  const rb = ROLE_ORDER[b.role] ?? 99
  if (ra !== rb) return ra - rb
  return a.first_name.localeCompare(b.first_name, undefined, {
    sensitivity: 'base',
  })
}

function EmployeeCardSkeleton() {
  return (
    <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  )
}

export default function EmployeesPage() {
  return (
    <RoleGuard allow={['owner']} reason="Employee management is owner-only.">
      <EmployeesPageInner />
    </RoleGuard>
  )
}

function EmployeesPageInner() {
  const { user, isOwner, isManager } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [staff, setStaff] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  const canChangeRoles = isOwner()

  const canToggleActiveFor = useCallback(
    (row: Profile) => {
      if (isOwner()) return true
      if (isManager() && user?.id === row.id) return true
      return false
    },
    [isManager, isOwner, user?.id]
  )

  const loadStaff = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', STAFF_ROLES)

    if (error) {
      console.error('Staff fetch error:', error)
      toast.error(error.message || 'Failed to load staff')
      return
    }
    const rows = (data as Profile[]) ?? []
    setStaff([...rows].sort(sortStaff))
  }, [supabase])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await loadStaff()
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadStaff])

  const counts = useMemo(() => {
    return staff.reduce(
      (acc, p) => {
        if (p.role === 'owner') acc.owner += 1
        if (p.role === 'manager') acc.manager += 1
        if (p.role === 'employee') acc.employee += 1
        return acc
      },
      { owner: 0, manager: 0, employee: 0 }
    )
  }, [staff])

  const updateProfile = async (
    id: string,
    patch: Partial<Pick<Profile, 'role' | 'is_active'>>
  ) => {
    setSavingId(id)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error
      if (data) {
        const next = data as Profile
        setStaff((prev) =>
          [...prev.filter((p) => p.id !== id), next].sort(sortStaff)
        )
      }
      toast.success('Profile updated')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed'
      toast.error(message)
      await loadStaff()
    } finally {
      setSavingId(null)
    }
  }

  const setRole = async (id: string, role: 'employee' | 'manager') => {
    if (!canChangeRoles) {
      toast.error('Only owners can change staff roles')
      return
    }
    const row = staff.find((p) => p.id === id)
    if (!row || row.role === 'owner') return
    await updateProfile(id, { role })
  }

  const toggleActive = async (row: Profile) => {
    if (!canToggleActiveFor(row)) {
      toast.error('You do not have permission to change this profile')
      return
    }
    await updateProfile(row.id, { is_active: !row.is_active })
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserCog className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight">
              Employees
            </h1>
            <p className="text-sm text-muted-foreground">
              Staff accounts: owners, managers, and floor employees
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm font-semibold tracking-tight text-muted-foreground">
              {ROLE_LABELS.owner}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-black tracking-tight text-violet-700">
              {loading ? '—' : counts.owner}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm font-semibold tracking-tight text-muted-foreground">
              {ROLE_LABELS.manager}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-black tracking-tight text-sky-700">
              {loading ? '—' : counts.manager}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-sm font-semibold tracking-tight text-muted-foreground">
              {ROLE_LABELS.employee}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-black tracking-tight text-slate-700">
              {loading ? '—' : counts.employee}
            </p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <EmployeeCardSkeleton key={i} />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No staff profiles found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {staff.map((p) => {
            const fullName = [p.first_name, p.last_name].filter(Boolean).join(' ')
            const isOwnerRow = p.role === 'owner'
            const roleEditable =
              canChangeRoles && !isOwnerRow && savingId !== p.id

            return (
              <Card
                key={p.id}
                className="rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="font-display text-lg font-black leading-tight tracking-tight">
                      {fullName || '—'}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={cn(
                        'shrink-0 rounded-lg font-medium',
                        ROLE_BADGE[p.role]
                      )}
                    >
                      {ROLE_LABELS[p.role] ?? p.role}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        'rounded-lg font-medium',
                        p.is_active
                          ? 'border border-emerald-200/80 bg-emerald-50 text-emerald-800'
                          : 'border border-red-200/80 bg-red-50 text-red-800'
                      )}
                    >
                      {p.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Email</span>
                      <br />
                      <span className="break-all font-medium text-foreground">
                        {p.email || '—'}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Phone</span>
                      <br />
                      <span className="font-medium text-foreground">
                        {p.phone?.trim() || '—'}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Role
                    </p>
                    {isOwnerRow || !canChangeRoles ? (
                      <p className="text-sm font-semibold">
                        {ROLE_LABELS[p.role] ?? p.role}
                      </p>
                    ) : (
                      <Select
                        value={p.role}
                        onValueChange={(v) =>
                          setRole(p.id, v as 'employee' | 'manager')
                        }
                        disabled={!roleEditable}
                      >
                        <SelectTrigger className="w-full rounded-xl" size="default">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">
                            {ROLE_LABELS.employee}
                          </SelectItem>
                          <SelectItem value="manager">
                            {ROLE_LABELS.manager}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs text-muted-foreground">
                      Account status
                    </span>
                    <Button
                      type="button"
                      variant={p.is_active ? 'outline' : 'default'}
                      size="sm"
                      className="rounded-xl"
                      disabled={
                        !canToggleActiveFor(p) || savingId === p.id
                      }
                      onClick={() => toggleActive(p)}
                    >
                      {p.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>

                  <div className="space-y-1 border-t border-gray-100 pt-3 text-xs text-muted-foreground">
                    <p>
                      Joined:{' '}
                      {safeFormatDate(p.created_at, 'MMM d, yyyy')}
                    </p>
                    <p>
                      Updated:{' '}
                      {safeFormatDate(p.updated_at, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
