'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '1rem',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            Something went wrong
          </h2>
          <p style={{ marginTop: '0.5rem', color: '#6b7280' }}>
            An unexpected error occurred. Please try again.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={reset}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                backgroundColor: '#dc2626',
                color: 'white',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => (window.location.href = '/')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
