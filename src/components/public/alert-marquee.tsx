'use client'

import { type CSSProperties, useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
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

  const durationSec = useMemo(() => {
    if (!joined.length) return 45
    return Math.max(20, Math.min(85, joined.length * 0.55))
  }, [joined])

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
        'relative z-30 w-full shrink-0 border-b border-black/10',
        'bg-primary text-primary-foreground shadow-sm'
      )}
      role="region"
      aria-label="Site announcement"
    >
      <div className="flex items-stretch">
        <div className="sf-marquee-viewport min-w-0 flex-1 overflow-hidden py-2.5 pr-2 pl-4 sm:py-2 sm:pl-6">
          <div
            className="sf-marquee-track flex w-max"
            style={
              {
                '--sf-marquee-duration': `${durationSec}s`,
              } as CSSProperties
            }
          >
            <span className="inline-block whitespace-nowrap px-6 text-sm font-medium tracking-wide sm:text-[0.8125rem]">
              {joined}
              <span className="mx-4 opacity-60" aria-hidden>
                •
              </span>
            </span>
            <span className="inline-block whitespace-nowrap px-6 text-sm font-medium tracking-wide sm:text-[0.8125rem]" aria-hidden>
              {joined}
              <span className="mx-4 opacity-60" aria-hidden>
                •
              </span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          className="flex shrink-0 items-center justify-center border-l border-white/15 px-3 transition-colors hover:bg-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white/80 sm:px-4"
          aria-label="Dismiss announcement"
        >
          <X className="size-4 opacity-90 sm:size-[1.125rem]" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  )
}
