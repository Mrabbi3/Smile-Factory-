'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { STAFF_COOKIE_NAME } from '@/lib/staff-gate'

// =====================================================================
// HOW TO CHANGE THE STAFF ACCESS KEY
// ---------------------------------------------------------------------
// 1. Open .env.local and edit:        STAFF_ACCESS_KEY=your-new-key
// 2. Open Vercel project → Settings → Environment Variables, edit the
//    STAFF_ACCESS_KEY value to match.
// 3. Redeploy (Vercel does this automatically when env vars change).
//
// Tell your staff the new key. There is no migration step. You can also
// list multiple acceptable keys with commas, e.g. STAFF_ACCESS_KEY=a,b,c.
//
// HOW TO GIVE SOMEONE OWNER ACCESS
// ---------------------------------------------------------------------
// Owner role is granted by hand via Supabase. In the SQL editor:
//   UPDATE public.profiles
//      SET role = 'owner', updated_at = now()
//    WHERE email = 'their-email@example.com';
// They'll see the owner-only menus on their next page load.
// =====================================================================

const STAFF_COOKIE_MAX_AGE = 60 * 60 * 8 // 8 hours (one work shift)

/** Clears the httpOnly staff gate cookie (cannot be removed from client JS). */
export async function clearStaffGateCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(STAFF_COOKIE_NAME)
}

const failMap = new Map<string, { count: number; expires: number }>()
const WINDOW_MS = 15 * 60 * 1000
const MAX_TRIES = 5

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const cur = failMap.get(ip)
  if (!cur || now > cur.expires) {
    failMap.set(ip, { count: 1, expires: now + WINDOW_MS })
    return true
  }
  cur.count += 1
  failMap.set(ip, cur)
  return cur.count <= MAX_TRIES
}

function readStaffKeys(): string[] {
  const env =
    process.env.STAFF_ACCESS_KEY ??
    process.env.ADMIN_ACCESS_KEY ?? // legacy var name still works
    ''
  return env
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
}

export async function verifyStaffKey(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const h = await headers()
  const xf = h.get('x-forwarded-for')
  const ip = xf?.split(',')[0]?.trim() || 'unknown'

  if (!checkRateLimit(ip)) {
    return { error: 'Too many attempts — try again in a few minutes.' }
  }

  const key = formData.get('key')?.toString()?.trim()
  if (!key) {
    return { error: 'Key is required' }
  }

  const validKeys = readStaffKeys()
  if (validKeys.length === 0) {
    return {
      error: 'Staff access is not configured. Set STAFF_ACCESS_KEY in your environment.',
    }
  }

  if (!validKeys.includes(key)) {
    return { error: 'Invalid key' }
  }

  const cookieStore = await cookies()
  cookieStore.set(STAFF_COOKIE_NAME, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: STAFF_COOKIE_MAX_AGE,
    path: '/',
  })

  // Always send staff to the sign-in screen after the access key. Entering
  // the key must not skip password entry when a browser still holds a
  // Supabase session from before — staff sign out fully clears the session,
  // and this keeps the gate + credentials as two separate steps.
  redirect('/admin/auth')
}
