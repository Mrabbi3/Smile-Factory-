'use client'

import Image from 'next/image'
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
  Clock,
  Mail,
  MessageSquareQuote,
  Megaphone,
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
      { label: 'Customer inquiries', href: '/admin/inquiries', icon: Mail },
      {
        label: 'Shift reconciliation',
        href: '/admin/shifts',
        icon: Clock,
        minRole: 'owner',
      },
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
      {
        label: 'Review moderation',
        href: '/admin/reviews',
        icon: MessageSquareQuote,
      },
      { label: 'Site Alerts', href: '/admin/alerts', icon: Megaphone },
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
    <div className="flex h-full min-h-0 flex-col bg-white border-r border-gray-200">
      <div className="shrink-0 p-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Image
            src="/branding/smile-factory-logo.png"
            alt="The Smile Factory"
            width={40}
            height={40}
            className="size-10 object-contain"
          />
          <span className="text-lg font-bold tracking-tight font-display">Smile Factory</span>
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pl-[52px]">Staff Admin Portal</p>
      </div>

      <ScrollArea className="min-h-0 flex-1 py-3">
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
                          'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-primary/5 text-primary font-bold border-r-4 border-primary rounded-l-xl'
                            : 'text-gray-500 hover:text-primary hover:bg-primary/5 rounded-xl'
                        )}
                      >
                        <item.icon className="size-5 shrink-0" />
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
