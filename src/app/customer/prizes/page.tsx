'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import type { Prize } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export default function CustomerPrizesPage() {
  const { user } = useAuth()
  const sb = createClient()
  const [items, setItems] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    sb.from('prizes').select('*').eq('is_active', true).order('name').then(({ data }) => {
      setItems((data as Prize[]) ?? [])
      setLoading(false)
    })
  }, [sb])

  const redeem = async (pid: string) => {
    if (!user) {
      toast.error('Please sign in.')
      return
    }
    setBusyId(pid)
    try {
      const { data, error } = await sb.rpc('redeem_prize', { p_customer_id: user.id, p_prize_id: pid })
      if (error) {
        toast.error(error.message.includes('Insufficient') ? 'Not enough prize tickets.' : error.message)
        return
      }
      toast.success(`Redeemed! Ref ${String(data).slice(0, 8)}…`)
      sb.from('prizes').select('*').eq('is_active', true).order('name').then(({ data: d }) => setItems((d as Prize[]) ?? []))
      sb.from('customer_tickets').select('ticket_count').eq('customer_id', user.id).maybeSingle().then(({ data: tk }) =>
        tk && typeof tk.ticket_count === 'number' ? tk.ticket_count : null
      )
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div>

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">Prize counter</h1>
      <p className="text-muted-foreground text-sm">Redemptions use prize tickets tracked on your account.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((p) => (
          <Card key={p.id} className="overflow-hidden rounded-2xl">
            <CardHeader className="flex-row items-start gap-4">
              {p.image_url && (
                <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.image_url} alt="" className="absolute inset-0 size-full object-cover" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg">{p.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="outline">{p.ticket_cost} tickets</Badge>
                  <Badge variant={p.stock_quantity > 0 ? 'secondary' : 'destructive'}>
                    Stock {p.stock_quantity}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full rounded-xl"
                disabled={busyId === p.id || p.stock_quantity <= 0}
                onClick={() => void redeem(p.id)}
              >
                Redeem
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
