import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
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

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAdminLoginPage = path === '/admin/login'
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

  // Staff access cookie required for admin (owner-only key from env)
  const staffCookie = request.cookies.get('staff_access_verified')?.value

  // Protected admin routes (except the admin login key page)
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role === 'customer') {
      const url = request.nextUrl.clone()
      url.pathname = '/customer/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Protected customer routes
  if (path.startsWith('/customer')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in users away from auth pages
  if ((path === '/login' || path === '/register') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    if (profile && profile.role !== 'customer') {
      url.pathname = '/admin/dashboard'
    } else {
      url.pathname = '/customer/dashboard'
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}