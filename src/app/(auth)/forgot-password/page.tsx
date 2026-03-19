'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setSent(true)
      toast.success('Password reset email sent!')
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a password reset link to{' '}
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>
            Click the link in the email to reset your password. If you
            don&apos;t see it, check your spam folder.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSent(false)}
          >
            Try a different email
          </Button>
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="size-3" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleReset}>
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Reset Password
          </Button>
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="size-3" />
            Back to sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
