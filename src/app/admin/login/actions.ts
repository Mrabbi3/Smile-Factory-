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
  const adminKeyEnv = process.env.ADMIN_ACCESS_KEY

  if (!adminKeyEnv) {
    return { error: 'Staff access is not configured. Set ADMIN_ACCESS_KEY in .env.local' }
  }
  if (!key) {
    return { error: 'Key is required' }
  }

  const validKeys = adminKeyEnv.split(',').map((k) => k.trim()).filter(Boolean)

  if (!validKeys.includes(key)) {
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

  // Check if user already has an active session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // User is already logged in, go straight to admin dashboard
    redirect('/admin/dashboard')
  }

  // Otherwise redirect to login page
  redirect('/login')
}
