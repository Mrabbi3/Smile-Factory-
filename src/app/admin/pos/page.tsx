'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { TOKEN_PRICING, LOYALTY_DEAL, CARD_MINIMUM } from '@/lib/constants'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { safeFormatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Coins, CreditCard, Banknote, ShoppingCart, Check,
  RotateCcw, Star, AlertTriangle, Mail, Download, Loader2
} from 'lucide-react'
import { generateTokenReceipt } from '@/lib/pdf/generate-pdf'

const currency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

interface CartItem {
  price: number
  tokens: number
  isLoyalty: boolean
}

interface CompletedSale {
  transactionId: string
  items: CartItem[]
  totalAmount: number
  totalTokens: number
  paymentType: 'cash' | 'card'
  date: string
}

export default function POSPage() {
  const { user, profile, isManager } = useAuth()
  const supabase = createClient()
  const [paymentType, setPaymentType] = useState<'cash' | 'card'>('cash')
  const [cart, setCart] = useState<CartItem[]>([])
  const [processing, setProcessing] = useState(false)
  const [recentTx, setRecentTx] = useState<any[]>([])
  const [lastSale, setLastSale] = useState<CompletedSale | null>(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [receiptEmail, setReceiptEmail] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)

  const totalAmount = cart.reduce((s, i) => s + i.price, 0)
  const totalTokens = cart.reduce((s, i) => s + i.tokens, 0)

  useEffect(() => {
    loadRecent()
  }, [])

  const loadRecent = async () => {
    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) console.error('Load recent error:', error)
      setRecentTx(data || [])
    } catch (err) {
      console.error('Load recent error:', err)
    }
  }

  const addToCart = (price: number, tokens: number, isLoyalty = false) => {
    if (paymentType === 'card' && (totalAmount + price) < CARD_MINIMUM && !isLoyalty) {
      if (price < CARD_MINIMUM) {
        toast.warning(`Card minimum is $${CARD_MINIMUM}. Add more items or switch to cash.`)
      }
    }
    setCart([...cart, { price, tokens, isLoyalty }])
  }

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const clearCart = () => setCart([])

  const completeSale = async () => {
    if (cart.length === 0) return
    if (!user?.id) {
      toast.error('You must be logged in to complete a sale')
      return
    }
    if (paymentType === 'card' && totalAmount < CARD_MINIMUM) {
      toast.error(`Card minimum is $${CARD_MINIMUM}. Current total: ${currency(totalAmount)}`)
      return
    }

    setProcessing(true)
    try {
      const transactions = cart.map((item) => ({
        employee_id: user?.id,
        amount_paid: item.price,
        payment_type: paymentType,
        tokens_given: item.tokens,
        is_loyalty_bonus: item.isLoyalty,
      }))

      const { data: inserted, error } = await supabase
        .from('token_transactions')
        .insert(transactions)
        .select('id')
      if (error) throw error

      setLastSale({
        transactionId: inserted?.[0]?.id || crypto.randomUUID(),
        items: [...cart],
        totalAmount,
        totalTokens,
        paymentType,
        date: format(new Date(), 'MMMM dd, yyyy h:mm a'),
      })
      toast.success(`Sale completed! ${currency(totalAmount)} — ${totalTokens} tokens`)
      clearCart()
      loadRecent()
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete sale')
    } finally {
      setProcessing(false)
    }
  }

  const downloadReceipt = () => {
    if (!lastSale) return
    const doc = generateTokenReceipt({
      transactionId: lastSale.transactionId,
      date: lastSale.date,
      items: lastSale.items.map((i) => ({ tokens: i.tokens, amount: i.price, isLoyalty: i.isLoyalty })),
      totalAmount: lastSale.totalAmount,
      totalTokens: lastSale.totalTokens,
      paymentType: lastSale.paymentType,
    })
    doc.save(`receipt-${lastSale.transactionId.slice(0, 8)}.pdf`)
  }

  const emailReceipt = async () => {
    if (!lastSale || !receiptEmail) return
    setSendingEmail(true)
    try {
      const doc = generateTokenReceipt({
        transactionId: lastSale.transactionId,
        date: lastSale.date,
        items: lastSale.items.map((i) => ({ tokens: i.tokens, amount: i.price, isLoyalty: i.isLoyalty })),
        totalAmount: lastSale.totalAmount,
        totalTokens: lastSale.totalTokens,
        paymentType: lastSale.paymentType,
      })
      const pdfBase64 = doc.output('datauristring').split(',')[1]

      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'token-receipt',
          to: receiptEmail,
          data: {
            transactionId: lastSale.transactionId,
            date: lastSale.date,
            items: lastSale.items.map((i) => ({ tokens: i.tokens, amount: i.price, isLoyalty: i.isLoyalty })),
            totalAmount: lastSale.totalAmount,
            totalTokens: lastSale.totalTokens,
            paymentType: lastSale.paymentType,
          },
          pdfBase64,
          pdfFilename: `receipt-${lastSale.transactionId.slice(0, 8)}.pdf`,
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Failed to send')
      }

      toast.success(`Receipt emailed to ${receiptEmail}`)
      setEmailDialogOpen(false)
      setReceiptEmail('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to email receipt')
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Point of Sale</h1>
        <p className="text-muted-foreground">Quick token sales terminal</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Payment Type Toggle */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-2">
                <Button
                  variant={paymentType === 'cash' ? 'default' : 'outline'}
                  className="flex-1 h-14 text-lg"
                  onClick={() => setPaymentType('cash')}
                >
                  <Banknote className="mr-2 h-5 w-5" />
                  Cash
                </Button>
                <Button
                  variant={paymentType === 'card' ? 'default' : 'outline'}
                  className="flex-1 h-14 text-lg"
                  onClick={() => setPaymentType('card')}
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Card
                </Button>
              </div>
              {paymentType === 'card' && (
                <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  ${CARD_MINIMUM} minimum for card payments
                </p>
              )}
            </CardContent>
          </Card>

          {/* Token Tier Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Token Packages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {TOKEN_PRICING.map((tier) => {
                  const disabled = paymentType === 'card' && tier.price < CARD_MINIMUM && totalAmount + tier.price < CARD_MINIMUM
                  return (
                    <Button
                      key={tier.price}
                      variant="outline"
                      className="h-24 flex-col gap-1 text-lg border-2 hover:border-primary hover:bg-primary/5 transition-all"
                      disabled={disabled}
                      onClick={() => addToCart(tier.price, tier.tokens)}
                    >
                      <span className="text-2xl font-bold">${tier.price}</span>
                      <span className="text-sm text-muted-foreground">{tier.tokens} Tokens</span>
                    </Button>
                  )
                })}
              </div>

              {isManager() && (
                <>
                  <Separator className="my-4" />
                  <Button
                    variant="outline"
                    className="w-full h-16 border-2 border-yellow-400 bg-yellow-50 hover:bg-yellow-100 text-yellow-800"
                    onClick={() => addToCart(LOYALTY_DEAL.price, 66 + LOYALTY_DEAL.bonusTokens, true)}
                  >
                    <Star className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-bold">${LOYALTY_DEAL.price} Loyalty Deal</div>
                      <div className="text-xs">66 + {LOYALTY_DEAL.bonusTokens} bonus tokens</div>
                    </div>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart / Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Current Sale
                </span>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart}>
                    <RotateCcw className="h-4 w-4 mr-1" /> Clear
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Tap a token package to start a sale</p>
              ) : (
                <div className="space-y-2">
                  {cart.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <span className="font-medium">{currency(item.price)}</span>
                        <span className="text-sm text-muted-foreground ml-2">({item.tokens} tokens)</span>
                        {item.isLoyalty && <Badge className="ml-2 bg-yellow-500 text-xs">Loyalty</Badge>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeFromCart(i)}>×</Button>
                    </div>
                  ))}
                </div>
              )}

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{currency(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tokens</span>
                  <span>{totalTokens}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment</span>
                  <Badge variant="outline">{paymentType}</Badge>
                </div>
              </div>

              <Button
                className="w-full mt-4 h-14 text-lg"
                disabled={cart.length === 0 || processing}
                onClick={completeSale}
              >
                <Check className="mr-2 h-5 w-5" />
                {processing ? 'Processing...' : 'Complete Sale'}
              </Button>

              {lastSale && cart.length === 0 && (
                <>
                  <Separator className="my-4" />
                  <p className="text-xs text-muted-foreground text-center mb-2">Last sale: {currency(lastSale.totalAmount)} — {lastSale.totalTokens} tokens</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" size="sm" onClick={downloadReceipt}>
                      <Download className="mr-1 h-4 w-4" />
                      Receipt PDF
                    </Button>
                    <Button variant="outline" className="flex-1" size="sm" onClick={() => setEmailDialogOpen(true)}>
                      <Mail className="mr-1 h-4 w-4" />
                      Email Receipt
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTx.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">No sales yet today</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentTx.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                      <div>
                        <span className="font-medium">{currency(tx.amount_paid)}</span>
                        <span className="text-muted-foreground ml-1">· {tx.tokens_given}t</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{tx.payment_type}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {safeFormatDate(tx.created_at, 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Email Receipt</DialogTitle>
            <DialogDescription>
              Send the token purchase receipt to the customer&apos;s email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="receiptEmail">Customer Email</Label>
              <Input
                id="receiptEmail"
                type="email"
                placeholder="customer@example.com"
                value={receiptEmail}
                onChange={(e) => setReceiptEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
            <Button onClick={emailReceipt} disabled={!receiptEmail || sendingEmail}>
              {sendingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              {sendingEmail ? 'Sending...' : 'Send Receipt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
