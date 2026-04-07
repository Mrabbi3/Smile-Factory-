'use client'

import { useState } from 'react'
import Image from 'next/image'
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
import { ArrowLeft, Loader2 } from 'lucide-react'
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
    <div className="pattern-industrial flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-4">
        <Image
          src="/branding/smile-factory-logo.png"
          alt="The Smile Factory"
          width={80}
          height={80}
          className="size-20 object-contain"
          priority
        />
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Staff Access
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter the owner access key to continue
          </p>
        </div>
      </div>
      <div className="w-full max-w-md">
        <Card className="rounded-2xl shadow-elevated">
          <CardHeader className="text-center">
            <CardTitle className="font-display tracking-tight">Staff Access Key</CardTitle>
            <CardDescription>
              Enter the access key provided by the business owner
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
                  className="rounded-xl"
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
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
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
