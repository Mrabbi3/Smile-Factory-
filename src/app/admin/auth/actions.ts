'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { STAFF_COOKIE_NAME } from '@/lib/staff-gate'

// All functions here require the staff_access_verified cookie. Without it
// nobody can sign in or create an account from this entrypoint, so the
// staff portal stays gated by the access key.

async function ensureStaffCookie(): Promise<{ error?: string }> {
  const cookieStore = await cookies()
  if (!cookieStore.get(STAFF_COOKIE_NAME)?.value) {
    return { error: 'Access key required. Go back to /admin/login first.' }
  }
  return {}
}

export async function staffSignIn(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const gate = await ensureStaffCookie()
  if (gate.error) return gate

  const email = formData.get('email')?.toString()?.trim()
  const password = formData.get('password')?.toString() ?? ''
  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  await supabase.rpc('promote_to_employee')
  redirect('/admin/dashboard')
}

export async function staffCreateAccount(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const gate = await ensureStaffCookie()
  if (gate.error) return gate

  const email = formData.get('email')?.toString()?.trim()
  const password = formData.get('password')?.toString() ?? ''
  const firstName = formData.get('first_name')?.toString()?.trim() ?? ''
  const lastName = formData.get('last_name')?.toString()?.trim() ?? ''

  if (!email || !password || !firstName) {
    return { error: 'First name, email and password are required.' }
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  const supabase = await createClient()
  const h = await headers()
  const origin = h.get('origin') ?? ''

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Email confirmation lands them at /admin/auth so they can finish
      // the staff promotion after verifying.
      emailRedirectTo: origin
        ? `${origin}/auth/callback?next=/admin/auth/post-confirm`
        : undefined,
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  })

  if (error) return { error: error.message }

  // If Supabase has email confirmation off (dev) the user is signed in
  // immediately. Try to promote — no-op if no session yet. Wrap in
  // try/catch because supabase.rpc() returns a builder, not a Promise,
  // so we can't .catch() it directly.
  try {
    await supabase.rpc('promote_to_employee')
  } catch {
    /* user not yet authenticated — promotion will run on first sign-in */
  }

  // Either way, send them to the dashboard. If they have a confirmation
  // email pending, that page will surface a "verify your email" toast.
  redirect('/admin/dashboard')
}
