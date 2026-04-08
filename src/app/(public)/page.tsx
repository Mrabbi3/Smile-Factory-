import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Gamepad2,
  PartyPopper,
  Trophy,
  ArrowRight,
  Users,
  CalendarDays,
  CreditCard,
  Settings,
  Joystick,
  Gift,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BUSINESS_INFO, TOKEN_PRICING } from '@/lib/constants'
import { ReviewsSection } from '@/components/public/reviews-section'

export const metadata: Metadata = {
  title: 'Home | The Smile Factory',
  description:
    "Welcome to The Smile Factory - Brigantine's favorite family arcade since 2006. Over 41 games, birthday parties, prizes, and fun for all ages!",
}

const features = [
  {
    icon: Gamepad2,
    ghostIcon: Joystick,
    title: `${BUSINESS_INFO.machineCount}+ Games`,
    description: 'From classic favorites to the latest arcade hits — something for every age.',
    cta: { label: 'Browse Games', href: '/gallery' },
    span: 'md:col-span-2',
  },
  {
    icon: PartyPopper,
    ghostIcon: Gift,
    title: 'Birthday Parties',
    description: 'Private party room, pizza, drinks, tokens, and 2 hours of non-stop fun.',
    cta: { label: 'Plan a Party', href: '/parties' },
    span: 'md:col-span-2',
  },
  {
    icon: Trophy,
    ghostIcon: Settings,
    title: 'Prize Counter',
    description: 'Win tickets and redeem them for awesome prizes at our prize counter!',
    cta: null,
    span: 'md:col-span-2',
  },
  {
    icon: Users,
    ghostIcon: Users,
    title: 'Family Fun',
    description: 'A safe, clean, and welcoming space where families make memories together.',
    cta: null,
    span: 'md:col-span-2',
  },
]

const socialFeed = [
  {
    label: 'Arcade Action',
    src: '/homepage-photos/arcade1.jpg',
    alt: 'Arcade action at The Smile Factory',
  },
  {
    label: 'Family Fun',
    src: '/homepage-photos/family-fun1.jpg',
    alt: 'Family fun at The Smile Factory',
  },
  {
    label: 'Prize Tickets',
    src: '/homepage-photos/prize-tickets1.jpg',
    alt: 'Prize tickets at The Smile Factory',
  },
  {
    label: 'Claw Wins',
    src: '/homepage-photos/clawmachine.jpg',
    alt: 'Claw machine wins at The Smile Factory',
  },
]

