'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Cake, Coins, CreditCard, Gamepad2, Trophy } from 'lucide-react'
import PhotoFramePlaceholder from '@/components/public/photo-frame-placeholder'
import { TOKEN_PRICING } from '@/lib/constants'

const blueprintPattern =
  "url(\"data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 70c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 10c11 0 20 9 20 20s-9 20-20 20-20-9-20-20 9-20 20-20z' fill='%23e5e7eb' fill-opacity='0.35'/%3E%3C/svg%3E\")"

const factoryPattern =
  "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20l20 20M0 40L20 20M20 0l20 20M0 20L20 0' stroke='%23e5e7eb' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")"

export default function PricingPageContent() {
  const [selectedPackage, setSelectedPackage] = useState<number>(10)

  return (
    <main className="bg-surface text-on-surface">
      <header className="relative isolate min-h-[760px] overflow-hidden bg-white px-6 pb-20 pt-36">
        <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: factoryPattern }} />
        <div className="pointer-events-none absolute left-[-8rem] top-[18%] size-[28rem] rounded-full bg-red-100/40 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-[-10rem] right-[-8rem] size-[36rem] rounded-full bg-red-100/30 blur-[120px]" />
        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="space-y-8">
            <span className="inline-flex rounded-full border border-red-200 bg-red-100/80 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-red-700">
              Token Bundles
            </span>
            <h1 className="text-5xl font-black uppercase italic leading-[0.9] tracking-tighter text-red-600 md:text-7xl">
              Fuel the
              <br />
              Factory Floor
            </h1>
            <p className="max-w-2xl text-lg text-zinc-600 md:text-xl">
              The pricing page follows the same visual grammar as home: bold red CTAs, lifted cards, and clear bundle comparisons for families choosing how they want to play.
            </p>
            <div className="flex flex-col gap-5 sm:flex-row">
              <Link
                href="/parties"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-red-600 to-red-700 px-10 py-4 text-lg font-black text-white shadow-xl transition hover:opacity-90"
              >
                Book a Party
                <Cake className="size-5" />
              </Link>
              <Link
                href="/#reviews"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-10 py-4 text-lg font-black text-white shadow-xl transition hover:bg-red-700"
              >
                See Reviews
                <Trophy className="size-5" />
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border-[4px] border-black bg-white shadow-2xl">
              <div className="aspect-[4/3] overflow-hidden">
                <PhotoFramePlaceholder title="Pricing Hero Photo" note="Replace with real token counter or arcade photo" />
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-2xl bg-red-600 px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-xl">
              Bulk savings active
            </div>
          </div>
        </div>
      </header>

      <section className="relative bg-zinc-50/80 px-8 py-24">
        <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: factoryPattern }} />
        <div className="relative mx-auto max-w-screen-2xl">
          <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div>
              <span className="text-sm font-black uppercase tracking-[0.2em] text-red-600">Industrial Pricing</span>
              <h2 className="mt-2 text-4xl font-black uppercase italic tracking-tight text-zinc-900 md:text-5xl">Token Pricing</h2>
            </div>
            <div className="rounded-full border border-zinc-200 bg-white px-6 py-3 shadow-sm">
              <span className="text-sm font-bold text-zinc-600">Bulk discount applied automatically</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {TOKEN_PRICING.map((tier) => {
              const isFeatured = tier.price === 10
              const isSelected = selectedPackage === tier.price

              return (
                <button
                  key={tier.price}
                  type="button"
                  onClick={() => setSelectedPackage(tier.price)}
                  className={`relative flex min-h-[22rem] flex-col items-center rounded-2xl p-10 text-center transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                    isSelected
                      ? 'border-4 border-red-600 bg-red-50 shadow-2xl'
                      : isFeatured
                        ? 'border-4 border-red-300 bg-white shadow-xl'
                        : 'border-2 border-transparent bg-white shadow-sm hover:border-red-600/20 hover:shadow-xl'
                  }`}
                  aria-pressed={isSelected}
                >
                  {isFeatured && (
                    <div className="absolute -top-5 rounded-full bg-red-600 px-6 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-white shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">{tier.label}</span>
                  <span className="mb-6 mt-4 text-6xl font-black text-red-600">${tier.price}</span>
                  <div className={`mb-6 h-1 ${isSelected ? 'w-20 bg-red-600' : 'w-12 bg-zinc-200'}`} />
                  <span className="text-2xl font-black uppercase tracking-tight">{tier.tokens} Tokens</span>
                  <div className="mt-3 min-h-[1.25rem]">
                    {tier.price === 20 && <p className="text-sm font-black italic text-red-600">+6 Bonus Tokens!</p>}
                  </div>
                  <span
                    className={`mt-auto inline-flex w-full items-center justify-center rounded-xl py-4 text-sm font-black uppercase tracking-[0.2em] transition ${
                      isSelected
                        ? 'bg-red-600 text-white'
                        : 'border border-zinc-200 bg-white text-zinc-800'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-white px-8 py-24">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-20 text-center">
            <h2 className="mb-4 text-4xl font-black uppercase italic tracking-tight md:text-5xl">Mechanical Workflow</h2>
            <p className="text-lg text-zinc-600">Your three-step guide to manufacturing fun</p>
          </div>
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
            <article className="text-center">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-red-600 bg-white shadow-xl">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Buy Tokens</h3>
              <p className="mt-4 text-zinc-600">Select your tariff at any kiosk or online.</p>
            </article>
            <article className="text-center">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-red-600 bg-white shadow-xl">
                <Gamepad2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Play Games</h3>
              <p className="mt-4 text-zinc-600">Access over 41+ premium arcade machines.</p>
            </article>
            <article className="text-center">
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-red-600 bg-white shadow-xl">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Win Prizes</h3>
              <p className="mt-4 text-zinc-600">Redeem hard-earned tickets for premium gear.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-gray-200 bg-zinc-50 px-8 py-24">
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: blueprintPattern }} />
        <div className="relative mx-auto flex max-w-screen-2xl flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl md:flex-row">
          <div className="h-80 overflow-hidden bg-zinc-100 md:h-auto md:w-2/5">
            <PhotoFramePlaceholder title="Member Benefit Photo" note="Replace with real prize or floor photo" />
          </div>
          <div className="flex-1 p-16">
            <div className="mb-6 inline-block rounded-full border border-red-200 bg-red-100/80 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-red-700">
              Member Benefit
            </div>
            <h3 className="text-4xl font-black uppercase italic tracking-tight">The Prize Gear Protocol</h3>
            <p className="mb-8 mt-6 text-lg leading-relaxed text-zinc-600">
              Join loyalty to earn bonus tokens on every purchase and unlock exclusive tournament-night perks.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="inline-flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-3">
                <Coins className="h-5 w-5 text-primary" />
                <span className="text-sm font-black uppercase tracking-tight">Priority Tech Support</span>
              </div>
              <div className="inline-flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-3">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="text-sm font-black uppercase tracking-tight">Exclusive Machines</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}