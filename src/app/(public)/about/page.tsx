import type { Metadata } from 'next'
import Link from 'next/link'
import { Zap, Settings, Award, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BUSINESS_INFO } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'About Us',
  description: `Learn about The Smile Factory — Brigantine's favorite family arcade since ${BUSINESS_INFO.established}.`,
}

const missionCards = [
  {
    icon: Zap,
    title: 'HIGH-OCTANE FUN',
    description: 'We curate games that challenge reflexes and ignite the competitive spirit of every visitor.',
  },
  {
    icon: Settings,
    title: 'PRECISION ENGINEERING',
    description: 'Our floor is a living machine. Every detail is optimized for your comfort and thrill.',
  },
  {
    icon: Award,
    title: 'UNRIVALED QUALITY',
    description: 'We maintain the highest standards. If it isn\'t the best version, it doesn\'t belong on our floor.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center px-6 blueprint-gears pt-32 pb-20">
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black tracking-widest uppercase mb-8 border border-primary/20 font-display">
              EST. {BUSINESS_INFO.established}
            </span>
            <h1 className="font-display text-6xl md:text-8xl font-black leading-none mb-8 italic uppercase tracking-tighter">
              WELCOME TO <br />
              <span className="text-primary" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
                OUR FACTORY
              </span>
            </h1>
            <p className="text-xl text-zinc-500 max-w-xl mb-10 leading-relaxed">
              Where mechanical precision meets raw, unadulterated joy. We&apos;ve spent nearly two decades engineering the perfect environment for play.
            </p>
            <Button asChild size="lg" className="px-10 py-6 rounded-full gradient-primary text-primary-foreground font-display font-bold text-lg border-0 shadow-xl hover:opacity-90">
              <Link href="/gallery">
                EXPLORE THE FLOOR
                <Settings className="size-5 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="aspect-square bg-white p-4 rounded-2xl shadow-2xl relative rotate-3 overflow-hidden">
              <div className="w-full h-full bg-zinc-100 rounded-xl flex items-center justify-center">
                <div className="text-center text-zinc-400">
                  <Settings className="size-16 mx-auto mb-4 opacity-20" />
                  <p className="font-display font-bold">The Smile Factory</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-primary/5 mix-blend-multiply pointer-events-none" />
            </div>
            <div className="absolute -bottom-12 -left-12 font-display font-black text-9xl text-gray-200 opacity-50 select-none -z-10">
              SMILE
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-6 bg-zinc-50/80 relative">
        <div className="absolute inset-0 factory-pattern opacity-50 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="font-display text-5xl font-black mb-4 uppercase tracking-tighter italic">
                Our Mission: <br />
                <span className="text-primary">Joy Engineered</span>
              </h2>
              <p className="text-lg text-zinc-500">
                We don&apos;t just provide games; we assemble experiences. Every ticket, every light, and every gear is calibrated for maximum impact.
              </p>
            </div>
            <div className="h-1.5 w-32 bg-primary rounded-full hidden md:block mb-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {missionCards.map((card) => (
              <div
                key={card.title}
                className="bg-white p-10 rounded-2xl hover:shadow-xl transition-all group border border-gray-100"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 group-hover:rotate-180 transition-transform duration-700 border border-primary/20">
                  <card.icon className="size-7" />
                </div>
                <h3 className="font-display text-2xl font-black mb-4 uppercase tracking-tight">
                  {card.title}
                </h3>
                <p className="text-zinc-500 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="py-24 px-6 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            <div className="md:col-span-4 gradient-primary text-primary-foreground p-12 rounded-2xl flex flex-col justify-between shadow-2xl">
              <div>
                <h2 className="font-display text-7xl font-black mb-6 italic tracking-tighter">
                  SINCE<br />{BUSINESS_INFO.established}
                </h2>
                <p className="text-xl font-medium opacity-90">
                  A legacy built on laughter and high-scores. We&apos;ve been the heart of the island&apos;s entertainment for nearly two decades.
                </p>
              </div>
            </div>
            <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="bg-zinc-100 rounded-2xl overflow-hidden min-h-[300px] relative group border border-zinc-200 shadow-md flex items-center justify-center">
                <div className="text-center text-zinc-400">
                  <Settings className="size-12 mx-auto mb-2 opacity-20" />
                  <p className="font-display font-bold text-sm">The First Assembly ({BUSINESS_INFO.established})</p>
                </div>
              </div>
              <div className="bg-zinc-100 rounded-2xl overflow-hidden min-h-[300px] relative group border border-zinc-200 shadow-md flex items-center justify-center">
                <div className="text-center text-zinc-400">
                  <Settings className="size-12 mx-auto mb-2 opacity-20" />
                  <p className="font-display font-bold text-sm">The Modern Era (2024)</p>
                </div>
              </div>
              <div className="sm:col-span-2 bg-zinc-50 p-12 rounded-2xl border border-zinc-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Settings className="size-32" />
                </div>
                <h4 className="font-display text-2xl font-black mb-6 text-primary uppercase tracking-tight italic">
                  GROWING THE MACHINE
                </h4>
                <p className="text-zinc-500 text-lg leading-relaxed mb-8">
                  What started as a small collection of classic machines has evolved into Brigantine&apos;s go-to destination for family entertainment. We&apos;ve survived the digital shift by leaning into what makes us special: the physical, tactile, and social experience of real-world play.
                </p>
                <div className="flex flex-wrap items-center gap-10">
                  <div className="text-center">
                    <div className="text-4xl font-black font-display">{BUSINESS_INFO.machineCount}+</div>
                    <div className="text-xs uppercase font-bold text-primary tracking-widest mt-1">Machines</div>
                  </div>
                  <div className="w-px h-10 bg-zinc-200" />
                  <div className="text-center">
                    <div className="text-4xl font-black font-display">2M+</div>
                    <div className="text-xs uppercase font-bold text-primary tracking-widest mt-1">Happy Souls</div>
                  </div>
                  <div className="w-px h-10 bg-zinc-200" />
                  <div className="text-center">
                    <div className="text-4xl font-black font-display">50k</div>
                    <div className="text-xs uppercase font-bold text-primary tracking-widest mt-1">Prizes Won</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 blueprint-gears relative overflow-hidden">
        <div className="max-w-4xl mx-auto bg-zinc-900 text-white rounded-3xl p-12 md:p-20 text-center relative shadow-2xl border-4 border-primary">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Settings className="size-40" />
          </div>
          <h2 className="font-display text-4xl md:text-6xl font-black mb-8 leading-tight italic uppercase tracking-tighter">
            READY TO START THE MACHINE?
          </h2>
          <p className="text-lg opacity-80 mb-12 max-w-xl mx-auto">
            Join the thousands of visitors who have found their smile at the Factory. Book your visit or party today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button asChild size="lg" className="px-12 py-6 rounded-full gradient-primary text-primary-foreground font-display font-bold text-xl border-0 shadow-xl hover:opacity-90">
              <Link href="/parties">RESERVE NOW</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="px-12 py-6 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/30 font-display font-bold text-xl hover:bg-white/20">
              <Link href="/pricing">VIEW PRICING</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
