'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Coins,
  Trophy,
  Calendar,
  ClipboardList,
  Cpu,
  Users,
  UserCog,
  Receipt,
  Gift,
  BarChart3,
  FileText,
  Settings,
  Smile,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  minRole?: 'owner' | 'manager'
}

const navSections: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'POS / Token Sales', href: '/admin/pos', icon: Coins },
      { label: 'Prize Inventory', href: '/admin/prizes', icon: Trophy },
      { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
      {
        label: 'Work Orders',
        href: '/admin/work-orders',
        icon: ClipboardList,
      },
      { label: 'Machines', href: '/admin/machines', icon: Cpu },
    ],
  },
  {
    title: 'People',
    items: [
      { label: 'Customers', href: '/admin/customers', icon: Users },
      {
        label: 'Employees',
        href: '/admin/employees',
        icon: UserCog,
        minRole: 'manager',
      },
    ],
  },
  {
    title: 'Finance & Rewards',
    items: [
      {
        label: 'Expenses',
        href: '/admin/expenses',
        icon: Receipt,
        minRole: 'owner',
      },
      { label: 'Loyalty & Coupons', href: '/admin/loyalty', icon: Gift },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        label: 'Reports',
        href: '/admin/reports',
        icon: BarChart3,
        minRole: 'owner',
      },
      {
        label: 'Documents',
        href: '/admin/documents',
        icon: FileText,
        minRole: 'owner',
      },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
]

interface AdminSidebarProps {
  isOwner: boolean
  isManager: boolean
  onNavigate?: () => void
}

export function AdminSidebar({
  isOwner,
  isManager,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname()

  const canSee = (item: NavItem) => {
    if (!item.minRole) return true
    if (item.minRole === 'owner') return isOwner
    if (item.minRole === 'manager') return isManager
    return true
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Smile className="size-6 text-primary" />
        <span className="text-lg font-bold tracking-tight">Smile Factory</span>
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-2">
          {navSections.map((section, sIdx) => {
            const visibleItems = section.items.filter(canSee)
            if (visibleItems.length === 0) return null

            return (
              <div key={sIdx}>
                {section.title && (
                  <>
                    {sIdx > 0 && <Separator className="my-2" />}
                    <p className="mb-1 px-3 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </p>
                  </>
                )}
                {visibleItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + '/')

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}