'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
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
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react'
import { verifyStaffKey } from './actions'

export default function AdminLoginPage() {
  const [key, setKey] = useState('')
  const [state, formAction, isPending] = useActionState(verifyStaffKey, null)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-primary">
          <KeyRound className="size-10" />
          <span className="text-2xl font-bold tracking-tight">
            Staff Access
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter the owner access key to continue
        </p>
      </div>
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Owner key</CardTitle>
            <CardDescription>
              This key is only available to the business owner
            </CardDescription>
          </CardHeader>
          <form action={formAction}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key">Access key</Label>
                <Input
                  id="key"
                  name="key"
                  type="password"
                  placeholder="Enter key"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Continue to sign in
              </Button>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="size-3" />
                Back to customer sign in
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}