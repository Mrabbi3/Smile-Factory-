'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
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
import { Loader2, LogIn } from 'lucide-react'
import { signIn } from './actions'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Card className="shadow-elevated">
          <CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent>
        </Card>
      }
    >
      <LoginForm />
    </Suspense>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
      {pending ? 'Signing in...' : 'Sign In'}
    </Button>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const [state, formAction] = useActionState(signIn, null)

  return (
    <Card className="shadow-elevated">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        {redirectTo && <input type="hidden" name="redirect" value={redirectTo} />}
        <CardContent className="space-y-4 pt-4">
          {state?.error && (
            <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive text-center">
              {state.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
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
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <SubmitButton />
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
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
