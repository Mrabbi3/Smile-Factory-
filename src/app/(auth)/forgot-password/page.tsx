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
import { ArrowLeft, Loader2, KeyRound, CheckCircle2, Lock } from 'lucide-react'
import { resetPasswordWithSecurityQuestion } from './actions'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState('')
  const [isStaff, setIsStaff] = useState(false)
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [staffKey, setStaffKey] = useState('')
  const [stage, setStage] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)

  const handleFetchQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('get_security_question_and_role', {
        p_email: email.trim(),
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (!data) {
        toast.error('No security question is set for this email address. Please contact support.')
        return
      }

      setSecurityQuestion(data.security_question)
      setIsStaff(data.is_staff)
      setStage(2)
    } catch {
      toast.error('Failed to look up account details. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    if (!securityAnswer) {
      toast.error('Please enter the answer to your security question.')
      return
    }

    if (isStaff && !staffKey) {
      toast.error('Staff account reset requires the Staff Access Key.')
      return
    }

    setLoading(true)
    try {
      const res = await resetPasswordWithSecurityQuestion(
        email.trim(),
        securityAnswer.trim(),
        newPassword,
        isStaff ? staffKey.trim() : undefined
      )

      if (res.error) {
        toast.error(res.error)
        return
      }

      setStage(3)
      toast.success('Password updated successfully!')
    } catch {
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (stage === 3) {
    return (
      <Card className="shadow-elevated">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="size-7" />
          </div>
          <CardTitle className="text-2xl">Password Reset Complete</CardTitle>
          <CardDescription>
            Your password has been successfully updated.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground pt-2">
          <p>You can now sign in using your new password.</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/login">Go to login</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (stage === 2) {
    return (
      <Card className="shadow-elevated">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-6" />
          </div>
          <CardTitle className="text-2xl">Verify Security Question</CardTitle>
          <CardDescription>
            Answer your security question to set a new password.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleReset}>
          <CardContent className="space-y-4 pt-4">
            <div className="rounded-lg bg-muted/50 p-4 border border-border">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                Security Question:
              </span>
              <p className="text-sm font-medium text-foreground">{securityQuestion}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="securityAnswer">Your Answer</Label>
              <Input
                id="securityAnswer"
                placeholder="Enter your security answer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                required
              />
            </div>

            {isStaff && (
              <div className="space-y-2">
                <Label htmlFor="staffKey">Staff Access Key</Label>
                <Input
                  id="staffKey"
                  type="password"
                  placeholder="Enter staff verification key"
                  value={staffKey}
                  onChange={(e) => setStaffKey(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Verification key is required to reset administrative accounts.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : 'Reset Password'}
            </Button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                setStage(1)
                setSecurityAnswer('')
                setNewPassword('')
                setConfirmPassword('')
                setStaffKey('')
              }}
            >
              <ArrowLeft className="size-3" />
              Back
            </button>
          </CardFooter>
        </form>
      </Card>
    )
  }

  return (
    <Card className="shadow-elevated">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <KeyRound className="size-6" />
        </div>
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter your email to verify your security question.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleFetchQuestion}>
        <CardContent className="space-y-4 pt-4">
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
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : 'Continue'}
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
