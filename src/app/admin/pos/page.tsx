'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { TOKEN_PRICING, CARD_MINIMUM } from '@/lib/constants'
import { cn, currency } from '@/lib/utils'
import { toast } from 'sonner'
import { CreditCard, Banknote, ShoppingCart, Receipt, Printer } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PaymentType } from '@/types/database'
import { generateTokenReceipt } from '@/lib/pdf/generate-pdf'
import { format } from 'date-fns'
import { QrScannerButton } from '@/components/admin/qr-scanner'

type SaleTab = 'packages' | 'custom'

export default function POSPage() {
  const { user, loading } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [tab, setTab] = useState<SaleTab>('packages')
  const [tierIndex, setTierIndex] = useState(0)
  const [customTokens, setCustomTokens] = useState(10)
  const [customPrice, setCustomPrice] = useState(5)
  const [paymentType, setPaymentType] = useState<PaymentType>('cash')
  const [submitting, setSubmitting] = useState(false)
  const [lookup, setLookup] = useState('')
  const [resolvedCustomerId, setResolvedCustomerId] = useState<string | null>(null)
  const [lookupBusy, setLookupBusy] = useState(false)
  const [lastSale, setLastSale] = useState<{
    transactionId: string
    amountPaid: number
    tokensGiven: number
    paymentType: PaymentType
    isBonus: boolean
    date: string
  } | null>(null)

  const selectedTier = TOKEN_PRICING[tierIndex]
  const amountPaid =
    tab === 'custom' ? customPrice : selectedTier.price
  const tokensGiven =
    tab === 'custom' ? customTokens : selectedTier.tokens

  const cardBelowMinimum =
    paymentType === 'card' && amountPaid < CARD_MINIMUM
  const canSubmit =
    Boolean(user) &&
      !submitting &&
      !cardBelowMinimum &&
      amountPaid >= 0 &&
      tokensGiven > 0 &&
      !(tab === 'custom' && (customTokens <= 0 || customPrice < 0))

  const lookupCustomer = async () => {
    const raw = lookup.trim()
    if (!raw) {
      setResolvedCustomerId(null)
      return
    }
    setLookupBusy(true)
    try {
      let qbuilder = supabase.from('profiles').select('id').eq('role', 'customer').limit(5)
      if (raw.includes('@')) {
        qbuilder = qbuilder.ilike('email', `%${raw}%`)
      } else {
        qbuilder = qbuilder.or(`email.eq.${raw},phone.eq.${raw}`)
      }
      const { data, error } = await qbuilder.maybeSingle()
      if (error) throw error
      setResolvedCustomerId(data?.id ?? null)
      if (!data) toast.message('No account found — transaction will stay walk-in.')
      else toast.success('Customer matched to this sale.')
    } catch {
      toast.error('Lookup failed.')
    } finally {
      setLookupBusy(false)
    }
  }

  /** Capture raw QR payload (matches pending_token_purchases.qr_payload) */
  const applyQrPrefill = (payload: string) => {
    const p = payload.trim()
    setLookup(p)
    toast.success('QR captured — confirm payment method, then tap Complete QR purchase.')
  }

  const handleSubmit = async (mode?: 'desk' | 'qr') => {
    if (!user) {
      toast.error('You must be signed in to record a sale.')
      return
    }
    if (mode !== 'qr' && cardBelowMinimum) {
      toast.error(
        `Card payments require a minimum of ${currency(CARD_MINIMUM)}. Use cash or choose a higher tier.`
      )
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'qr') {
        const qr = lookup.trim()
        if (!qr) {
          toast.error('Paste the scanned QR payload or use the scanner.')
          return
        }
        const { data, error } = await supabase.rpc('complete_pending_token_purchase', {
          p_qr_payload: qr,
          p_payment_type: paymentType,
        })
        if (error) {
          const msg =
            error.message.includes('Expired') ? 'This QR expired.' :
              error.message.includes('not pending') || error.message.includes('Invalid')
                ? error.message.replace('Forbidden', 'Could not complete purchase.')
                : error.message
          toast.error(msg)
          return
        }
        toast.success(`QR sale saved (transaction ${String(data).slice(0, 8)}…)`)
        setLookup('')
        setResolvedCustomerId(null)
        setPaymentType('cash')
        return
      }

      const { data, error } = await supabase
        .from('token_transactions')
        .insert({
          customer_id: resolvedCustomerId,
          employee_id: user.id,
          amount_paid: amountPaid,
          payment_type: paymentType,
          tokens_given: tokensGiven,
          is_loyalty_bonus: false,
        })
        .select('id, created_at')
        .single()

      if (error) {
        toast.error(error.message || 'Could not save sale.')
        return
      }

      const saleInfo = {
        transactionId: data.id,
        amountPaid,
        tokensGiven,
        paymentType,
        isBonus: false,
        date: format(new Date(data.created_at), 'MMM dd, yyyy h:mm a'),
      }
      setLastSale(saleInfo)

      toast.success(
        `Sale recorded: ${currency(amountPaid)} → ${tokensGiven} tokens (${paymentType})`,
        {
          action: {
            label: 'Print Receipt',
            onClick: () => downloadReceipt(saleInfo),
          },
        }
      )
      setTierIndex(0)
      setPaymentType('cash')
      setResolvedCustomerId(null)
      setLookup('')
    } finally {
      setSubmitting(false)
    }
  }

  const downloadReceipt = (sale: NonNullable<typeof lastSale>) => {
    try {
      const doc = generateTokenReceipt({
        transactionId: sale.transactionId,
        date: sale.date,
        items: [
          {
            tokens: sale.tokensGiven,
            amount: sale.amountPaid,
            isLoyalty: sale.isBonus,
          },
        ],
        totalAmount: sale.amountPaid,
        totalTokens: sale.tokensGiven,
        paymentType: sale.paymentType,
      })
      doc.save(`receipt-${sale.transactionId.slice(0, 8)}.pdf`)
      toast.success('Receipt downloaded!')
    } catch (err) {
      toast.error('Failed to generate receipt PDF.')
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
    <div className="space-y-8 max-w-2xl" data-tour="pos-shell">
      <section>
        <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-2 font-display">
          Token <span className="text-primary">POS</span>
        </h1>
        <p className="text-gray-500 max-w-xl text-lg font-medium">
          Record desk token sales or complete a customer&apos;s QR purchase.
        </p>
      </section>

      <Card className="border border-gray-100 bg-white shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4">
          <div className="flex flex-wrap gap-4 items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                <ShoppingCart className="size-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display font-black tracking-tight text-2xl">
                  New sale
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  Match a customer email or phone, or leave walk-in.
                </p>
              </div>
            </div>
            <div className="flex gap-2" data-tour="qr-scan">
              <QrScannerButton onDecode={applyQrPrefill} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 space-y-2">
            <Label htmlFor="lookup">Customer email or phone</Label>
            <div className="flex gap-2 flex-wrap">
              <Input
                id="lookup"
                value={lookup}
                onChange={(e) => {
                  setLookup(e.target.value)
                  setResolvedCustomerId(null)
                }}
                placeholder="customer@example.com"
                className="rounded-xl flex-1 min-w-[180px]"
              />
              <Button type="button" variant="secondary" disabled={lookupBusy || !lookup.trim()} onClick={lookupCustomer}>
                Lookup
              </Button>
              <Button type="button" variant="outline" onClick={() => { setLookup(''); setResolvedCustomerId(null) }}>
                Skip — walk-in
              </Button>
            </div>
            {resolvedCustomerId && (
              <p className="text-xs font-semibold text-emerald-700">Customer ID linked to this sale.</p>
            )}
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as SaleTab)}>
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted">
              <TabsTrigger value="packages" className="rounded-lg">
                Packages
              </TabsTrigger>
              <TabsTrigger value="custom" className="rounded-lg">
                Custom
              </TabsTrigger>
            </TabsList>
            <TabsContent value="packages" className="mt-4 space-y-3 pt-2">
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
            </TabsContent>
            <TabsContent value="custom" className="mt-4 space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
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
                    value={customPrice ?? ''}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Custom packages follow the same card minimum ({currency(CARD_MINIMUM)}) when charging a card.
              </p>
            </TabsContent>
          </Tabs>

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
                Card payments must be at least {currency(CARD_MINIMUM)}.
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

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              size="lg"
              className="w-full rounded-xl font-black tracking-tight text-base h-14 bg-primary hover:bg-primary/90"
              disabled={!canSubmit}
              onClick={() => handleSubmit('desk')}
            >
              {submitting ? 'Saving…' : 'Complete desk sale'}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="w-full rounded-xl font-black tracking-tight text-base h-14"
              disabled={submitting || !lookup.trim()}
              onClick={() => handleSubmit('qr')}
            >
              Complete QR purchase
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            After scanning a customer QR, paste the raw payload into the customer field or use lookup to confirm a match, then tap <strong>Complete QR purchase</strong>.
          </p>
        </CardContent>
      </Card>

      {lastSale && (
        <Card className="border border-green-200 bg-green-50/50 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-green-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-green-100">
                <Receipt className="size-6 text-green-700" />
              </div>
              <div className="flex-1">
                <CardTitle className="font-display font-black tracking-tight text-lg text-green-900">
                  Last sale receipt
                </CardTitle>
                <p className="text-sm text-green-700 font-medium mt-0.5">
                  {lastSale.date}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700 font-medium">Transaction</span>
              <code className="text-xs bg-green-100 px-2 py-0.5 rounded font-bold text-green-900">
                {lastSale.transactionId.slice(0, 8)}
              </code>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700 font-medium">Amount</span>
              <span className="font-black text-green-900">{currency(lastSale.amountPaid)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700 font-medium">Tokens</span>
              <Badge variant="secondary" className="font-black bg-green-100 text-green-900">
                {lastSale.tokensGiven}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700 font-medium">Payment</span>
              <span className="font-bold text-green-900 capitalize">{lastSale.paymentType}</span>
            </div>
            <div className="pt-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                className="flex-1 rounded-xl font-black bg-green-700 hover:bg-green-800 text-white"
                onClick={() => downloadReceipt(lastSale)}
              >
                <Printer className="mr-2 size-4" />
                Download receipt PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
