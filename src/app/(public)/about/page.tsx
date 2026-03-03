import type { Metadata } from 'next'
import Link from 'next/link'
import { Gamepad2, Users, Trophy, Heart, Star, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BUSINESS_INFO } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'About Us',
  description: `Learn about The Smile Factory — Brigantine's favorite family arcade since ${BUSINESS_INFO.established}. Our story, mission, and what makes us special.`,
}

const highlights = [
  {
    icon: Gamepad2,
    title: `${BUSINESS_INFO.machineCount}+ Arcade Games`,
    description:
      'A carefully curated mix of classic and modern arcade machines that entertain players of every age.',
  },
  {
    icon: Trophy,
    title: 'Prize Counter',
    description:
      'Earn tickets while you play and trade them in for incredible prizes — from small trinkets to big-ticket rewards.',
  },
  {
    icon: Heart,
    title: 'Birthday Parties',
    description:
      'Our private party room and all-inclusive packages make birthdays effortless and unforgettable.',
  },
  {
    icon: Users,
    title: 'Community Hub',
    description:
      'More than an arcade — we\'re a gathering place where Brigantine families come together.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              About{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                The Smile Factory
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Family-owned and operated in the heart of Brigantine, New Jersey since{' '}
              {BUSINESS_INFO.established}.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-2 text-primary">
              <Star className="size-5 fill-primary" />
              <span className="text-sm font-semibold uppercase tracking-wider">Our Story</span>
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Making Families Smile Since {BUSINESS_INFO.established}
            </h2>
            <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>
                The Smile Factory Arcade &amp; Family Fun Center opened its doors in{' '}
                {BUSINESS_INFO.established} with a simple mission: to create a place where
                families could come together, unplug from the everyday, and simply have fun. What
                started as a small collection of arcade games has grown into Brigantine&apos;s
                go-to destination for family entertainment.
              </p>
              <p>
                Nestled on Brigantine Avenue, our arcade is a beloved fixture of the island
                community. We&apos;ve watched kids grow up playing our games, celebrate
                birthdays in our party room, and return year after year with their own families.
                That&apos;s the kind of legacy we&apos;re proud of.
              </p>
              <p>
                Today, The Smile Factory features over {BUSINESS_INFO.machineCount} arcade
                machines spanning classic favorites and the newest releases. Whether you&apos;re
                a seasoned gamer or picking up a joystick for the first time, there&apos;s
                something for everyone. Our friendly staff, clean facilities, and welcoming
                atmosphere make every visit a great experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-3xl" />

      {/* What We Offer */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What We Offer</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need for an awesome day out with the family.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <Card
                key={item.title}
                className="group border-0 bg-gradient-to-b from-card to-muted/30 shadow-md transition-shadow hover:shadow-lg"
              >
                <CardContent className="pt-6">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="size-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/40 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Come Visit Us!</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We&apos;re located at {BUSINESS_INFO.address}. Stop by and see why families keep
            coming back!
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/contact">
                Get Directions
                <ChevronRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}