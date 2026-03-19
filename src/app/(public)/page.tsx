import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Gamepad2,
  PartyPopper,
  Trophy,
  Star,
  ChevronRight,
  Coins,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BUSINESS_INFO, TOKEN_PRICING } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Home | The Smile Factory',
  description:
    'Welcome to The Smile Factory — Brigantine\'s favorite family arcade since 2006. Over 41 games, birthday parties, prizes, and fun for all ages!',
}

const features = [
  {
    icon: Gamepad2,
    title: `${BUSINESS_INFO.machineCount}+ Games`,
    description: 'From classic favorites to the latest arcade hits — something for every age.',
  },
  {
    icon: PartyPopper,
    title: 'Birthday Parties',
    description: 'Private party room, pizza, drinks, tokens, and 2 hours of non-stop fun.',
  },
  {
    icon: Trophy,
    title: 'Prize Counter',
    description: 'Win tickets and redeem them for awesome prizes at our prize counter.',
  },
  {
    icon: Users,
    title: 'Family Fun',
    description: 'A safe, clean, and welcoming space where families make memories together.',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 sm:py-28 lg:py-36">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-sm">
              <Star className="size-3.5 fill-primary text-primary" />
              Family Fun Since {BUSINESS_INFO.established}
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                The Smile Factory!
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Brigantine&apos;s favorite arcade and family fun center. With over{' '}
              {BUSINESS_INFO.machineCount} games, birthday party packages, and a prize counter
              bursting with rewards — smiles are guaranteed!
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/pricing">
                  <Coins className="size-5" />
                  View Pricing
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/parties">
                  <PartyPopper className="size-5" />
                  Book a Party
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Families Love Us
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need for an unforgettable day of fun, all under one roof.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-0 bg-gradient-to-b from-card to-muted/30 shadow-md transition-shadow hover:shadow-lg"
              >
                <CardContent className="pt-6">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-7xl" />

      {/* Token Pricing */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Token Pricing</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Grab your tokens and start playing! The more you buy, the more you save.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TOKEN_PRICING.map((tier) => {
              const isBestValue = tier.price === 20
              return (
                <Card
                  key={tier.price}
                  className={`relative overflow-hidden text-center transition-shadow hover:shadow-lg ${
                    isBestValue
                      ? 'border-primary/50 shadow-lg shadow-primary/10 ring-2 ring-primary/20'
                      : ''
                  }`}
                >
                  {isBestValue && (
                    <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Best Value
                    </div>
                  )}
                  <CardContent className="flex flex-col items-center gap-3 pt-8 pb-6">
                    <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Coins className="size-7" />
                    </div>
                    <div className="text-4xl font-extrabold text-primary">${tier.price}</div>
                    <div className="text-2xl font-bold">{tier.tokens} Tokens</div>
                    {isBestValue && (
                      <Badge className="mt-1">10% Savings!</Badge>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">
                See Full Pricing Details
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-muted/40 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Star className="mx-auto mb-4 size-8 fill-primary text-primary" />
          <blockquote className="text-xl font-medium italic leading-relaxed text-foreground sm:text-2xl">
            &ldquo;My kids absolutely love The Smile Factory! The arcade is clean, the staff is
            friendly, and the birthday party we had there was the best one yet. We&apos;ll
            definitely be back!&rdquo;
          </blockquote>
          <p className="mt-6 font-semibold text-muted-foreground">&mdash; A Happy Brigantine Family</p>
          <div className="mt-2 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-5 fill-primary text-primary" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 py-16 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.15),transparent)]" />
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to Celebrate?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/90">
            Book a birthday party at The Smile Factory and give your child a celebration
            they&apos;ll never forget. Private room, pizza, drinks, tokens, and two hours of
            arcade fun!
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto"
            >
              <Link href="/parties">
                <PartyPopper className="size-5" />
                Book a Party
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
            >
              <Link href="/contact">
                Contact Us
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
