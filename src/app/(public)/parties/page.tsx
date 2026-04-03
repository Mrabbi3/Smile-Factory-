import type { Metadata } from 'next'
import Link from 'next/link'
import {
  PartyPopper, Users, Clock, ArrowRight, Phone, ArrowDown, Eye,
  CheckCircle, UserPlus, Pizza, Cake, Gift, Settings, Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BUSINESS_INFO, PARTY_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Birthday Parties',
  description: 'Celebrate your child\'s birthday at The Smile Factory! All-inclusive party packages.',
}

const included = [
  '2 Hour Party in Private Decorated Party Room',
  'Private Party Hosts',
  '2 slices of Pizza per child',
  'Soda, Juice, & Chips',
  'All Paper Products',
  '$7 per Child Worth of Tokens (21 Tokens)',
  '$60 worth of tokens for parent to distribute',
  'Extra tickets for the Birthday Child',
]

const addOns = [
  { icon: UserPlus, title: 'Additional Child', price: '+$14.95/child' },
  { icon: Pizza, title: 'Extra Pizza', price: '+$12.00 each' },
  { icon: Cake, title: 'Custom Gear Cake', price: '+$45.00' },
  { icon: Gift, title: 'Factory Swag Bags', price: '+$8.00/child' },
]

export default function PartiesPage() {
  return (
    <>
      {/* Hero */}
      <header className="relative pt-48 pb-24 overflow-hidden blueprint-gears bg-white">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-black tracking-widest uppercase border border-primary/20 font-display">
                The Joy Assembly Line
              </span>
              <h1 className="text-6xl md:text-8xl font-black font-display leading-[0.9] tracking-tighter italic uppercase">
                ENGINEER <br />THE <span className="text-primary">ULTIMATE</span> BIRTHDAY.
              </h1>
              <p className="text-xl text-zinc-600 max-w-lg leading-relaxed">
                High-octane fun, precision-planned celebrations. We handle the logistics; you focus on the high scores.
              </p>
              <div className="flex flex-wrap gap-6 pt-4">
                <Button asChild size="lg" className="px-10 py-6 rounded-full gradient-primary text-primary-foreground font-display font-bold text-lg border-0 shadow-xl hover:opacity-90">
                  <a href="#packages">
                    View Packages <ArrowDown className="size-5 ml-2" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-10 py-6 rounded-full border-2 border-zinc-200 bg-white font-display font-bold text-lg shadow-md">
                  <Link href="/gallery">
                    Take a Tour <Eye className="size-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl rotate-3 scale-105 border-[16px] border-white bg-zinc-100 flex items-center justify-center">
                <div className="text-center text-zinc-400">
                  <PartyPopper className="size-16 mx-auto mb-4 opacity-20" />
                  <p className="font-display font-bold">Party Room</p>
                </div>
              </div>
              <div className="absolute -bottom-8 -left-8 bg-[var(--tertiary)] text-white p-8 rounded-2xl shadow-xl max-w-xs">
                <Settings className="size-8 mb-2" />
                <h3 className="font-display font-bold text-xl uppercase italic">Factory Special</h3>
                <p className="text-sm opacity-90">Book any weekday party and get 500 bonus tickets for the birthday engineer!</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Package */}
      <section id="packages" className="py-24 bg-zinc-50/80 relative">
        <div className="absolute inset-0 factory-pattern opacity-30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="mb-20 text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black font-display tracking-tighter uppercase italic">
              Party Blueprints
            </h2>
            <div className="w-24 h-2 bg-primary mx-auto rounded-full" />
          </div>
          <div className="bg-white rounded-2xl p-10 flex flex-col md:flex-row gap-10 group hover:shadow-2xl transition-all duration-500 border border-gray-100 max-w-5xl mx-auto w-full">
            <div className="flex-1 space-y-8">
              <div className="flex justify-between items-start border-b border-zinc-100 pb-6">
                <div>
                  <h3 className="text-3xl font-black font-display text-primary uppercase italic">
                    Classic Package
                  </h3>
                  <p className="text-zinc-500 mt-1">The essential factory experience.</p>
                </div>
                <div className="text-right">
                  <span className="block text-4xl font-black font-display">$400</span>
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    For 12 Children
                  </span>
                </div>
              </div>
              <ul className="space-y-3 text-zinc-700">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="size-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="w-full py-5 rounded-full bg-zinc-900 text-white font-display font-bold uppercase tracking-widest hover:bg-primary border-0">
                <Link href="/customer/bookings">Select Blueprint</Link>
              </Button>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden relative border-4 border-zinc-50 shadow-inner min-h-[400px] bg-zinc-100 flex items-center justify-center">
              <div className="text-center text-zinc-400">
                <PartyPopper className="size-16 mx-auto mb-4 opacity-20" />
                <p className="font-display font-bold">Party Setup</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Add-Ons */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl font-black font-display uppercase italic tracking-tighter">Part Upgrades</h2>
              <p className="text-zinc-500 mt-4">Fine-tune your celebration with these precision components.</p>
            </div>
            <div className="flex gap-2">
              <div className="w-12 h-2 bg-primary rounded-full" />
              <div className="w-6 h-2 bg-primary/40 rounded-full" />
              <div className="w-3 h-2 bg-[var(--tertiary)] rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {addOns.map((addon) => (
              <div
                key={addon.title}
                className="bg-zinc-50 p-8 rounded-2xl group hover:bg-primary transition-all duration-300 border border-zinc-100 cursor-default"
              >
                <addon.icon className="size-10 text-primary group-hover:text-white mb-4 transition-colors" />
                <h4 className="font-display font-bold uppercase group-hover:text-white transition-colors text-sm">
                  {addon.title}
                </h4>
                <p className="text-sm text-zinc-500 group-hover:text-white/80 mt-2 transition-colors">
                  {addon.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Large Party Notice */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-8">
          <Card className="bg-amber-50/80 dark:bg-amber-900/20 border-0 shadow-sm">
            <CardContent className="flex items-start gap-4 pt-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Info className="size-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-amber-900">
                  Parties Over {PARTY_CONFIG.maxKidsBeforeCall} Children
                </h3>
                <p className="mt-1 text-sm text-amber-800">
                  For parties with more than {PARTY_CONFIG.maxKidsBeforeCall} children, please call us directly at{' '}
                  <a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`} className="font-semibold underline">
                    {BUSINESS_INFO.phone}
                  </a>{' '}
                  to arrange your event.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-zinc-50/50">
        <div className="max-w-4xl mx-auto px-8">
          <div className="bg-white rounded-3xl p-16 text-center relative overflow-hidden shadow-2xl border border-zinc-100">
            <div className="absolute inset-0 factory-pattern opacity-10 pointer-events-none" />
            <div className="relative z-10 space-y-10">
              <h2 className="text-5xl md:text-6xl font-black font-display uppercase italic leading-none tracking-tighter">
                Ready to start the <br />
                <span className="text-primary italic">production line?</span>
              </h2>
              <p className="text-xl text-zinc-600 max-w-lg mx-auto">
                Dates fill up fast. Contact us today and lock in your factory floor time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button asChild size="lg" className="px-12 py-6 rounded-full gradient-primary text-primary-foreground font-display font-bold uppercase tracking-widest border-0 shadow-xl hover:opacity-90 text-lg">
                  <Link href="/contact">Inquire Now</Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="rounded-full font-display font-bold">
                  <a href={`tel:${BUSINESS_INFO.phone.replace(/\D/g, '')}`}>
                    <Phone className="size-4 mr-2" />
                    Call {BUSINESS_INFO.phone}
                  </a>
                </Button>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
              <span className="text-[20rem] font-black font-display">SMILE</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
