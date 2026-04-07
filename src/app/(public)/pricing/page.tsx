import type { Metadata } from 'next'
import Link from 'next/link'
import { Coins, CreditCard, Gamepad2, Trophy, PartyPopper, ArrowRight, Settings, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TOKEN_PRICING, BUSINESS_INFO } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Token Pricing',
  description: 'Token pricing at The Smile Factory arcade. Buy tokens to play over 41 arcade games.',
}

const tierNames = ['SINGLE SHOT', 'STARTER PACK', 'HEAVY DUTY', 'FACTORY OVERLOAD']

const steps = [
  { icon: CreditCard, title: 'Buy Tokens', desc: 'Purchase tokens at the counter. Cash and card accepted.' },
  { icon: Gamepad2, title: 'Play Games', desc: `Access over ${BUSINESS_INFO.machineCount}+ premium arcade machines and more.` },
  { icon: Trophy, title: 'Win Prizes', desc: 'Redeem your hard-earned tickets at the prize vault for awesome gear.' },
]

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <header className="relative overflow-hidden py-32 px-8 blueprint-gears pt-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-black tracking-widest uppercase border border-primary/20 font-display">
              Industrial Joy
            </span>
            <h1 className="font-display font-black text-6xl md:text-8xl text-primary leading-none tracking-tighter uppercase italic">
              Smile<br />Factory
            </h1>
            <p className="text-xl md:text-2xl max-w-xl text-zinc-500 leading-relaxed">
              Fuel your fun with our premium token bundles. No hidden fees, just pure mechanical joy manufactured daily.
            </p>
          </div>
          <div className="flex-1 w-full aspect-video rounded-2xl bg-zinc-100 relative overflow-hidden group shadow-2xl flex items-center justify-center">
            <div className="text-center text-zinc-400">
              <Coins className="size-16 mx-auto mb-4 opacity-20" />
              <p className="font-display font-bold">Arcade Tokens</p>
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Grid */}
      <section className="py-24 px-8 bg-zinc-50/50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
              <span className="text-primary font-display font-bold uppercase tracking-widest text-sm">Industrial Pricing</span>
              <h2 className="font-display font-black text-5xl md:text-6xl mt-2 tracking-tighter">TOKENS</h2>
            </div>
            <div className="bg-zinc-200/50 px-6 py-3 rounded-full flex items-center gap-3 border border-zinc-200">
              <Settings className="size-5 text-primary" />
              <span className="font-semibold text-sm">Bulk discount applied automatically</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TOKEN_PRICING.map((tier, i) => {
              const isPopular = tier.price === 10
              return (
                <div
                  key={tier.price}
                  className={`bg-white rounded-2xl p-10 flex flex-col items-center text-center transition-all ${
                    isPopular
                      ? 'ring-4 ring-primary shadow-2xl relative scale-105 z-10'
                      : 'hover:-translate-y-2 border border-zinc-100 shadow-sm'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-[10px] font-display font-black tracking-widest shadow-lg">
                      MOST POPULAR
                    </div>
                  )}
                  <span className="text-zinc-400 font-display font-bold text-xs tracking-widest mb-4">
                    {tierNames[i]}
                  </span>
                  <div className="text-6xl font-display font-black mb-2">${tier.price}</div>
                  <div className="text-2xl font-display font-bold text-primary mb-2 italic">
                    {tier.tokens} TOKENS
                  </div>
                  {tier.price === 20 && (
                    <div className="text-primary font-bold text-[10px] mb-4 uppercase tracking-wider italic">
                      +6 Bonus Tokens Included
                    </div>
                  )}
                  <button
                    className={`mt-auto w-full py-4 rounded-xl font-display font-bold uppercase tracking-widest text-xs transition-all ${
                      isPopular
                        ? 'bg-primary text-primary-foreground shadow-lg hover:opacity-90'
                        : 'bg-zinc-50 hover:bg-primary hover:text-primary-foreground'
                    }`}
                  >
                    {isPopular ? 'Select' : 'Select'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mechanical Workflow */}
      <section className="py-32 px-8 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="font-display font-black text-5xl tracking-tighter italic uppercase">
              Mechanical Workflow
            </h2>
            <p className="text-zinc-500 mt-4 text-lg">Your three-step guide to manufacturing fun</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative">
            <div className="hidden lg:block absolute top-12 left-0 w-full h-1 bg-zinc-100 -z-10" />
            {steps.map((step) => (
              <div key={step.title} className="flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-primary flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform">
                  <step.icon className="size-10 text-primary" />
                </div>
                <h3 className="font-display font-bold text-2xl mb-4 tracking-tight uppercase">
                  {step.title}
                </h3>
                <p className="text-zinc-500 max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loyalty CTA */}
      <section className="pb-32 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-0 bg-white rounded-3xl overflow-hidden shadow-2xl border border-zinc-100">
          <div className="md:w-2/5 h-80 md:h-auto overflow-hidden bg-zinc-100 flex items-center justify-center">
            <div className="text-center text-zinc-400">
              <Star className="size-16 mx-auto mb-4 opacity-20" />
              <p className="font-display font-bold">Loyalty Program</p>
            </div>
          </div>
          <div className="flex-1 p-12 md:p-16 flex flex-col justify-center">
            <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black w-fit mb-6 tracking-widest uppercase border border-primary/20 font-display">
              MEMBER BENEFIT
            </div>
            <h3 className="font-display font-black text-4xl mb-6 tracking-tighter uppercase italic">
              The Prize Gear Protocol
            </h3>
            <p className="text-zinc-500 text-lg leading-relaxed mb-8">
              Join our loyalty program to earn bonus tokens on every purchase. Members get exclusive access and priority entry on special event nights.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-3 px-6 py-3 bg-zinc-50 border border-zinc-100 rounded-xl">
                <Settings className="size-5 text-primary" />
                <span className="text-sm font-black uppercase tracking-tight">Priority Support</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-zinc-50 border border-zinc-100 rounded-xl">
                <Star className="size-5 text-primary" />
                <span className="text-sm font-black uppercase tracking-tight">Exclusive Rewards</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
