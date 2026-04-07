'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="mb-4 size-12 text-destructive" />
      <h2 className="text-xl font-bold">Something went wrong</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Go Home
        </Button>
      </div>
    </div>
  )
}
