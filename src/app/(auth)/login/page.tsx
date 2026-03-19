'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  return (
    <Suspense fallback={<Card><CardContent className="p-8 text-center">Loading...</CardContent></Card>}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.signOut().finally(() => setReady(true))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Unable to retrieve user information')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Profile fetch error:', profileError)
      }

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

      toast.success('Welcome back!')
      window.location.href = destination
    } catch (err) {
      console.error('Login error:', err)
      toast.error('An unexpected error occurred. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading || !ready}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {!ready ? 'Preparing...' : 'Sign In'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Create account
            </Link>
          </p>
          <Link
            href="/admin/login"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Staff? Enter access key here
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
