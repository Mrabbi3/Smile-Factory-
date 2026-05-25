'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'


/** Load active-visible alerts — filter end time client-side (avoids brittle PostgREST .or(timestamp) parsing). */
function isAlertVisible(now: Date, ends_at: string | null) {
  if (!ends_at) return true
  return new Date(ends_at).getTime() >= now.getTime()
}

const DISMISS_KEY = 'sf_site_alert_dismiss_ids'

export function AlertMarquee() {
  const [msgs, setMsgs] = useState<{ id: string; message: string }[]>([])
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const sb = createClient()
        const nowIso = new Date().toISOString()
        const { data, error } = await sb
          .from('site_alerts')
          .select('id, message, ends_at')
          .eq('active', true)
          .lte('starts_at', nowIso)

        if (error || cancelled) return
        const rows = (data ?? []).filter((r) =>
          isAlertVisible(new Date(), (r.ends_at as string | null) ?? null)
        )
        if (!cancelled) {
          setMsgs(rows.map((r) => ({ id: String(r.id), message: String(r.message) })))
        }
      } catch {
        /* placeholder client / missing env in edge cases */
      }
    }

    void load()
    const id = window.setInterval(() => void load(), 60_000)
    const onVis = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelled = true
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  useEffect(() => {
    if (msgs.length === 0) return
    try {
      const fingerprint = [...msgs].map((m) => m.id).sort().join(',')
      const stored = localStorage.getItem(DISMISS_KEY)
      if (stored === fingerprint) setDismissed(true)
    } catch {
      /* private mode */
    }
  }, [msgs])

  const joined = useMemo(() => msgs.map((m) => m.message.trim()).join('  •  '), [msgs])

  if (msgs.length === 0 || dismissed) return null

  const dismiss = () => {
    try {
      const fingerprint = [...msgs].map((m) => m.id).sort().join(',')
      localStorage.setItem(DISMISS_KEY, fingerprint)
    } catch {
      /* ignore */
    }
    setDismissed(true)
  }

  return (
    <div
      className={cn(
        'relative z-30 w-full shrink-0 border-b-2 border-red-700',
        'bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white shadow-md'
      )}
      role="region"
      aria-label="Site announcement"
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8 relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 justify-center text-center">
          <AlertCircle className="size-4 shrink-0 animate-pulse text-red-100" />
          <span className="font-display text-sm sm:text-base font-bold tracking-wide text-red-50">
            {joined}
          </span>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="flex shrink-0 items-center justify-center rounded-lg p-1.5 transition-colors hover:bg-white/10 text-white/90 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
          aria-label="Dismiss announcement"
        >
          <X className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

