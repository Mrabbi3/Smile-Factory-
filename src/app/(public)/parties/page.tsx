import type { Metadata } from 'next'
import Link from 'next/link'
import {
  PartyPopper,
  Users,
  Clock,
  ArrowRight,
  Phone,
  Pizza,
  Coins,
  Gift,
  Star,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BUSINESS_INFO, PARTY_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Birthday Parties',
  description:
    'Celebrate your child\'s birthday at The Smile Factory! Our all-inclusive party packages include a private room, pizza, drinks, tokens, and 2 hours of arcade fun.',
}

const included = [
  { icon: Clock, label: '2 Hours in Private Party Room' },
  { icon: Pizza, label: 'Pizza for All Kids' },
  { icon: Users, label: 'Drinks for All Kids' },
  { icon: Coins, label: 'Tokens for Every Child' },
  { icon: Gift, label: 'Special Gift for Birthday Child' },
  { icon: PartyPopper, label: 'Party Setup & Cleanup' },
]

export default function PartiesPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-24 sm:py-28 pattern-industrial">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-8 gap-2 px-4 py-1.5 text-sm">
              <PartyPopper className="size-3.5 text-primary" />
              Unforgettable Celebrations
            </Badge>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-primary to-[var(--primary-container)] bg-clip-text text-transparent">
                Birthday Parties
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
              Give your child a birthday they&apos;ll never forget! Our all-inclusive party
              packages make planning easy and celebration even easier.
            </p>
          </div>
        </div>
      </section>

      {/* Classic Package */}
      <section className="bg-[var(--surface-container-low)] py-24 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-5">
            <Card className="overflow-hidden shadow-elevated lg:col-span-3">
              <div className="gradient-primary px-6 py-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-primary-foreground">Classic Package</h2>
                  <Badge className="bg-white/20 text-primary-foreground border-0 text-sm font-bold">
                    Most Popular
                  </Badge>
                </div>
              </div>
              <CardContent className="pt-8">
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-extrabold text-primary">$400</span>
                  <span className="text-muted-foreground">for up to 12 children</span>
                </div>

                <h3 className="mb-4 font-display font-bold">What&apos;s Included:</h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {included.map((item) => (
                    <li key={item.label} className="flex items-center gap-3 text-sm">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <item.icon className="size-4" />
                      </div>
                      {item.label}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Button asChild size="lg" className="flex-1">
                    <Link href="/customer/bookings">
                      <PartyPopper className="size-5" />
                      Book Now
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/contact">
                      <Phone className="size-4" />
                      Contact Us
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add-Ons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-[var(--surface-container-low)] px-4 py-3">
                    <div>
                      <p className="font-medium">Additional Child</p>
                      <p className="text-sm text-muted-foreground">
                        Includes food, drink &amp; tokens
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-base font-bold">
                      $14.95
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-[var(--surface-container-low)] px-4 py-3">
                    <div>
                      <p className="font-medium">Additional Pizza</p>
                      <p className="text-sm text-muted-foreground">Large cheese or pepperoni</p>
                    </div>
                    <Badge variant="secondary" className="text-base font-bold">
                      $12.00
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Party Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock className="size-4" />
                    </div>
                    <span>
                      {PARTY_CONFIG.durationMinutes / 60} hours in private party room
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users className="size-4" />
                    </div>
                    <span>Up to 12 children included</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Coins className="size-4" />
                    </div>
                    <span>${PARTY_CONFIG.depositAmount} deposit required to book</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Star className="size-4" />
                    </div>
                    <span>
                      Available {BUSINESS_INFO.hours.weekend.split(' - ')[0]} &ndash;{' '}
                      {BUSINESS_INFO.hours.weekend.split(' - ')[1]}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Large Party Notice */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="bg-amber-50/80 dark:bg-amber-900/20">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/40">
                <Info className="size-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-amber-900 dark:text-amber-400">
                  Parties Over {PARTY_CONFIG.maxKidsBeforeCall} Children
                </h3>
                <p className="mt-1 text-sm text-amber-800 dark:text-amber-300/80">
                  For parties with more than {PARTY_CONFIG.maxKidsBeforeCall} children, please
                  call us directly at{' '}
                  <a
                    href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}
                    className="font-semibold underline"
                  >
                    {BUSINESS_INFO.phone}
                  </a>{' '}
                  to arrange your event. We&apos;re happy to accommodate larger groups with
                  custom arrangements!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-primary py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
            Ready to Party?
          </h2>
          <p className="mt-5 text-lg text-primary-foreground/85">
            Reserve your date today and let us handle the rest. Your child deserves an amazing
            celebration!
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 rounded-full shadow-elevated">
              <Link href="/customer/bookings">
                <PartyPopper className="size-5" />
                Book Online
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="w-full text-primary-foreground hover:bg-white/15 hover:text-primary-foreground sm:w-auto rounded-full"
            >
              <a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}>
                <Phone className="size-4" />
                Call {BUSINESS_INFO.phone}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
