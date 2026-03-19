'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const STAFF_COOKIE_NAME = 'staff_access_verified'
const STAFF_COOKIE_MAX_AGE = 60 * 60 * 8 // 8 hours (one work shift)

export async function verifyStaffKey(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
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

  // Sign out any existing session so the user sees the login form
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // Ignore sign-out errors
  }

  const cookieStore = await cookies()
  cookieStore.set(STAFF_COOKIE_NAME, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: STAFF_COOKIE_MAX_AGE,
    path: '/',
  })

  redirect('/login')
}
