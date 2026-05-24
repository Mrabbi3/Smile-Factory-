'use client'

import { useActionState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, LogIn, UserPlus } from 'lucide-react'
import { staffSignIn, staffCreateAccount } from './actions'

function SignInButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
      <span className="ml-2">{pending ? 'Signing in…' : 'Sign in'}</span>
    </Button>
  )
}

function CreateButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
      <span className="ml-2">{pending ? 'Creating…' : 'Create staff account'}</span>
    </Button>
  )
}

export function StaffAuthTabs() {
  const [signInState, signInAction] = useActionState(staffSignIn, null)
  const [createState, createAction] = useActionState(staffCreateAccount, null)

  useEffect(() => {
    if (signInState?.error) toast.error(signInState.error)
  }, [signInState])
  useEffect(() => {
    if (createState?.error) toast.error(createState.error)
  }, [createState])

  return (
    <Card className="rounded-2xl shadow-elevated">
      <CardHeader>
        <CardTitle className="font-display tracking-tight">Welcome, staff</CardTitle>
        <CardDescription>
          You&rsquo;ve passed the access-key gate. Sign in if you have an account, or create one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signin">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="create">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="pt-4">
            <form action={signInAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <SignInButton />
            </form>
          </TabsContent>

          <TabsContent value="create" className="pt-4">
            <form action={createAction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="create-first">First name</Label>
                  <Input id="create-first" name="first_name" required autoComplete="given-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-last">Last name</Label>
                  <Input id="create-last" name="last_name" autoComplete="family-name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-security-question">Security Question</Label>
                <select
                  id="create-security-question"
                  name="security_question"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select a security question</option>
                  <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                  <option value="In what city were you born?">In what city were you born?</option>
                  <option value="What was the make and model of your first car?">What was the make and model of your first car?</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-security-answer">Security Answer</Label>
                <Input
                  id="create-security-answer"
                  name="security_answer"
                  placeholder="Your answer"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">Password</Label>
                <Input
                  id="create-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <p className="text-xs text-muted-foreground">At least 6 characters.</p>
              </div>
              <CreateButton />
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