export default function HomePage() {
  return (
    <>
      <header className="relative pt-40 pb-24 px-6 overflow-hidden min-h-[700px] lg:min-h-[850px] flex items-center justify-center bg-white blueprint-gears">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -translate-x-1/2" />
          <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-black tracking-widest uppercase mb-8 border border-primary/20">
            Family Fun Since {BUSINESS_INFO.established}
          </span>
          <div className="flex flex-col items-center justify-center mb-8">
            <Image
              src="/branding/smile-factory-logo.png"
              alt="The Smile Factory Logo"
              width={360}
              height={360}
              className="mx-auto mb-6 h-auto w-full max-w-[360px] drop-shadow-2xl transition-transform duration-700 hover:scale-105"
              priority
            />
            <h1 className="text-4xl md:text-6xl font-black industrial-text leading-[0.9] tracking-tighter italic uppercase font-display">
              Arcade &amp; Family Fun Center
            </h1>
          </div>
          <p className="max-w-2xl mx-auto text-xl text-zinc-600 mb-12">
            Brigantine&apos;s favorite arcade and family fun center. With over{' '}
            {BUSINESS_INFO.machineCount} games, birthday party packages, and a prize counter
            bursting with rewards — smiles are guaranteed!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto px-12 py-6 rounded-full gradient-primary text-primary-foreground text-xl font-black tracking-tight hover:opacity-90 shadow-xl border-0"
            >
              <Link href="/parties">
                <CalendarDays className="size-5" />
                Book a Party
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-12 py-6 rounded-full border-2 border-zinc-200 bg-white text-zinc-800 text-xl font-black tracking-tight hover:bg-zinc-50 shadow-md"
            >
              <Link href="/pricing">
                <CreditCard className="size-5" />
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="py-24 px-8 bg-zinc-50/80 relative">
        <div className="absolute inset-0 factory-pattern opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 font-display">
                Why Families Love Us
              </h2>
              <p className="text-lg text-zinc-500">
                Everything you need for an unforgettable day of fun, all under one roof.
              </p>
            </div>
            <div className="h-1.5 w-32 bg-primary rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`${feature.span} group bg-white p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 border border-primary/20">
                    <feature.icon className="size-8" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tight font-display">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-600 mb-8 text-lg">{feature.description}</p>
                  {feature.cta && (
                    <Link
                      href={feature.cta.href}
                      className="inline-flex items-center text-primary font-black uppercase text-sm tracking-widest hover:gap-3 transition-all gap-2"
                    >
                      {feature.cta.label} <ArrowRight className="size-4" />
                    </Link>
                  )}
                  {!feature.cta && feature.title === 'Family Fun' && (
                    <p className="text-md font-black italic text-primary">
                      &ldquo;Making Brigantine Smile Since &apos;06&rdquo;
                    </p>
                  )}
                </div>
                <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-20 transition-all duration-500">
                  <feature.ghostIcon className="size-60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-8 bg-white relative">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 uppercase italic font-display">
            Token Pricing
          </h2>
          <p className="text-lg text-zinc-600 mb-16">
            Stock up and save! The more you play, the more you win.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TOKEN_PRICING.map((tier) => {
              const isBestValue = tier.price === 10
              return (
                <div
                  key={tier.price}
                  className={`p-10 rounded-2xl flex flex-col items-center transition-all group ${
                    isBestValue
                      ? 'bg-white ring-4 ring-primary scale-105 shadow-2xl relative z-20'
                      : 'bg-zinc-50 border-2 border-transparent hover:border-primary/20'
                  }`}
                >
                  {isBestValue && (
                    <div className="absolute -top-5 bg-primary text-primary-foreground px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <span className="text-primary font-black text-6xl mb-6 font-display">
                    ${tier.price}
                  </span>
                  <div className="h-1 w-12 bg-zinc-200 mb-6 group-hover:w-20 transition-all" />
                  <span className="text-2xl font-black uppercase tracking-tight font-display">
                    {tier.tokens} Tokens
                  </span>
                  {tier.price === 20 && (
                    <p className="text-sm text-primary font-black mt-3 italic">+6 Bonus Tokens!</p>
                  )}
                  <button
                    className={`mt-8 w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-sm ${
                      isBestValue
                        ? 'bg-primary text-primary-foreground hover:opacity-90'
                        : 'bg-white border border-zinc-200 text-zinc-800 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary'
                    }`}
                  >
                    {isBestValue ? 'BUY NOW' : 'SELECT'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Join the Factory Floor ── */}
      <section className="py-24 px-8 bg-zinc-50 overflow-hidden relative border-y border-gray-200">
        <div className="absolute inset-0 factory-pattern opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="inline-flex items-center gap-4 mb-4">
              <div className="h-px w-12 bg-primary" />
              <span className="text-primary font-black uppercase tracking-widest text-sm font-display">
                Live Social Feed
              </span>
              <div className="h-px w-12 bg-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 italic uppercase tracking-tighter font-display">
              Join the Factory Floor
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl">
              Follow us for weekly high scores, prize updates, and community smiles!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {socialFeed.map(({ label, src, alt }) => (
              <div
                key={label}
                className="relative border-4 border-black shadow-xl rounded-2xl overflow-hidden group bg-white"
              >
                <div className="aspect-square overflow-hidden relative">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection />
    </>
  )
}