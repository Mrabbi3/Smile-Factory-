'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { AdminSidebar } from '@/components/admin/sidebar'
import { TopBar } from '@/components/admin/top-bar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminLoginPage = pathname === '/admin/login'

  const { user, profile, loading, role, signOut, isOwner, isManager, isCustomer } =
    useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (isAdminLoginPage || loading) return
    hasInitialized.current = true
    if (!user) {
      window.location.href = '/login'
    } else if (role !== null && isCustomer()) {
      window.location.href = '/customer/dashboard'
    }
  }, [loading, user, role, isAdminLoginPage])

  if (isAdminLoginPage) {
    return <>{children}</>
  }

  if (loading && !hasInitialized.current) {
    return (
      <div className="flex h-svh">
        <div className="hidden w-64 border-r lg:block">
          <div className="flex h-14 items-center gap-2 border-b px-4">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex h-14 items-center border-b px-4">
            <Skeleton className="h-5 w-40" />
            <div className="ml-auto flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <div className="flex-1 p-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!user && !loading) {
    return null
  }

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
          profile={profile}
          role={role}
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
