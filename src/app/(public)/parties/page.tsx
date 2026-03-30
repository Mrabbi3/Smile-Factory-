import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowDown, Check, Eye } from 'lucide-react'
import PhotoFramePlaceholder from '../../../components/public/photo-frame-placeholder'

export const metadata: Metadata = {
  title: 'Birthday Parties | The Smile Factory',
  description:
    'Engineer the ultimate birthday party at The Smile Factory. Classic package, add-ons, and custom options.',
}

const blueprintPattern =
  "url(\"data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 70c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 10c11 0 20 9 20 20s-9 20-20 20-20-9-20-20 9-20 20-20z' fill='%23e5e7eb' fill-opacity='0.35'/%3E%3C/svg%3E\")"

const factoryPattern =
  "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20l20 20M0 40L20 20M20 0l20 20M0 20L20 0' stroke='%23e5e7eb' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")"

const features = [
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
  { title: 'Additional Child', price: '+$14.95/child' },
  { title: 'Extra Pizza', price: '+$12.00 each' },
  { title: 'Custom Gear Cake', price: '+$45.00' },
  { title: 'Factory Swag Bags', price: '+$8.00/child' },
]

export default function PartiesPage() {
  return (
    <main className="bg-surface text-on-surface">
      <header className="relative overflow-hidden bg-surface-container-lowest px-8 pb-24 pt-48" style={{ backgroundImage: blueprintPattern }}>
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="space-y-8">
            <span className="inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 font-work-sans text-label-sm uppercase tracking-widest text-primary">
              The Joy Assembly Line
            </span>
            <h1 className="font-epilogue text-display-lg font-black uppercase italic leading-[0.9] tracking-tight">
              Engineer
              <br />
              The <span className="text-primary">Ultimate</span> Birthday
            </h1>
            <p className="max-w-lg font-work-sans text-body-lg leading-relaxed text-on-surface/70">
              High-octane fun, precision-planned celebrations. We handle logistics so you focus on high scores.
            </p>
            <div className="flex flex-wrap gap-6 pt-2">
              <Link href="#party-blueprints" className="inline-flex items-center gap-3 rounded-full bg-gradient-primary px-10 py-5 font-work-sans text-label-lg uppercase text-on-primary shadow-ambient ring-4 ring-primary/20">
                View Packages <ArrowDown className="h-4 w-4" />
              </Link>
              <Link href="/gallery" className="inline-flex items-center gap-3 rounded-full bg-red-600 px-10 py-5 font-work-sans text-label-lg uppercase text-white shadow-ambient ring-4 ring-primary/20 transition hover:bg-red-700">
                Take a Tour <Eye className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rotate-3 scale-105 rounded-lg bg-surface-container-high p-4 shadow-ambient">
              <PhotoFramePlaceholder title="Party Hero Photo" note="Replace with real birthday party photo" className="rounded" />
            </div>
            <div className="absolute -bottom-8 -left-8 max-w-xs rounded-lg bg-tertiary px-8 py-6 text-on-primary shadow-ambient">
              <h3 className="font-epilogue text-title-md font-bold uppercase italic">Factory Special</h3>
              <p className="mt-2 font-work-sans text-body-sm opacity-90">Book weekday parties and receive bonus tickets for the birthday engineer.</p>
            </div>
          </div>
        </div>
      </header>

      <section id="party-blueprints" className="relative bg-surface-container-low px-8 py-24" style={{ backgroundImage: factoryPattern }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <h2 className="font-epilogue text-headline-lg font-black uppercase italic">Party Blueprints</h2>
            <div className="mx-auto mt-4 h-2 w-24 rounded-full bg-primary" />
          </div>
          <div className="mx-auto max-w-5xl rounded-lg bg-surface-container-lowest p-10 shadow-ambient">
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <div className="mb-6 flex items-start justify-between border-b border-outline-variant/40 pb-6">
                  <div>
                    <h3 className="font-epilogue text-headline-md font-black uppercase italic text-primary">Classic Package</h3>
                    <p className="mt-1 font-work-sans text-body-sm text-on-surface/60">The essential factory experience.</p>
                  </div>
                  <div className="text-right">
                    <span className="block font-epilogue text-4xl font-black">$400</span>
                    <span className="font-work-sans text-label-sm uppercase tracking-widest text-on-surface/50">For 12 Children</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 font-work-sans text-body-sm text-on-surface/80">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-gradient-primary py-4 font-work-sans text-label-lg uppercase text-on-primary shadow-ambient ring-4 ring-primary/20 transition hover:opacity-90">
                  Select Blueprint
                </Link>
              </div>
              <div className="min-h-[400px] overflow-hidden rounded-lg bg-surface-container-high">
                <PhotoFramePlaceholder title="Package Setup Photo" note="Replace with real party room photo" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-lowest px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="max-w-xl">
              <h2 className="font-epilogue text-headline-md font-black uppercase italic">Part Upgrades</h2>
              <p className="mt-3 font-work-sans text-body-md text-on-surface/65">Fine-tune your celebration with precision components.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {addOns.map((item) => (
              <article key={item.title} className="rounded-lg bg-gradient-primary p-8 text-on-primary shadow-ambient ring-2 ring-primary/15 transition-all hover:scale-[1.02]">
                <h4 className="font-epilogue text-title-sm font-bold uppercase text-on-primary">{item.title}</h4>
                <p className="mt-2 font-work-sans text-body-sm text-on-primary/80">{item.price}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
