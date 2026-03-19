import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
  const isPublicPage = path === '/' || path.startsWith('/about') || path.startsWith('/pricing') || path.startsWith('/parties') || path.startsWith('/gallery') || path.startsWith('/contact') || path.startsWith('/offline') || path.startsWith('/auth/callback')
  const isProtected = path.startsWith('/admin') || path.startsWith('/customer')

  if (isAuthPage || isAdminLoginPage || isPublicPage) {
    return supabaseResponse
  }

  if (!isProtected) {
    return supabaseResponse
  }

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

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null

  const isAdminArea =
    path.startsWith('/admin') ||
    path.startsWith('/pos') ||
    path.startsWith('/inventory') ||
    path.startsWith('/machines') ||
    path.startsWith('/work-orders') ||
    path.startsWith('/employees') ||
    path.startsWith('/expenses') ||
    path.startsWith('/reports') ||
    path.startsWith('/documents') ||
    path.startsWith('/coupons')

  const staffCookie = request.cookies.get('staff_access_verified')?.value

  if (isAdminArea && !isAdminLoginPage) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }

    if (!staffCookie) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }
  }

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
