import { createBrowserClient } from '@supabase/ssr'

const PLACEHOLDER_SUPABASE_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_SUPABASE_KEY = 'placeholder-anon-key'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    if (typeof window !== 'undefined') {
      throw new Error(
        'Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
      )
    }

    return createBrowserClient(PLACEHOLDER_SUPABASE_URL, PLACEHOLDER_SUPABASE_KEY)
  }

  return createBrowserClient(url, key)
}
