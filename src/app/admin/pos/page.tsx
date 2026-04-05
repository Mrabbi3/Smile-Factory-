'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { TOKEN_PRICING, CARD_MINIMUM, LOYALTY_DEAL } from '@/lib/constants'
import { cn, currency } from '@/lib/utils'
import { toast } from 'sonner'
import { CreditCard, Banknote, ShoppingCart, Sparkles } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { PaymentType } from '@/types/database'

type SaleMode = 'standard' | 'loyalty'

const LOYALTY_TOKEN_TOTAL =
  (LOYALTY_DEAL.price / 20) * TOKEN_PRICING.find((t) => t.price === 20)!.tokens +
  LOYALTY_DEAL.bonusTokens

export default function POSPage() {
  const { user, loading, isManager } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [mode, setMode] = useState<SaleMode>('standard')
  const [tierIndex, setTierIndex] = useState(0)
  const [paymentType, setPaymentType] = useState<PaymentType>('cash')
  const [submitting, setSubmitting] = useState(false)

  const selectedTier = TOKEN_PRICING[tierIndex]
  const amountPaid = mode === 'loyalty' ? LOYALTY_DEAL.price : selectedTier.price
  const tokensGiven = mode === 'loyalty' ? LOYALTY_TOKEN_TOTAL : selectedTier.tokens

  const cardBelowMinimum =
    paymentType === 'card' && amountPaid < CARD_MINIMUM
  const canSubmit =
    Boolean(user) && !submitting && !cardBelowMinimum

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be signed in to record a sale.')
      return
    }
    if (cardBelowMinimum) {
      toast.error(
        `Card payments require a minimum of ${currency(CARD_MINIMUM)}. Use cash or choose a higher tier.`
      )
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase.from('token_transactions').insert({
        customer_id: null,
        employee_id: user.id,
        amount_paid: amountPaid,
        payment_type: paymentType,
        tokens_given: tokensGiven,
        is_loyalty_bonus: mode === 'loyalty',
      })

      if (error) {
        console.error('POS insert error:', error)
        toast.error(error.message || 'Could not save sale.')
        return
      }

      toast.success(
        `Sale recorded: ${currency(amountPaid)} → ${tokensGiven} tokens (${paymentType})`
      )
      setMode('standard')
      setTierIndex(0)
      setPaymentType('cash')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 w-64 rounded-xl bg-gray-200" />
        <div className="h-96 rounded-2xl bg-gray-100 border border-gray-200/80" />
      </div>
    )
  }

  if (!user) {
    return (
      <Card className="max-w-lg border border-gray-100 bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="font-display font-black tracking-tight text-xl">
            Sign in required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Staff must be logged in to use the point of sale.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <section>
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2 font-display">
          Token <span className="text-primary">POS</span>
        </h1>
        <p className="text-gray-500 max-w-xl text-lg font-medium">
          Record token sales at the counter. Choose a package, payment method, and submit.
        </p>
      </section>

      <Card className="border border-gray-100 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
              <ShoppingCart className="size-6 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display font-black tracking-tight text-2xl">
                New sale
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                Ring up tokens for walk-in guests
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {isManager() && (
            <div className="space-y-3">
              <p className="text-[10px] uppercase font-black tracking-[0.15em] text-gray-400">
                Package type
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('standard')}
                  className={cn(
                    'rounded-xl border-2 p-4 text-left transition-all',
                    mode === 'standard'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  )}
                >
                  <span className="font-display font-black tracking-tight block">
                    Standard tiers
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    $1–$20 packages
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('loyalty')}
                  className={cn(
                    'rounded-xl border-2 p-4 text-left transition-all relative',
                    mode === 'loyalty'
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  )}
                >
                  <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-tight">
                    <Sparkles className="size-3 mr-1" />
                    Manager
                  </Badge>
                  <span className="font-display font-black tracking-tight block pr-16">
                    Loyalty bundle
                  </span>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {LOYALTY_DEAL.label}
                  </span>
                </button>
              </div>
            </div>
          )}

          {mode === 'standard' && (
            <div className="space-y-3">
              <p className="text-[10px] uppercase font-black tracking-[0.15em] text-gray-400">
                Pricing tier
              </p>
              <div className="grid grid-cols-2 gap-3">
                {TOKEN_PRICING.map((tier, i) => (
                  <button
                    key={tier.price}
                    type="button"
                    onClick={() => setTierIndex(i)}
                    className={cn(
                      'rounded-xl border-2 p-4 text-left transition-all',
                      tierIndex === i
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    )}
                  >
                    <span className="font-display font-black tracking-tight text-lg text-primary">
                      {currency(tier.price)}
                    </span>
                    <span className="block text-sm font-bold mt-1">{tier.tokens} tokens</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block leading-tight">
                      {tier.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'loyalty' && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
              <p className="font-display font-black tracking-tight text-lg">
                {currency(LOYALTY_DEAL.price)} bundle
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Customer receives{' '}
                <span className="font-bold text-foreground">{LOYALTY_TOKEN_TOTAL} tokens</span>{' '}
                (including {LOYALTY_DEAL.bonusTokens} bonus tokens).
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-[10px] uppercase font-black tracking-[0.15em] text-gray-400">
              Payment method
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentType('cash')}
                className={cn(
                  'rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all',
                  paymentType === 'cash'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                )}
              >
                <Banknote className="size-8 text-primary" />
                <span className="font-black text-sm tracking-tight">Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('card')}
                className={cn(
                  'rounded-xl border-2 p-4 flex flex-col items-center gap-2 transition-all',
                  paymentType === 'card'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                )}
              >
                <CreditCard className="size-8 text-primary" />
                <span className="font-black text-sm tracking-tight">Card</span>
              </button>
            </div>
          </div>

          {cardBelowMinimum && (
            <div
              role="alert"
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            >
              <p className="font-black font-display tracking-tight">Card minimum</p>
              <p className="mt-1">
                Card payments must be at least {currency(CARD_MINIMUM)}. This sale is{' '}
                {currency(amountPaid)}. Switch to cash or add a larger package.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Total due</span>
              <span className="text-2xl font-black font-display tracking-tight">
                {currency(amountPaid)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Tokens to issue</span>
              <Badge variant="secondary" className="text-base font-black px-3 py-1">
                {tokensGiven}
              </Badge>
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full rounded-xl font-black tracking-tight text-base h-14 bg-primary hover:bg-primary/90"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting ? 'Saving…' : 'Complete sale'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
