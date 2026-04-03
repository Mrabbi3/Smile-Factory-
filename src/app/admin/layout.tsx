'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { AdminSidebar } from '@/components/admin/sidebar'
import { TopBar } from '@/components/admin/top-bar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'

function AdminShell({ children }: { children: React.ReactNode }) {
  const { profile, loading, role, signOut, isOwner, isManager } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // List of Stitch page routes that use their own sidebar
  const stitchPages = [
    '/admin/dashboard',
    '/admin/bookings',
    '/admin/coupons',
    '/admin/documents',
    '/admin/reports',
    '/admin/expenses',
    '/admin/loyalty',
    '/admin/machines',
    '/admin/customers',
    '/admin/work-orders',
    '/admin/employees',
    '/admin/pos',
    '/admin/inventory',
    '/admin/tokens',
  ]

  const isStitchPage = stitchPages.includes(pathname)

  return (
    <div className="flex h-svh overflow-hidden bg-[#f9fafb]">
      <aside className="hidden w-72 shrink-0 lg:block">
        <AdminSidebar isOwner={isOwner()} isManager={isManager()} />
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AdminSidebar
            isOwner={isOwner()}
            isManager={isManager()}
            onNavigate={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        {!isStitchPage && (
          <TopBar
            profile={loading ? null : profile}
            role={loading ? null : role}
            onSignOut={async () => {
              await signOut()
              document.cookie = 'staff_access_verified=; path=/; max-age=0'
              window.location.href = '/login'
            }}
            onMenuToggle={() => setSidebarOpen(true)}
          />
        )}

        <main className={`flex-1 overflow-y-auto ${isStitchPage ? 'p-0' : 'p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return <AdminShell>{children}</AdminShell>
}
