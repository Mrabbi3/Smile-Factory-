'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, UserRole } from '@/types/database'
import type { User } from '@supabase/supabase-js'

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
  const supabase = createClient()
  const profileCache = useRef<{ userId: string; profile: Profile | null } | null>(null)

  useEffect(() => {
    const fetchProfile = async (user: User) => {
      if (profileCache.current?.userId === user.id) {
        return profileCache.current.profile
      }
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Failed to fetch profile:', error)
      }

      const result = (profile as Profile | null) ?? null
      profileCache.current = { userId: user.id, profile: result }
      return result
    }

    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const profile = await fetchProfile(session.user)
          setState({ user: session.user, profile, loading: false, role: profile?.role ?? null })
        } else {
          setState({ user: null, profile: null, loading: false, role: null })
        }
      } catch (err) {
        console.error('Auth error:', err)
        setState({ user: null, profile: null, loading: false, role: null })
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'TOKEN_REFRESHED' && state.user?.id === session?.user?.id) {
          return
        }
        if (session?.user) {
          const profile = await fetchProfile(session.user)
          setState({ user: session.user, profile, loading: false, role: profile?.role ?? null })
        } else {
          profileCache.current = null
          setState({ user: null, profile: null, loading: false, role: null })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setState({ user: null, profile: null, loading: false, role: null })
  }

  const hasRole = (roles: UserRole[]) => {
    return state.role !== null && roles.includes(state.role)
  }

  const isOwner = () => hasRole(['owner'])
  const isManager = () => hasRole(['owner', 'manager'])
  const isEmployee = () => hasRole(['owner', 'manager', 'employee'])
  const isCustomer = () => state.role === 'customer'

  return { ...state, signOut, hasRole, isOwner, isManager, isEmployee, isCustomer }
}
