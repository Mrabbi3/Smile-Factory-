'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AlertMarquee() {
  const [msgs, setMsgs] = useState<{ id: string; message: string }[]>([])

  useEffect(() => {
    try {
      const sb = createClient()
      sb
        .from('site_alerts')
        .select('id, message')
        .eq('active', true)
        .lte('starts_at', new Date().toISOString())
        .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
        .then(({ data }) => setMsgs(data ?? []))
    } catch {
      /* missing env vars during SSR or placeholder client */
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
