'use client'

import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Menu } from 'lucide-react'
import { ROLE_LABELS } from '@/lib/constants'
import type { Profile, UserRole } from '@/types/database'

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/pos': 'POS / Token Sales',
  '/admin/tokens': 'Token Transactions',
  '/admin/inventory': 'Prize Inventory',
  '/admin/bookings': 'Bookings',
  '/admin/work-orders': 'Work Orders',
  '/admin/machines': 'Machines',
  '/admin/customers': 'Customers',
  '/admin/employees': 'Employees',
  '/admin/expenses': 'Expenses',
  '/admin/coupons': 'Coupons',
  '/admin/reviews': 'Review Moderation',
  '/admin/inquiries': 'Inquiries',
  '/admin/alerts': 'Site Alerts',
  '/admin/shifts': 'Shift reconciliation',
  '/admin/reports': 'Reports',
  '/admin/documents': 'Documents',
  '/admin/settings': 'Settings',
  '/customer/dashboard': 'Dashboard',
  '/customer/bookings': 'My Bookings',
  '/customer/tokens': 'Token History',
  '/customer/profile': 'My Profile',
  '/customer/buy-tokens': 'Buy Tokens',
  '/customer/leave-review': 'Leave a Review',
  '/customer/coupons': 'My Coupons',
}

interface TopBarProps {
  profile: Profile | null
  role: UserRole | null
  /** Shown when profile row is missing/failed (before name falls back) */
  fallbackEmail?: string | null
  onSignOut: () => void
  onMenuToggle: () => void
}

function emailLocalPartInitials(email: string) {
  const local = email.split('@')[0]?.trim() ?? ''
  const chars = local.replace(/\./g, '')
  if (chars.length >= 2) return `${chars[0]!.toUpperCase()}${chars[1]!.toUpperCase()}`
  if (chars.length === 1) return `${chars[0]!.toUpperCase()}?`
  return '??'
}

export function TopBar({
  profile,
  role,
  fallbackEmail,
  onSignOut,
  onMenuToggle,
}: TopBarProps) {
  const pathname = usePathname()

  const title =
    pageTitles[pathname] ??
    pathname
      .split('/')
      .pop()
      ?.replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) ??
    'Dashboard'

  const nameFromProfile = profile
    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
    : ''

  const initials =
    profile && nameFromProfile
      ? `${(profile.first_name?.[0] ?? '').toUpperCase()}${(profile.last_name?.[0] ?? '').toUpperCase()}`
      : fallbackEmail
        ? emailLocalPartInitials(fallbackEmail)
        : '??'

  const displayName =
    nameFromProfile ||
    (fallbackEmail
      ? (fallbackEmail.split('@')[0] ?? '').replace(/[._-]/g, ' ').trim() || fallbackEmail
      : '') ||
    'User'

  return (
    <header className="flex h-16 items-center gap-4 glass-nav border-b border-gray-100 px-5">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuToggle}
      >
        <Menu className="size-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <h1 className="text-lg font-bold font-display tracking-tight">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-3 sm:flex">
          <Avatar className="size-9 shadow-ambient">
            <AvatarFallback className="text-xs font-semibold bg-[var(--surface-container-high)]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">
              {displayName}
            </span>
            {role && (
              <Badge variant="secondary" className="mt-0.5 w-fit text-[10px]">
                {ROLE_LABELS[role] ?? role}
              </Badge>
            )}
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={onSignOut} className="rounded-xl">
          <LogOut className="size-4" />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    </header>
  )
}
