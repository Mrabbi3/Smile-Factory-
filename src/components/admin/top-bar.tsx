'use client'

import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
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
  '/admin/loyalty': 'Loyalty',
  '/admin/coupons': 'Coupons',
  '/admin/reports': 'Reports',
  '/admin/documents': 'Documents',
  '/admin/settings': 'Settings',
  '/customer/dashboard': 'Dashboard',
  '/customer/bookings': 'My Bookings',
  '/customer/tokens': 'Token History',
  '/customer/loyalty': 'Loyalty Rewards',
  '/customer/profile': 'My Profile',
}

interface TopBarProps {
  profile: Profile | null
  role: UserRole | null
  onSignOut: () => void
  onMenuToggle: () => void
}

export function TopBar({ profile, role, onSignOut, onMenuToggle }: TopBarProps) {
  const pathname = usePathname()

  const title =
    pageTitles[pathname] ??
    pathname
      .split('/')
      .pop()
      ?.replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) ??
    'Dashboard'

  const initials = profile
    ? `${(profile.first_name?.[0] ?? '').toUpperCase()}${(profile.last_name?.[0] ?? '').toUpperCase()}`
    : '??'

  const displayName = profile
    ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim()
    : 'User'

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuToggle}
      >
        <Menu className="size-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden items-center gap-2 sm:flex">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight">
              {displayName}
            </span>
            {role && (
              <Badge variant="secondary" className="mt-0.5 w-fit text-[10px]">
                {ROLE_LABELS[role] ?? role}
              </Badge>
            )}
          </div>
        </div>

        <Separator orientation="vertical" className="hidden h-6 sm:block" />

        <Button variant="ghost" size="icon" onClick={onSignOut}>
          <LogOut className="size-4" />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    </header>
  )
}
