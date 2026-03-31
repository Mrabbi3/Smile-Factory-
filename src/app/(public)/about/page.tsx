import type { Metadata } from 'next'
import Link from 'next/link'
import { Gamepad2, Users, Trophy, Heart, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
      <section className="py-24 sm:py-28 pattern-industrial">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              About{' '}
              <span className="bg-gradient-to-r from-primary to-[var(--primary-container)] bg-clip-text text-transparent">
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
      <section className="bg-[var(--surface-container-low)] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Star className="size-5 fill-primary" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-primary font-display">Our Story</span>
            </div>
            <h2 className="font-display mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
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

      {/* What We Offer */}
      <section className="py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">What We Offer</h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Everything you need for an awesome day out with the family.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <Card
                key={item.title}
                className="group transition-all duration-300 hover:shadow-elevated hover:-translate-y-1"
              >
                <CardContent className="pt-6">
                  <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:gradient-primary group-hover:text-primary-foreground group-hover:shadow-ambient">
                    <item.icon className="size-7" />
                  </div>
                  <h3 className="font-display text-lg font-bold">{item.title}</h3>
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
      <section className="bg-[var(--surface-container-low)] py-24 sm:py-28 pattern-industrial">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">Come Visit Us!</h2>
          <p className="mt-5 text-lg text-muted-foreground">
            We&apos;re located at {BUSINESS_INFO.address}. Stop by and see why families keep
            coming back!
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/contact">
                Get Directions
                <ArrowRight className="size-4" />
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
