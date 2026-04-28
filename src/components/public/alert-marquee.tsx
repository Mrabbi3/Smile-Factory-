'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/** Load active-visible alerts — filter end time client-side (avoids brittle PostgREST .or(timestamp) parsing). */
function isAlertVisible(now: Date, ends_at: string | null) {
  if (!ends_at) return true
  return new Date(ends_at).getTime() >= now.getTime()
}

export function AlertMarquee() {
  const [msgs, setMsgs] = useState<{ id: string; message: string }[]>([])

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

  if (msgs.length === 0) return null

  const joined = msgs.map((m) => m.message).join('  •  ')
  const duplicated = `${joined}  •  `.repeat(2)

  return (
    <div className="relative z-[60] w-full overflow-hidden bg-primary py-2 text-primary-foreground">
      <div className="sf-marquee-mask">
        <p className="sf-marquee-track font-semibold">{duplicated}</p>
      </div>
      <style jsx global>{`
        .sf-marquee-mask {
          overflow: hidden;
        }
        @keyframes sf-marquee-x {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .sf-marquee-track {
          display: inline-block;
          white-space: nowrap;
          padding-right: 4rem;
          animation: sf-marquee-x ${Math.min(110, msgs.length * 28)}s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .sf-marquee-track {
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </div>
  )
}
