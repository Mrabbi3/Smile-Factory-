'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function PostConfirmPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true

    async function runPromotion() {
      try {
        const supabase = createClient()
        
        // 1. Get current authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          if (active) {
            setStatus('error')
            setErrorMessage('Unable to find active user session. Please sign in.')
          }
          return
        }

        // 2. Call the promote_to_employee RPC
        const { error: rpcError } = await supabase.rpc('promote_to_employee')

        if (rpcError) {
          if (active) {
            setStatus('error')
            setErrorMessage(rpcError.message)
          }
          return
        }

        if (active) {
          setStatus('success')
          // Redirect to admin dashboard
          setTimeout(() => {
            window.location.href = '/admin/dashboard'
          }, 1500)
        }
      } catch (err: unknown) {
        if (active) {
          setStatus('error')
          const msg = err instanceof Error ? err.message : 'An unexpected error occurred'
          setErrorMessage(msg)
        }
      }
    }

    runPromotion()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="pattern-industrial flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-4">
        <Link href="/" className="transition-transform duration-200 hover:scale-105">
          <Image
            src="/branding/smile-factory-logo.png"
            alt="The Smile Factory"
            width={320}
            height={128}
            className="h-auto w-full max-w-[320px] object-contain"
            priority
          />
        </Link>
      </div>

      <div className="w-full max-w-md">
        <Card className="shadow-elevated border border-primary/10">
          <CardHeader className="text-center pb-2">
            {status === 'loading' && (
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Loader2 className="size-6 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="size-6" />
              </div>
            )}
            {status === 'error' && (
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-6" />
              </div>
            )}

            <CardTitle className="text-2xl">
              {status === 'loading' && 'Setting Up Workspace'}
              {status === 'success' && 'Welcome to the Team!'}
              {status === 'error' && 'Setup Failed'}
            </CardTitle>
            
            <CardDescription>
              {status === 'loading' && 'Configuring your staff account and permissions...'}
              {status === 'success' && 'Promoted successfully. Redirecting to dashboard...'}
              {status === 'error' && (errorMessage || 'An error occurred during staff setup.')}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-4 flex flex-col gap-4 text-center">
            {status === 'error' && (
              <>
                <Link
                  href="/admin/login"
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95 transition-colors"
                >
                  Go to Staff Login
                </Link>
                <button
                  onClick={() => {
                    setStatus('loading')
                    setErrorMessage('')
                    window.location.reload()
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Try Again
                </button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
