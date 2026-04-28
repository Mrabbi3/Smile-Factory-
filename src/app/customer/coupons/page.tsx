'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Row = { id: string; coupons: { code: string; description: string; valid_until: string }; redeemed_at: string | null }

export default function CustomerCouponsPage() {
  const { user } = useAuth()
  const sb = createClient()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    sb.from('coupon_assignments')
      .select('id, redeemed_at, coupons ( code, description, valid_until )')
      .eq('customer_id', user.id)
      .order('sent_at', { ascending: false })
      .then(({ data }) => {
        const mapped: Row[] = []
        for (const raw of data ?? []) {
          const obj = raw as Record<string, unknown>
          const c = obj.coupons
          const cp = Array.isArray(c) ? c[0] : c
          if (!cp || typeof cp !== 'object') continue
          const coupon = cp as { code: string; description: string; valid_until: string }
          mapped.push({
            id: String(obj.id),
            redeemed_at: (obj.redeemed_at as string | null) ?? null,
            coupons: coupon,
          })
        }
        setRows(mapped)
        setLoading(false)
      })
  }, [sb, user])

  if (!user) return <Card><CardHeader><CardTitle>Sign in</CardTitle></CardHeader></Card>
  if (loading) return <Skeleton className="h-48" />

  const pending = rows.filter((r) => !r.redeemed_at)

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">My coupons</h1>
      {pending.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No active coupons assigned to your account.<br />
            Ask staff — they&apos;ll send coupons to your registered email.<br /><br /><Link href="/customer/buy-tokens"><Button variant="outline" className="rounded-xl">Buy tokens</Button></Link></CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {pending.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle>{r.coupons.code}</CardTitle>
                <CardDescription>{r.coupons.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Valid until {new Date(r.coupons.valid_until).toLocaleDateString()} · redeem at checkout for token buys or bookings.
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
