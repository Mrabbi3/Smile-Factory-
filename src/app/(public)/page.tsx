import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Gamepad2,
  PartyPopper,
  Trophy,
  Star,
  ArrowRight,
  Coins,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
        {/* Subtle industrial pattern background */}
        <div className="absolute inset-0 -z-10 pattern-industrial" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-primary/8" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-8 gap-2 px-4 py-1.5 text-sm">
              <Star className="size-3.5 fill-primary text-primary" />
              Family Fun Since {BUSINESS_INFO.established}
            </Badge>

            {/* Display-lg: monumental typography */}
            <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary to-[var(--primary-container)] bg-clip-text text-transparent">
                The Smile Factory!
              </span>
            </h1>

            <p className="mt-8 text-lg leading-relaxed text-muted-foreground sm:text-xl max-w-2xl mx-auto">
              Brigantine&apos;s favorite arcade and family fun center. With over{' '}
              {BUSINESS_INFO.machineCount} games, birthday party packages, and a prize counter
              bursting with rewards — smiles are guaranteed!
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto text-base">
                <Link href="/pricing">
                  <Coins className="size-5" />
                  View Pricing
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-base">
                <Link href="/parties">
                  <PartyPopper className="size-5" />
                  Book a Party
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 sm:py-28 bg-[var(--surface-container-low)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Why Families Love Us
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Everything you need for an unforgettable day of fun, all under one roof.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1"
              >
                <CardContent className="pt-6">
                  <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:gradient-primary group-hover:text-primary-foreground group-hover:shadow-ambient">
                    <feature.icon className="size-7" />
                  </div>
                  <h3 className="font-display text-lg font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Token Pricing ── */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Token Pricing
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Grab your tokens and start playing! The more you buy, the more you save.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TOKEN_PRICING.map((tier) => {
              const isBestValue = tier.price === 20
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
                    <div className="absolute right-0 top-0 rounded-bl-2xl bg-white/20 backdrop-blur-sm px-4 py-1.5 text-xs font-bold text-primary-foreground">
                      Best Value
                    </div>
                  )}
                  <CardContent className="flex flex-col items-center gap-4 pt-10 pb-8">
                    <div className={`flex size-16 items-center justify-center rounded-full ${
                      isBestValue ? 'bg-white/20' : 'bg-primary/10 text-primary'
                    }`}>
                      <Coins className="size-8" />
                    </div>
                    <div className={`font-display text-5xl font-extrabold ${isBestValue ? '' : 'text-primary'}`}>
                      ${tier.price}
                    </div>
                    <div className={`text-2xl font-bold ${isBestValue ? 'text-primary-foreground/90' : ''}`}>
                      {tier.tokens} Tokens
                    </div>
                    {isBestValue && (
                      <Badge className="bg-white/20 text-primary-foreground border-0 mt-1">
                        Most Popular
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <div className="mt-12 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">
                See Full Pricing Details
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="py-24 sm:py-28 bg-[var(--surface-container-low)] pattern-industrial">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Star className="size-8 fill-primary" />
          </div>
          <blockquote className="font-display text-2xl font-medium leading-relaxed text-foreground sm:text-3xl">
            &ldquo;My kids absolutely love The Smile Factory! The arcade is clean, the staff is
            friendly, and the birthday party we had there was the best one yet. We&apos;ll
            definitely be back!&rdquo;
          </blockquote>
          <p className="mt-8 font-semibold text-muted-foreground">&mdash; A Happy Brigantine Family</p>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-5 fill-primary text-primary" />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative overflow-hidden gradient-primary py-20 sm:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent)]" />
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
            Ready to Celebrate?
          </h2>
          <p className="mt-6 text-lg text-primary-foreground/85 max-w-2xl mx-auto">
            Book a birthday party at The Smile Factory and give your child a celebration
            they&apos;ll never forget. Private room, pizza, drinks, tokens, and two hours of
            arcade fun!
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 rounded-full shadow-elevated text-base"
            >
              <Link href="/parties">
                <PartyPopper className="size-5" />
                Book a Party
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="w-full text-primary-foreground hover:bg-white/15 hover:text-primary-foreground sm:w-auto text-base rounded-full"
            >
              <Link href="/contact">
                Contact Us
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
