'use client'

import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { TOKEN_PRICING } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { currency } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

type PricingRow = { price: number; tokens: number; label: string }

export default function CustomerBuyTokensPage() {
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [tierIndex, setTierIndex] = useState(0)
  const [customTokens, setCustomTokens] = useState<number>(30)
  const [customCents, setCustomCents] = useState<number>(1000)
  const [tab, setTab] = useState<'packages' | 'custom'>('packages')
  const [loading, setLoading] = useState(false)
  const [pendingPayload, setPendingPayload] = useState<string | null>(null)
  const [pricing, setPricing] = useState<PricingRow[]>(() =>
    TOKEN_PRICING.map((t) => ({ price: t.price, tokens: t.tokens, label: t.label }))
  )

  useEffect(() => {
    supabase
      .from('token_pricing')
      .select('price, token_count')
      .eq('is_active', true)
      .order('price')
      .then(({ data }) => {
        if (data?.length)
          setPricing(
            data.map((r) => ({
              price: Number(r.price),
              tokens: Number(r.token_count),
              label: `$${Number(r.price)} = ${Number(r.token_count)} tokens`,
            }))
          )
      })
  }, [supabase])

  const selected =
    tab === 'custom'
      ? { tokens: customTokens, price_cents: customCents }
      : {
          tokens: pricing[tierIndex]?.tokens ?? 0,
          price_cents: Math.round((pricing[tierIndex]?.price ?? 0) * 100),
        }

  const createPending = async () => {
    if (!user) {
      toast.error('Please sign in to create a QR purchase.')
      return
    }
    if (!selected.tokens || selected.price_cents < 0) {
      toast.error('Enter tokens and amount.')
      return
    }
    const payload = crypto.randomUUID()
    setLoading(true)
    try {
      const { error } = await supabase.from('pending_token_purchases').insert({
        customer_id: user.id,
        token_count: selected.tokens,
        price_cents: selected.price_cents,
        qr_payload: payload,
      })
      if (error) throw error
      setPendingPayload(payload)
      toast.success('Show this QR at the counter to pay.')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not start purchase.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card className="max-w-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Sign in required</CardTitle>
          <CardDescription>
            <Link href="/login?redirect=/customer/buy-tokens" className="text-primary font-semibold underline">
              Sign in
            </Link>{' '}
            to create a pay-at-counter QR code.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-8 max-w-lg">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Buy tokens (pay at desk)</h1>
        <p className="text-muted-foreground mt-1">
          Choose an amount — we&apos;ll generate a QR for staff to scan and finalize payment at the arcade.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="flex-row flex-wrap gap-2">
          <Button type="button" variant={tab === 'packages' ? 'default' : 'outline'} onClick={() => setTab('packages')}>
            Packages
          </Button>
          <Button type="button" variant={tab === 'custom' ? 'default' : 'outline'} onClick={() => setTab('custom')}>
            Custom amount
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {tab === 'packages' && (
            <div className="grid grid-cols-2 gap-2">
              {pricing.map((p, i) => (
                <button
                  key={p.price}
                  type="button"
                  className={`rounded-xl border-2 p-3 text-left text-sm ${tierIndex === i ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => setTierIndex(i)}
                >
                  <div className="font-bold">{currency(p.price)}</div>
                  <div className="text-muted-foreground">{p.tokens} tokens</div>
                </button>
              ))}
            </div>
          )}
          {tab === 'custom' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tokens</Label>
                <Input
                  type="number"
                  min={1}
                  value={customTokens || ''}
                  onChange={(e) => setCustomTokens(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Price (USD)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={customCents / 100 || ''}
                  onChange={(e) => setCustomCents(Math.round(Number(e.target.value) * 100))}
                />
              </div>
            </div>
          )}

          <Button className="w-full rounded-xl" size="lg" onClick={() => void createPending()} disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Generate QR
          </Button>
        </CardContent>
      </Card>

      {pendingPayload && (
        <Card className="rounded-2xl border-primary/40">
          <CardHeader>
            <CardTitle>Present at checkout</CardTitle>
            <CardDescription>Show this QR to a Smile Factory team member · valid ~30 minutes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="rounded-2xl bg-white p-4 shadow-inner">
              <QRCodeSVG value={pendingPayload} size={220} />
            </div>
            <div className="text-center font-mono text-xs break-all text-muted-foreground max-w-[320px]">
              Code: <span className="text-foreground">{pendingPayload}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
