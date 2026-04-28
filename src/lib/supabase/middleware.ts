import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { STAFF_COOKIE_NAME } from '@/lib/staff-gate'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse
  }

  const path = request.nextUrl.pathname

  const isAuthPage = path === '/login' || path === '/register' || path === '/forgot-password' || path === '/reset-password'
  const isAdminLoginPage = path === '/admin/login'
  // /admin/auth lives BEHIND the access-key gate but does not yet require
  // a Supabase session (creating an account doesn't have one yet). Allow
  // it through if the staff cookie is present.
  const isAdminAuthPage = path === '/admin/auth' || path.startsWith('/admin/auth/')
  const isPublicPage =
    path === '/' ||
    path.startsWith('/about') ||
    path.startsWith('/pricing') ||
    path.startsWith('/parties') ||
    path.startsWith('/gallery') ||
    path.startsWith('/contact') ||
    path.startsWith('/reviews') ||
    path.startsWith('/offline') ||
    path.startsWith('/auth/callback')
  const isProtected = path.startsWith('/admin') || path.startsWith('/customer')

  // Create the Supabase client with cookie handling to keep session alive
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use getUser() to validate and refresh the session token
  const { data: { user } } = await supabase.auth.getUser()
  const staffCookie = request.cookies.get(STAFF_COOKIE_NAME)?.value

  // Public and customer-auth pages — let them through.
  if (isAuthPage || isAdminLoginPage || isPublicPage || !isProtected) {
    return supabaseResponse
  }

  // /admin/auth — gated by the access-key cookie ONLY (no user yet).
  if (isAdminAuthPage) {
    if (!staffCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Other /admin/* — needs a signed-in user AND the access-key cookie.
  const isAdminArea = path.startsWith('/admin')
  if (isAdminArea) {
    if (!staffCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/auth'
      return NextResponse.redirect(url)
    }
  }

  // /customer/* — just needs a signed-in user.
  if (path.startsWith('/customer')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
