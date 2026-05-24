'use server'

import { cookies } from 'next/headers'
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
  const securityQuestion = formData.get('security_question')?.toString()
  const securityAnswer = formData.get('security_answer')?.toString()?.trim()

  if (!email || !password || !firstName || !securityQuestion || !securityAnswer) {
    return { error: 'First name, email, password, security question and answer are required.' }
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        security_question: securityQuestion,
        security_answer: securityAnswer,
      },
    },
  })

  if (error) return { error: error.message }

  // Since email confirmation is off in production/dev, the user is signed in
  // immediately. Promote them to employee immediately.
  try {
    await supabase.rpc('promote_to_employee')
  } catch {
    /* user not yet authenticated — promotion will run on first sign-in */
  }

  redirect('/admin/dashboard')
}
