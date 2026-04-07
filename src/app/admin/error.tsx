'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="max-w-md text-center">
        <CardHeader>
          <AlertTriangle className="mx-auto mb-2 size-10 text-destructive" />
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            An error occurred while loading this page. Please try again.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={reset}>Try Again</Button>
            <Button variant="outline" onClick={() => (window.location.href = '/admin/dashboard')}>
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
