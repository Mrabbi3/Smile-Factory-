'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setState({
          user,
          profile: profile as Profile | null,
          loading: false,
          role: (profile as Profile | null)?.role ?? null,
        })
      } else {
        setState({ user: null, profile: null, loading: false, role: null })
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          setState({
            user: session.user,
            profile: profile as Profile | null,
            loading: false,
            role: (profile as Profile | null)?.role ?? null,
          })
        } else {
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