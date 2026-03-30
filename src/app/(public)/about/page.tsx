import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Settings, Sparkles, Trophy } from 'lucide-react'
import PhotoFramePlaceholder from '../../../components/public/photo-frame-placeholder'
import { BUSINESS_INFO } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'About | The Smile Factory',
  description:
    "Learn about The Smile Factory — Brigantine's favorite family arcade since 2006. Our mission, history, and the joy we manufacture every day.",
}

const blueprintPattern =
  "url(\"data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M100 70c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 10c11 0 20 9 20 20s-9 20-20 20-20-9-20-20 9-20 20-20z' fill='%23e5e7eb' fill-opacity='0.35'/%3E%3C/svg%3E\")"

const factoryPattern =
  "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20l20 20M0 40L20 20M20 0l20 20M0 20L20 0' stroke='%23e5e7eb' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")"

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden bg-surface text-on-surface">
      <section className="relative flex min-h-[820px] items-center justify-center px-6 pt-20" style={{ backgroundImage: blueprintPattern }}>
        <div className="relative z-10 grid w-full max-w-screen-xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            <span className="inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 font-work-sans text-label-sm uppercase tracking-widest text-primary">
              Est. {BUSINESS_INFO.established}
            </span>
            <h1 className="font-epilogue text-display-lg font-black uppercase italic leading-[0.9] tracking-tight">
              Welcome To
              <br />
              <span className="text-primary">Our Factory</span>
            </h1>
            <p className="max-w-xl font-work-sans text-body-lg leading-relaxed text-on-surface/70">
              Where mechanical precision meets raw, unadulterated joy. We've spent nearly two decades engineering the perfect environment for play.
            </p>
            <Link href="/gallery" className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-10 py-4 font-work-sans text-label-lg uppercase text-on-primary shadow-ambient transition-transform hover:scale-105">
              Explore the Floor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative lg:col-span-5">
            <div className="relative aspect-square rotate-3 overflow-hidden rounded-lg bg-surface-container-lowest p-4 shadow-ambient">
              <PhotoFramePlaceholder title="About Hero Photo" note="Replace with real arcade exterior or team photo" className="rounded" />
              <div className="pointer-events-none absolute inset-0 bg-primary/10 mix-blend-multiply" />
            </div>
            <div className="absolute -bottom-12 -left-12 -z-10 select-none font-epilogue text-9xl font-black text-zinc-200/70">
              SMILE
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-surface-container-low px-6 py-24" style={{ backgroundImage: factoryPattern }}>
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
            <div className="max-w-2xl">
              <h2 className="font-epilogue text-headline-lg font-black uppercase italic tracking-tight">
                Our Mission:
                <br />
                <span className="text-primary">Joy Engineered</span>
              </h2>
              <p className="mt-4 font-work-sans text-body-md text-on-surface/70">
                We don't just provide games; we assemble experiences. Every ticket, every light, and every gear is calibrated for maximum impact.
              </p>
            </div>
            <div className="hidden h-1.5 w-32 rounded-full bg-primary md:block" />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-lg bg-surface-container-lowest p-10 shadow-ambient">
              <Sparkles className="mb-6 h-10 w-10 text-primary" />
              <h3 className="font-epilogue text-title-lg font-black uppercase tracking-tight">High-Octane Fun</h3>
              <p className="mt-4 font-work-sans text-body-sm leading-relaxed text-on-surface/70">
                Velocity is our baseline. We curate games that challenge reflexes and ignite the competitive spirit.
              </p>
            </article>
            <article className="rounded-lg bg-surface-container-lowest p-10 shadow-ambient">
              <Settings className="mb-6 h-10 w-10 text-primary" />
              <h3 className="font-epilogue text-title-lg font-black uppercase tracking-tight">Precision Engineering</h3>
              <p className="mt-4 font-work-sans text-body-sm leading-relaxed text-on-surface/70">
                Our floor is a living machine. From prize distribution to climate control, every detail is optimized for your comfort and thrill.
              </p>
            </article>
            <article className="rounded-lg bg-surface-container-lowest p-10 shadow-ambient md:col-span-2 lg:col-span-1">
              <Trophy className="mb-6 h-10 w-10 text-primary" />
              <h3 className="font-epilogue text-title-lg font-black uppercase tracking-tight">Unrivaled Quality</h3>
              <p className="mt-4 font-work-sans text-body-sm leading-relaxed text-on-surface/70">
                We maintain the highest standards. If it isn't the best version of the game, it doesn't belong on our floor.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-surface-container-lowest px-6 py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-8 md:grid-cols-12">
          <div className="flex flex-col justify-between rounded-lg bg-gradient-primary p-12 text-on-primary shadow-ambient md:col-span-4">
            <div>
              <h2 className="font-epilogue text-display-md font-black italic tracking-tight">
                SINCE
                <br />
                {BUSINESS_INFO.established}
              </h2>
              <p className="mt-6 font-work-sans text-body-lg opacity-90">
                A legacy built on laughter and high-scores. We've been the heart of the city's entertainment for nearly two decades.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:col-span-8">
            <div className="relative min-h-[300px] overflow-hidden rounded-lg bg-surface-container-high shadow-ambient">
              <PhotoFramePlaceholder title="Founding Photo" note="Replace with early arcade photo" />
            </div>
            <div className="relative min-h-[300px] overflow-hidden rounded-lg bg-surface-container-high shadow-ambient">
              <PhotoFramePlaceholder title="Modern Arcade Photo" note="Replace with current floor photo" />
            </div>
            <div className="relative overflow-hidden rounded-lg bg-surface-container-low p-12 sm:col-span-2">
              <h4 className="font-epilogue text-title-lg font-black uppercase italic text-primary">Growing the Machine</h4>
              <p className="mb-8 mt-6 font-work-sans text-body-md leading-relaxed text-on-surface/70">
                What started as a small collection of 15 classic machines in an industrial warehouse has evolved into a multisensory playground.
              </p>
              <div className="flex flex-wrap items-center gap-10">
                <div className="text-center">
                  <div className="font-epilogue text-4xl font-black">150+</div>
                  <div className="mt-1 font-work-sans text-label-sm uppercase tracking-widest text-primary">Machines</div>
                </div>
                <div className="h-10 w-px bg-outline-variant/40" />
                <div className="text-center">
                  <div className="font-epilogue text-4xl font-black">2M+</div>
                  <div className="mt-1 font-work-sans text-label-sm uppercase tracking-widest text-primary">Happy Souls</div>
                </div>
                <div className="h-10 w-px bg-outline-variant/40" />
                <div className="text-center">
                  <div className="font-epilogue text-4xl font-black">50k</div>
                  <div className="mt-1 font-work-sans text-label-sm uppercase tracking-widest text-primary">Prizes Won</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-24" style={{ backgroundImage: blueprintPattern }}>
        <div className="relative mx-auto max-w-4xl rounded-3xl border-4 border-primary bg-on-surface p-12 text-center text-on-primary shadow-ambient md:p-20">
          <h2 className="font-epilogue text-headline-lg font-black uppercase italic tracking-tight md:text-display-md">
            Ready to Start the Machine?
          </h2>
          <p className="mx-auto mb-12 mt-8 max-w-xl font-work-sans text-body-md opacity-80">
            Join the thousands of visitors who have found their smile at the Factory. Book your visit or party today.
          </p>
          <div className="flex flex-col justify-center gap-6 sm:flex-row">
            <Link href="/parties" className="rounded-full bg-gradient-primary px-12 py-5 font-work-sans text-label-lg uppercase text-on-primary shadow-ambient ring-4 ring-primary/20 transition-transform hover:scale-105">
              Reserve Now
            </Link>
            <Link href="/pricing" className="rounded-full bg-primary px-12 py-5 font-work-sans text-label-lg uppercase text-on-primary shadow-ambient ring-4 ring-primary/20 transition-all hover:bg-primary/90">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
