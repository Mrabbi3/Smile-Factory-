import type { Metadata } from 'next'
import Link from 'next/link'
import { Coins, ChevronRight, Info, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TOKEN_PRICING, BUSINESS_INFO } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Token Pricing',
  description:
    'Token pricing at The Smile Factory arcade. Buy tokens to play over 41 arcade games — the more you buy, the more you save!',
}

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Token Pricing
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Grab your tokens and hit the arcade floor! We offer simple, straightforward
              pricing — and the more you buy, the more you save.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TOKEN_PRICING.map((tier) => {
              const isBestValue = tier.price === 20
              const tokensPerDollar = tier.tokens / tier.price
              return (
                <Card
                  key={tier.price}
                  className={`relative overflow-hidden text-center transition-all hover:shadow-lg ${
                    isBestValue
                      ? 'scale-105 border-primary/50 shadow-xl shadow-primary/10 ring-2 ring-primary/20'
                      : 'shadow-md'
                  }`}
                >
                  {isBestValue && (
                    <div className="absolute left-0 right-0 top-0 bg-primary py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                      Best Value
                    </div>
                  )}
                  <CardContent className={`flex flex-col items-center gap-4 pb-8 ${isBestValue ? 'pt-12' : 'pt-8'}`}>
                    <div
                      className={`flex size-16 items-center justify-center rounded-full ${
                        isBestValue
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <Coins className="size-8" />
                    </div>
                    <div>
                      <div className="text-5xl font-extrabold text-primary">${tier.price}</div>
                    </div>
                    <div className="text-3xl font-bold">{tier.tokens} Tokens</div>
                    <p className="text-sm text-muted-foreground">
                      {tokensPerDollar.toFixed(1)} tokens per dollar
                    </p>
                    {isBestValue && (
                      <Badge className="mt-1 text-sm">Save 10%!</Badge>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-5xl" />

      {/* How It Works */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Buy Tokens',
                desc: 'Purchase tokens at the counter. Cash and card accepted.',
              },
              {
                step: '2',
                title: 'Play Games',
                desc: `Insert tokens into any of our ${BUSINESS_INFO.machineCount}+ arcade machines and play!`,
              },
              {
                step: '3',
                title: 'Win Prizes',
                desc: 'Collect tickets and redeem them for awesome prizes at our counter.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Box */}
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="size-5 text-primary" />
                Good to Know
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Tokens are available for purchase at the front counter</li>
                <li>• Most games cost 1–3 tokens per play</li>
                <li>• Unused tokens never expire — use them on your next visit</li>
                <li>• Birthday party packages include tokens — check our parties page for details</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Planning a Party?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/90">
            Our birthday party packages include tokens, pizza, drinks, and a private party room.
          </p>
          <Button asChild variant="secondary" size="lg" className="mt-8">
            <Link href="/parties">
              <PartyPopper className="size-5" />
              View Party Packages
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
