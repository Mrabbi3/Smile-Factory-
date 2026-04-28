'use client'

import { useAuth } from '@/hooks/use-auth'
import type { UserRole } from '@/types/database'
import { ShieldOff } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface RoleGuardProps {
  /** Roles that ARE allowed to view the children. */
  allow: UserRole[]
  children: React.ReactNode
  /** Optional helper text below the title. */
  reason?: string
}

/**
 * Client-side role gate for /admin pages. Layered on top of:
 *   1) Sidebar hiding the nav link for the wrong role
 *   2) Supabase RLS blocking sensitive data reads
 *
 * This component handles direct-URL navigation by users whose role doesn't
 * grant them access (e.g. an employee opens /admin/expenses by typing it).
 */
export function RoleGuard({ allow, children, reason }: RoleGuardProps) {
  const { loading, role } = useAuth()

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white/50 p-8 text-sm text-muted-foreground">
        Checking access…
      </div>
    )
  }

  if (!role || !allow.includes(role)) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldOff className="h-6 w-6" />
        </div>
        <h2 className="font-display text-xl font-bold">Owner access only</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {reason ??
            'This area is restricted to the business owner. Ask the owner if you need access.'}
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/admin/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    )
  }

  return <>{children}</>
}
