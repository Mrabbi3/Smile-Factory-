import type { Metadata } from 'next'
import Link from 'next/link'
import {
  PartyPopper,
  Users,
  Clock,
  ChevronRight,
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
import { Separator } from '@/components/ui/separator'
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
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-sm">
              <PartyPopper className="size-3.5 text-primary" />
              Unforgettable Celebrations
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Birthday Parties
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Give your child a birthday they&apos;ll never forget! Our all-inclusive party
              packages make planning easy and celebration even easier.
            </p>
          </div>
        </div>
      </section>

      {/* Classic Package */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-5">
            <Card className="overflow-hidden border-primary/30 shadow-xl shadow-primary/5 ring-1 ring-primary/10 lg:col-span-3">
              <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-primary-foreground">Classic Package</h2>
                  <Badge variant="secondary" className="text-sm font-bold">
                    Most Popular
                  </Badge>
                </div>
              </div>
              <CardContent className="pt-8">
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-primary">$400</span>
                  <span className="text-muted-foreground">for up to 12 children</span>
                </div>

                <Separator className="my-6" />

                <h3 className="mb-4 font-semibold">What&apos;s Included:</h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {included.map((item) => (
                    <li key={item.label} className="flex items-center gap-2.5 text-sm">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <item.icon className="size-4" />
                      </div>
                      {item.label}
                    </li>
                  ))}
                </ul>

                <Separator className="my-6" />

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button asChild size="lg" className="flex-1">
                    <Link href="/customer/bookings">
                      <PartyPopper className="size-5" />
                      Book Now
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
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
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
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
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
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-primary" />
                    <span>
                      {PARTY_CONFIG.durationMinutes / 60} hours in private party room
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-primary" />
                    <span>Up to 12 children included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins className="size-4 text-primary" />
                    <span>${PARTY_CONFIG.depositAmount} deposit required to book</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="size-4 text-primary" />
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
      <section className="pb-16 sm:pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Info className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">
                  Parties Over {PARTY_CONFIG.maxKidsBeforeCall} Children
                </h3>
                <p className="mt-1 text-sm text-amber-800">
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
      <section className="bg-gradient-to-r from-primary to-primary/80 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to Party?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/90">
            Reserve your date today and let us handle the rest. Your child deserves an amazing
            celebration!
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
              <Link href="/customer/bookings">
                <PartyPopper className="size-5" />
                Book Online
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
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