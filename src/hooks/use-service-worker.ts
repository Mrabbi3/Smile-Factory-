'use client'

import { useEffect } from 'react'

export function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {})
    }
  }, [])
}