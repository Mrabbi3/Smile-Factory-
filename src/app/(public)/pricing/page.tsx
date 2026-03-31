import type { Metadata } from 'next'
import Link from 'next/link'
import { Coins, ArrowRight, Info, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
      <section className="py-24 sm:py-28 pattern-industrial">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-primary to-[var(--primary-container)] bg-clip-text text-transparent">
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
      <section className="bg-[var(--surface-container-low)] py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TOKEN_PRICING.map((tier) => {
              const isBestValue = tier.price === 20
              const tokensPerDollar = tier.tokens / tier.price
              return (
                <Card
                  key={tier.price}
                  className={`relative overflow-hidden text-center transition-all duration-300 hover:-translate-y-1 ${
                    isBestValue
                      ? 'scale-105 gradient-primary text-primary-foreground shadow-elevated'
                      : 'hover:shadow-elevated'
                  }`}
                >
                  {isBestValue && (
                    <div className="absolute left-0 right-0 top-0 bg-white/20 backdrop-blur-sm py-1.5 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                      Best Value
                    </div>
                  )}
                  <CardContent className={`flex flex-col items-center gap-4 pb-8 ${isBestValue ? 'pt-12' : 'pt-10'}`}>
                    <div
                      className={`flex size-16 items-center justify-center rounded-full ${
                        isBestValue
                          ? 'bg-white/20'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      <Coins className="size-8" />
                    </div>
                    <div className={`font-display text-5xl font-extrabold ${isBestValue ? '' : 'text-primary'}`}>
                      ${tier.price}
                    </div>
                    <div className={`text-3xl font-bold ${isBestValue ? 'text-primary-foreground/90' : ''}`}>
                      {tier.tokens} Tokens
                    </div>
                    <p className={`text-sm ${isBestValue ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {tokensPerDollar.toFixed(1)} tokens per dollar
                    </p>
                    {isBestValue && (
                      <Badge className="bg-white/20 text-primary-foreground border-0 mt-1 text-sm">
                        Save 10%!
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
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
                <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full gradient-primary text-lg font-bold text-primary-foreground shadow-ambient">
                  {item.step}
                </div>
                <h3 className="font-display text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Box */}
      <section className="pb-24 sm:pb-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Info className="size-4" />
                </div>
                Good to Know
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  Tokens are available for purchase at the front counter
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  Most games cost 1–3 tokens per play
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  Unused tokens never expire — use them on your next visit
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  Birthday party packages include tokens — check our parties page for details
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-primary py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
            Planning a Party?
          </h2>
          <p className="mt-5 text-lg text-primary-foreground/85">
            Our birthday party packages include tokens, pizza, drinks, and a private party room.
          </p>
          <Button asChild size="lg" className="mt-10 bg-white text-primary hover:bg-white/90 rounded-full shadow-elevated">
            <Link href="/parties">
              <PartyPopper className="size-5" />
              View Party Packages
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
