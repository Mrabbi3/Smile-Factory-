'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { safeFormatDate, cn } from '@/lib/utils'
import type { Profile } from '@/types/database'
import { toast } from 'sonner'
import { Users } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function fullName(p: Profile): string {
  const parts = [p.first_name, p.last_name].filter(Boolean)
  return parts.length ? parts.join(' ') : '—'
}

export default function AdminCustomersPage() {
  const { user, loading: authLoading, isManager } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [customers, setCustomers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const canManage = isManager()

  const loadCustomers = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers((data as Profile[]) ?? [])
    } catch (err) {
      console.error(err)
      toast.error(
        err instanceof Error ? err.message : 'Failed to load customers'
      )
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }
    loadCustomers()
  }, [authLoading, user, loadCustomers])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => {
      const name = fullName(c).toLowerCase()
      const email = (c.email ?? '').toLowerCase()
      return name.includes(q) || email.includes(q)
    })
  }, [customers, search])

  const toggleActive = async (id: string, next: boolean) => {
    if (!canManage) {
      toast.error('Only managers and owners can change customer status')
      return
    }
    setTogglingId(id)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: next })
        .eq('id', id)

      if (error) throw error
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: next } : c))
      )
      toast.success(next ? 'Customer activated' : 'Customer deactivated')
    } catch (err) {
      console.error(err)
      toast.error(
        err instanceof Error ? err.message : 'Could not update customer'
      )
      await loadCustomers()
    } finally {
      setTogglingId(null)
    }
  }

  const total = customers.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <h1 className="font-display text-3xl font-black tracking-tight">
              Customers
            </h1>
            <p className="text-sm text-muted-foreground">
              Customer accounts and contact details from your directory.
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-sm font-semibold tracking-tight text-muted-foreground">
            Total customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-10 w-24 rounded-lg" />
          ) : (
            <p className="font-display text-3xl font-black tracking-tight text-foreground">
              {total}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-display text-lg font-black tracking-tight">
              Directory
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {loading ? (
                'Loading…'
              ) : (
                <>
                  Showing{' '}
                  <span className="font-medium text-foreground">
                    {filtered.length}
                  </span>{' '}
                  of {total}
                  {search.trim() ? ' matching search' : ''}
                </>
              )}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Input
              type="search"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl sm:w-72"
              aria-label="Filter customers by name or email"
            />
            {search.trim() ? (
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setSearch('')}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                <Users className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-display font-semibold tracking-tight">
                {customers.length === 0
                  ? 'No customers yet'
                  : 'No matching customers'}
              </p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {customers.length === 0
                  ? 'Registered customer profiles will appear here.'
                  : 'Try a different search term.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-display font-semibold tracking-tight">
                      Name
                    </TableHead>
                    <TableHead className="font-display font-semibold tracking-tight">
                      Email
                    </TableHead>
                    <TableHead className="font-display font-semibold tracking-tight">
                      Phone
                    </TableHead>
                    <TableHead className="font-display font-semibold tracking-tight">
                      Status
                    </TableHead>
                    <TableHead className="font-display font-semibold tracking-tight">
                      Joined
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="max-w-[200px] font-medium">
                        {fullName(c)}
                      </TableCell>
                      <TableCell className="max-w-[220px] text-muted-foreground">
                        <span className="break-all">{c.email || '—'}</span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {c.phone?.trim() ? c.phone : '—'}
                      </TableCell>
                      <TableCell>
                        {canManage ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                'rounded-lg border font-display font-semibold tracking-tight',
                                c.is_active
                                  ? 'border-emerald-200/80 bg-emerald-50 text-emerald-800'
                                  : 'border-gray-200 bg-gray-50 text-gray-700'
                              )}
                            >
                              {c.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="rounded-xl font-display text-xs font-semibold tracking-tight"
                              disabled={togglingId === c.id}
                              onClick={() =>
                                toggleActive(c.id, !c.is_active)
                              }
                            >
                              {togglingId === c.id
                                ? 'Saving…'
                                : c.is_active
                                  ? 'Deactivate'
                                  : 'Activate'}
                            </Button>
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className={cn(
                              'rounded-lg border font-display font-semibold tracking-tight',
                              c.is_active
                                ? 'border-emerald-200/80 bg-emerald-50 text-emerald-800'
                                : 'border-gray-200 bg-gray-50 text-gray-700'
                            )}
                          >
                            {c.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {safeFormatDate(c.created_at, 'MMM d, yyyy h:mm a')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {!canManage && !authLoading && user && (
        <p className="text-center text-sm text-muted-foreground">
          Activating or deactivating customers is limited to owners and
          managers.
        </p>
      )}
    </div>
  )
}
