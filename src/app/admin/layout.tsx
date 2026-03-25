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

  return (
    <div className="flex h-svh overflow-hidden">
      <aside className="hidden w-64 shrink-0 border-r lg:block">
        <AdminSidebar isOwner={isOwner()} isManager={isManager()} />
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <AdminSidebar
            isOwner={isOwner()}
            isManager={isManager()}
            onNavigate={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
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

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
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
