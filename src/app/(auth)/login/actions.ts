'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const email = formData.get('email')?.toString()?.trim()
  const password = formData.get('password')?.toString()
  const redirectTo = formData.get('redirect')?.toString()

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Unable to retrieve user information' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  let destination: string
  if (redirectTo) {
    destination = redirectTo
  } else {
    const staffRoles = ['owner', 'manager', 'employee']
    if (profile?.role && staffRoles.includes(profile.role)) {
      destination = '/admin/dashboard'
    } else {
      destination = '/customer/dashboard'
    }
  }

  redirect(destination)
}
