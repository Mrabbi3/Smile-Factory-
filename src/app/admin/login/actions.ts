'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const STAFF_COOKIE_NAME = 'staff_access_verified'
const STAFF_COOKIE_MAX_AGE = 60 * 15 // 15 minutes

export async function verifyStaffKey(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const key = formData.get('key')?.toString()?.trim()
  const adminKey = process.env.ADMIN_ACCESS_KEY

  if (!adminKey) {
    return { error: 'Staff access is not configured' }
  }
  if (!key) {
    return { error: 'Key is required' }
  }
  if (key !== adminKey) {
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

  redirect('/login')
}