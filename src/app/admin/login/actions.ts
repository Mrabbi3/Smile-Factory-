'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const STAFF_COOKIE_NAME = 'staff_access_verified'
const STAFF_COOKIE_MAX_AGE = 60 * 60 * 8 // 8 hours (one work shift)

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

/**
 * verifyStaffKey — single login page, two key types managed by the owner.
 *
 *   1. DB-backed access keys (owner-rotatable, see migration 00015):
 *      `verify_access_key` RPC hashes the entered key, looks it up, and
 *      atomically promotes the caller's profile.role to 'owner' or
 *      'employee'.
 *   2. Bootstrap fallback for the very first owner: if no owner key exists
 *      yet, the value of ADMIN_ACCESS_KEY env works once via
 *      `bootstrap_owner_if_no_keys`. After the first run, that fallback is
 *      inert and the owner manages keys from /admin/settings.
 *
 * The staff_access_verified cookie is set on success; middleware checks
 * for it before allowing /admin/* navigation.
 */
export async function verifyStaffKey(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const h = await headers()
  const xf = h.get('x-forwarded-for')
  const ip = xf?.split(',')[0]?.trim() || 'unknown'

  if (!checkRateLimit(ip)) {
    return { error: 'Too many attempts — try again later.' }
  }

  const key = formData.get('key')?.toString()?.trim()
  if (!key) {
    return { error: 'Key is required' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // We need an authenticated user so the SECURITY DEFINER RPC knows whose
    // profile.role to promote. Send them through customer sign-in first;
    // they'll come right back here once signed in.
    redirect('/login?redirect=/admin/login')
  }

  // 1) Try owner-managed DB access keys
  let promoted: 'owner' | 'employee' | null = null
  const { data: dbRole, error: dbErr } = await supabase.rpc('verify_access_key', {
    p_key: key,
  })

  if (dbErr) {
    // RPC missing (migration 00015 not yet applied) or transient failure.
    // We log and fall through so first-owner bootstrap can still succeed.
    console.error('verify_access_key rpc error:', dbErr.message)
  }

  if (dbRole === 'owner' || dbRole === 'employee') {
    promoted = dbRole
  } else {
    // 2) Bootstrap fallback for first owner
    const adminKeyEnv = process.env.ADMIN_ACCESS_KEY
    if (adminKeyEnv) {
      const validKeys = adminKeyEnv.split(',').map((k) => k.trim()).filter(Boolean)
      if (validKeys.includes(key)) {
        const { data: bootRole, error: bootErr } = await supabase.rpc(
          'bootstrap_owner_if_no_keys',
          { p_key: key }
        )
        if (bootErr) {
          console.error('bootstrap_owner_if_no_keys rpc error:', bootErr.message)
        }
        if (bootRole === 'owner') {
          promoted = 'owner'
        }
      }
    }
  }

  if (!promoted) {
    return { error: 'Invalid access key' }
  }

  const cookieStore = await cookies()
  cookieStore.set(STAFF_COOKIE_NAME, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: STAFF_COOKIE_MAX_AGE,
    path: '/',
  })

  redirect('/admin/dashboard')
}
