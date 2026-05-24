'use server'

import { createClient } from '@supabase/supabase-js'

export async function resetPasswordWithSecurityQuestion(
  email: string,
  securityAnswer: string,
  newPassword: string,
  staffKey?: string
): Promise<{ error?: string; success?: boolean }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return {
        error:
          'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is not set in the environment variables.',
      };
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // 1. Fetch the user profile by email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, security_answer')
      .eq('email', email)
      .maybeSingle()

    if (profileError || !profile) {
      return { error: 'No user account found with that email address.' }
    }

    // 2. If user is staff, verify the staff key
    const isStaff = ['owner', 'manager', 'employee'].includes(profile.role)
    if (isStaff) {
      const validStaffKey = process.env.STAFF_ACCESS_KEY
      if (!validStaffKey || staffKey !== validStaffKey) {
        return { error: 'Invalid Staff Access Key.' }
      }
    }

    // 3. Verify security question answer
    const dbAnswer = profile.security_answer || ''
    if (
      !dbAnswer ||
      dbAnswer.trim().toLowerCase() !== securityAnswer.trim().toLowerCase()
    ) {
      return { error: 'Incorrect security question answer.' }
    }

    // 4. Reset password using Supabase Admin API
    const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(
      profile.id,
      { password: newPassword }
    )

    if (resetError) {
      return { error: resetError.message }
    }

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'An unexpected error occurred'
    return { error: msg }
  }
}
