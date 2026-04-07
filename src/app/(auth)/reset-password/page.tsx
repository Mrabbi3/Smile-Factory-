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
import { ArrowLeft, Loader2, ShieldCheck, Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error(error.message)
        return
      }
      setDone(true)
      toast.success('Password updated. Sign in with your new password.')
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <Card className="shadow-elevated">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full gradient-primary text-primary-foreground shadow-ambient">
            <ShieldCheck className="size-7" />
          </div>
          <CardTitle className="text-2xl">Password Updated</CardTitle>
          <CardDescription>
            Your password has been reset. You can now sign in with your new password.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="shadow-elevated">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="size-6" />
        </div>
        <CardTitle className="text-2xl">Set New Password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="size-3" />
            Back to sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
