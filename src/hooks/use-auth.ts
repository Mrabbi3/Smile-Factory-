'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, UserRole } from '@/types/database'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  role: UserRole | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    role: null,
  })
  const supabase = useMemo(() => createClient(), [])
  const profileCache = useRef<{ userId: string; profile: Profile | null } | null>(null)

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (profileCache.current?.userId === userId) {
      return profileCache.current.profile
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Profile fetch error:', error.message)
        return null
      }

      const profile = (data as Profile | null) ?? null
      profileCache.current = { userId, profile }
      return profile
    } catch {
      return null
    }
  }, [supabase])

  const handleSession = useCallback(async (session: Session | null) => {
    if (session?.user) {
      const profile = await fetchProfile(session.user.id)
      setState({
        user: session.user,
        profile,
        loading: false,
        role: profile?.role ?? null,
      })
    } else {
      profileCache.current = null
      setState({ user: null, profile: null, loading: false, role: null })
    }
  }, [fetchProfile])

  useEffect(() => {
    let cancelled = false

    // Initial session load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      handleSession(session)
    }).catch(() => {
      if (cancelled) return
      setState({ user: null, profile: null, loading: false, role: null })
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (cancelled) return
        handleSession(session)
      }
    )

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase, handleSession])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    profileCache.current = null
    setState({ user: null, profile: null, loading: false, role: null })
  }, [supabase])

  const hasRole = (roles: UserRole[]) => {
    return state.role !== null && roles.includes(state.role)
  }

  return {
    ...state,
    signOut,
    hasRole,
    isOwner: () => hasRole(['owner']),
    isManager: () => hasRole(['owner', 'manager']),
    isEmployee: () => hasRole(['owner', 'manager', 'employee']),
    isCustomer: () => state.role === 'customer',
  }
}
