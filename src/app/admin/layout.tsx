'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { AdminSidebar } from '@/components/admin/sidebar'
import { TopBar } from '@/components/admin/top-bar'
import { clearStaffGateCookie } from '@/app/admin/login/actions'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'

function AdminShell({ children }: { children: React.ReactNode }) {
  const { profile, loading, role, signOut, isOwner, isManager, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-svh overflow-hidden bg-[#f9fafb]">
      <aside className="hidden min-h-0 w-72 shrink-0 lg:flex lg:flex-col">
        <AdminSidebar isOwner={isOwner()} isManager={isManager()} />
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="flex h-full min-h-0 w-72 flex-col gap-0 overflow-hidden p-0"
          showCloseButton={false}
        >
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
          fallbackEmail={user?.email}
          onSignOut={async () => {
            await signOut()
            await clearStaffGateCookie()
            window.location.href = '/admin/login'
          }}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6">
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

  if (
    pathname === '/admin/login' ||
    pathname === '/admin/auth' ||
    pathname.startsWith('/admin/auth/')
  ) {
    return <>{children}</>
  }

  return <AdminShell>{children}</AdminShell>
}
