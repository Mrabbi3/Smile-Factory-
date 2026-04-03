import type { Metadata } from 'next'
import {
  Gamepad2,
  PartyPopper,
  Trophy,
  Star,
  ArrowRight,
  Coins,
  Users,
  CalendarDays,
  CreditCard,
  Settings,
  Joystick,
  Gift,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BUSINESS_INFO, TOKEN_PRICING } from '@/lib/constants'

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

const reviews = [
  {
    text: "Best arcade in Brigantine! We come every summer and the kids never want to leave. The prizes are actually worth the tickets!",
    author: 'Sarah M., Family Vacationer',
  },
  {
    text: "Had my son's 8th birthday here. Everything was so organized, the staff was amazing, and the kids had a blast. Highly recommend the party packages.",
    author: 'David L., Local Parent',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
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
            <span className="text-3xl md:text-4xl font-black text-zinc-400/80 italic mb-4 uppercase tracking-tighter font-display">
              Welcome to
            </span>
            <h1 className="text-5xl md:text-7xl font-black industrial-text leading-[0.9] tracking-tighter italic uppercase font-display">
              <span className="rivet" />
              The Smile Factory!
              <span className="rivet" />
            </h1>
          </div>
          <p className="max-w-2xl mx-auto text-xl text-zinc-600 mb-12">
            Brigantine&apos;s favorite arcade and family fun center. With over{' '}
            {BUSINESS_INFO.machineCount} games, birthday party packages, and a prize counter
            bursting with rewards — smiles are guaranteed!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button asChild size="lg" className="w-full sm:w-auto px-12 py-6 rounded-full gradient-primary text-primary-foreground text-xl font-black tracking-tight hover:opacity-90 shadow-xl border-0">
              <Link href="/parties">
                <CalendarDays className="size-5" />
                Book a Party
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-12 py-6 rounded-full border-2 border-zinc-200 bg-white text-zinc-800 text-xl font-black tracking-tight hover:bg-zinc-50 shadow-md">
              <Link href="/pricing">
                <CreditCard className="size-5" />
                View Pricing
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features (Bento) */}
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

      {/* Token Pricing */}
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

      {/* Social Feed */}
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
            {['Arcade Action', 'Family Fun', 'Prize Tickets', 'Claw Wins'].map((label) => (
              <div
                key={label}
                className="relative border-4 border-black shadow-xl rounded-2xl overflow-hidden group bg-white"
              >
                <div className="aspect-square overflow-hidden flex items-center justify-center bg-zinc-100">
                  <div className="text-center text-zinc-400">
                    <Gamepad2 className="size-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-bold font-display">{label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-24 px-8 bg-white border-t border-zinc-100">
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-100 p-1.5 rounded-2xl shadow-inner flex mb-12 overflow-hidden border border-zinc-200">
            <div className="flex-1 py-4 text-primary font-black uppercase tracking-widest bg-white rounded-xl shadow-sm border border-zinc-200 text-center text-sm font-display">
              Real Reviews
            </div>
            <div className="flex-1 py-4 text-zinc-500 font-black uppercase tracking-widest text-center text-sm font-display">
              Leave a Review
            </div>
          </div>
          <div className="space-y-8">
            {reviews.map((review) => (
              <div
                key={review.author}
                className="p-10 rounded-2xl bg-zinc-50 border border-zinc-100 relative"
              >
                <div className="flex gap-1 text-primary mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-xl text-zinc-800 mb-6 font-medium italic leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-1 bg-primary rounded-full" />
                  <span className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                    — {review.author}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
