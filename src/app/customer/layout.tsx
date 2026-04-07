'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { TopBar } from '@/components/admin/top-bar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  Coins,
  Gift,
  UserCircle,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
  { label: 'My Bookings', href: '/customer/bookings', icon: Calendar },
  { label: 'Token History', href: '/customer/tokens', icon: Coins },
  { label: 'Loyalty Rewards', href: '/customer/loyalty', icon: Gift },
  { label: 'My Profile', href: '/customer/profile', icon: UserCircle },
]

function CustomerSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-16 items-center gap-3 px-5">
        <Image
          src="/branding/smile-factory-logo.png"
          alt="The Smile Factory"
          width={36}
          height={36}
          className="size-9 object-contain"
        />
        <span className="text-lg font-bold tracking-tight font-display">Smile Factory</span>
      </div>
      <ScrollArea className="flex-1 py-3">
        <nav className="flex flex-col gap-0.5 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')

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
        </nav>
      </ScrollArea>
    </div>
  )
}

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile, loading, role, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      {/* Desktop sidebar — no border, uses shadow */}
      <aside className="hidden w-64 shrink-0 shadow-ambient lg:block">
        <CustomerSidebar />
      </aside>

      {/* Mobile sidebar sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <CustomerSidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          profile={loading ? null : profile}
          role={loading ? null : role}
          onSignOut={async () => {
            await signOut()
            window.location.href = '/login'
          }}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
