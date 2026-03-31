'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
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
      { label: 'Token Transactions', href: '/admin/tokens', icon: Coins },
      { label: 'Prize Inventory', href: '/admin/inventory', icon: Trophy },
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
      { label: 'Loyalty', href: '/admin/loyalty', icon: Gift },
      { label: 'Coupons', href: '/admin/coupons', icon: Gift },
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
    <div className="flex h-full flex-col bg-card">
      {/* Logo — Joy Assembler gradient icon */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex size-9 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-ambient">
          <Smile className="size-5" />
        </div>
        <span className="text-lg font-bold tracking-tight font-display">Smile Factory</span>
      </div>

      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-1 px-3">
          {navSections.map((section, sIdx) => {
            const visibleItems = section.items.filter(canSee)
            if (visibleItems.length === 0) return null

            return (
              <div key={sIdx} className={sIdx > 0 ? 'mt-4' : ''}>
                {section.title && (
                  <p className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground font-display">
                    {section.title}
                  </p>
                )}
                <div className="flex flex-col gap-0.5">
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
                          'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'gradient-primary text-primary-foreground shadow-ambient'
                            : 'text-muted-foreground hover:bg-[var(--surface-container-low)] hover:text-foreground'
                        )}
                      >
                        <item.icon className="size-4 shrink-0" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
