import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { StaffAuthTabs } from './staff-auth-tabs'

const STAFF_COOKIE_NAME = 'staff_access_verified'

// Server-side gate: this page is only reachable once the staff access key
// has been verified at /admin/login (which sets the cookie). Without the
// cookie we bounce straight back so nobody can use the registration flow
// without the key.
export default async function AdminAuthPage() {
  const cookieStore = await cookies()
  if (!cookieStore.get(STAFF_COOKIE_NAME)?.value) {
    redirect('/admin/login')
  }

  return (
    <div className="pattern-industrial flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-4">
        <Link href="/" className="transition-transform duration-200 hover:scale-105">
          <Image
            src="/branding/smile-factory-logo.png"
            alt="The Smile Factory"
            width={320}
            height={128}
            className="h-auto w-full max-w-[320px] object-contain"
            priority
          />
        </Link>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Staff portal
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in or create your staff account.
          </p>
        </div>
      </div>

      <div className="w-full max-w-md space-y-4">
        <StaffAuthTabs />
        <Link
          href="/"
          className="mx-auto inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-3" />
          Back to home
        </Link>
      </div>
    </div>
  )
}
