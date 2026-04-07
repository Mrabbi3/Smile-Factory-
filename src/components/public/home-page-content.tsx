'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { ArrowRight, Cake, Coins, Gamepad2, Gift, Star, Users } from 'lucide-react'
import { BUSINESS_INFO, TOKEN_PRICING } from '@/lib/constants'

const features = [
  {
    icon: Gamepad2,
    title: `${BUSINESS_INFO.machineCount}+ Games`,
    description: 'Will eventually be a clickable link with photos of all arcade games.',
    cta: 'Browse Games',
    href: '/gallery',
  },
  {
    icon: Cake,
    title: 'Birthday Parties',
    description: 'Goes to the book a party link for seamless party planning and massive fun.',
    cta: 'Plan a Party',
    href: '/parties',
  },
  {
    icon: Gift,
    title: 'Prize Counter',
    description:
      'Win tickets and redeem them for awesome prizes. From giant plushies to high-tech gadgets!',
    tags: ['Tickets', 'Rewards'],
  },
  {
    icon: Users,
    title: 'Family Fun',
    description:
      'A safe, clean, and welcoming space where families make memories together across generations.',
    quote: "Making Brigantine Smile Since '06",
  },
] as const

const socialPlaceholders = [
  { alt: 'Arcade Action', note: 'Future arcade action photo' },
  { alt: 'Family Fun', note: 'Future family fun photo' },
  { alt: 'Prize Ticket', note: 'Future prize photo' },
  { alt: 'Claw Win', note: 'Future claw-machine photo' },
] as const

const factoryPattern =
  "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm20 20l20 20M0 40L20 20M20 0l20 20M0 20L20 0' stroke='%23e5e7eb' stroke-width='0.5' fill='none'/%3E%3C/svg%3E\")"

type Review = {
  author: string
  role: string
  text: string
}

const initialReviews: Review[] = [
  {
    author: 'Sarah M.',
    role: 'Family Vacationer',
    text: 'Best arcade in Brigantine! We come every summer and the kids never want to leave. The prizes are actually worth the tickets!',
  },
  {
    author: 'David L.',
    role: 'Local Parent',
    text: "Had my son's 8th birthday here. Everything was so organized, the staff was amazing, and the kids had a blast. Highly recommend the party packages.",
  },
]

const reviewStorageKey = 'smile-factory-home-reviews'

export default function HomePageContent() {
  const [selectedPackage, setSelectedPackage] = useState<number>(10)
  const [activeReviewTab, setActiveReviewTab] = useState<'reviews' | 'form'>('reviews')
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [reviewForm, setReviewForm] = useState({ author: '', role: '', text: '' })

  useEffect(() => {
    const storedReviews = window.localStorage.getItem(reviewStorageKey)

    if (!storedReviews) {
      return
    }

    try {
      const parsed = JSON.parse(storedReviews) as Review[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        setReviews([...initialReviews, ...parsed])
      }
    } catch {
      window.localStorage.removeItem(reviewStorageKey)
    }
  }, [])

  function handleSubmitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedReview: Review = {
      author: reviewForm.author.trim(),
      role: reviewForm.role.trim(),
      text: reviewForm.text.trim(),
    }

    if (!trimmedReview.author || !trimmedReview.role || !trimmedReview.text) {
      return
    }

    const updatedCustomReviews = [...reviews.slice(initialReviews.length), trimmedReview]
    const updatedReviews = [...initialReviews, ...updatedCustomReviews]

    setReviews(updatedReviews)
    window.localStorage.setItem(reviewStorageKey, JSON.stringify(updatedCustomReviews))
    setReviewForm({ author: '', role: '', text: '' })
    setActiveReviewTab('reviews')
  }

  return (
    <>
      <header className="relative isolate min-h-[920px] overflow-hidden bg-white px-6 pb-24 pt-36">
        <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: factoryPattern }} />
        <div className="pointer-events-none absolute left-[-10rem] top-[22%] size-[36rem] rounded-full bg-red-100/40 blur-[110px]" />
        <div className="pointer-events-none absolute bottom-[-10rem] right-[-10rem] size-[42rem] rounded-full bg-red-100/30 blur-[130px]" />
        <div className="relative z-10 mx-auto max-w-6xl text-center">
          <span className="mb-8 inline-flex rounded-full border border-red-200 bg-red-100/80 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-red-700">
            Family Fun Since {BUSINESS_INFO.established}
          </span>
          <p className="mb-4 text-3xl font-black uppercase italic tracking-tight text-zinc-400 md:text-4xl">
            Welcome to
          </p>
          <img
            src="/branding/smile-factory-logo.png"
            alt="The Smile Factory Logo"
            className="mx-auto mb-6 h-auto w-full max-w-[500px] drop-shadow-2xl transition-transform duration-700 hover:scale-105"
          />
          <h1
            className="mb-6 text-5xl font-black uppercase italic leading-[0.9] tracking-tighter text-red-600 md:text-7xl"
            style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.1), 0 0 10px rgba(255,0,0,0.2)' }}
          >
            The Smile Factory!
          </h1>
          <p className="mx-auto mb-12 max-w-2xl text-lg text-zinc-600 md:text-xl">
            Brigantine&apos;s favorite arcade and family fun center. With over {BUSINESS_INFO.machineCount}{' '}
            games, birthday party packages, and a prize counter bursting with rewards - smiles are guaranteed!
          </p>
          <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Link
              href="/parties"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-red-600 to-red-700 px-10 py-4 text-lg font-black text-white shadow-xl transition hover:opacity-90 sm:w-auto"
            >
              Book a Party
              <Cake className="size-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-10 py-4 text-lg font-black text-white shadow-xl transition hover:bg-red-700 sm:w-auto"
            >
              View Pricing
              <Coins className="size-5" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative bg-zinc-50/80 px-8 py-24">
        <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: factoryPattern }} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h2 className="mb-3 text-4xl font-black tracking-tight text-zinc-900 md:text-5xl">
                Why Families Love Us
              </h2>
              <p className="text-lg text-zinc-600">
                Everything you need for an unforgettable day of fun, all under one roof.
              </p>
            </div>
            <div className="h-1.5 w-32 rounded-full bg-red-600" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-10 shadow-sm transition hover:shadow-xl"
              >
                <div className="mb-8 flex size-16 items-center justify-center rounded-2xl border border-red-200 bg-red-100 text-red-600">
                  <feature.icon className="size-8" />
                </div>
                <h3 className="mb-4 text-2xl font-black uppercase tracking-tight">{feature.title}</h3>
                <p className="mb-7 text-lg text-zinc-600">{feature.description}</p>
                {'cta' in feature && feature.cta && 'href' in feature && feature.href && (
                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-red-600"
                  >
                    {feature.cta}
                    <ArrowRight className="size-4" />
                  </Link>
                )}
                {'tags' in feature && feature.tags && (
                  <div className="flex gap-3">
                    {feature.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-zinc-200 bg-zinc-100 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-zinc-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {'quote' in feature && feature.quote && (
                  <p className="text-md font-black italic text-red-600">&quot;{feature.quote}&quot;</p>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-8 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-black uppercase italic tracking-tight md:text-5xl">Token Pricing</h2>
            <p className="text-lg text-zinc-600">Stock up and save! The more you play, the more you win.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TOKEN_PRICING.map((tier) => {
              const isPopular = tier.price === 10
              const isSelected = selectedPackage === tier.price

              return (
                <button
                  key={tier.price}
                  type="button"
                  onClick={() => setSelectedPackage(tier.price)}
                  className={`relative flex min-h-[22rem] flex-col items-center rounded-2xl p-10 text-center transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                    isSelected
                      ? 'border-4 border-red-600 bg-red-50 shadow-2xl'
                      : isPopular
                        ? 'border-4 border-red-300 bg-zinc-50 shadow-xl'
                        : 'border-2 border-transparent bg-zinc-50 hover:border-red-600/20'
                  }`}
                  aria-pressed={isSelected}
                >
                  {isPopular && (
                    <div className="absolute -top-5 rounded-full bg-red-600 px-6 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-white shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <span className="mb-6 text-6xl font-black text-red-600">${tier.price}</span>
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

      <section className="relative overflow-hidden border-y border-gray-200 bg-zinc-50 px-8 py-24">
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: factoryPattern }} />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-4">
              <div className="h-px w-12 bg-red-600" />
              <span className="text-sm font-black uppercase tracking-[0.2em] text-red-600">Live Social Feed</span>
              <div className="h-px w-12 bg-red-600" />
            </div>
            <h2 className="mb-4 text-4xl font-black uppercase italic tracking-tight md:text-5xl">Join the Factory Floor</h2>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600">
              Follow us for weekly high scores, prize updates, and community smiles! Tag us in your photos to be featured.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {socialPlaceholders.map((item) => (
              <div key={item.alt} className="overflow-hidden rounded-2xl border-[4px] border-black bg-white shadow-xl">
                <div className="flex aspect-square flex-col items-center justify-center gap-3 bg-zinc-100 px-6 text-center">
                  <div className="size-12 rounded-full border-2 border-dashed border-red-300 bg-white" />
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800">{item.alt}</p>
                  <p className="text-sm text-zinc-500">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="border-t border-zinc-100 bg-white px-8 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 flex overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveReviewTab('reviews')}
              className={`flex-1 rounded-xl py-4 text-center text-xs font-black uppercase tracking-[0.2em] transition ${
                activeReviewTab === 'reviews'
                  ? 'border border-zinc-200 bg-white text-red-600 shadow-sm'
                  : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-red-600'
              }`}
            >
              Real Reviews
            </button>
            <button
              type="button"
              onClick={() => setActiveReviewTab('form')}
              className={`flex-1 rounded-xl py-4 text-center text-xs font-black uppercase tracking-[0.2em] transition ${
                activeReviewTab === 'form'
                  ? 'border border-zinc-200 bg-white text-red-600 shadow-sm'
                  : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-red-600'
              }`}
            >
              Leave a Review
            </button>
          </div>
          {activeReviewTab === 'reviews' ? (
            <div className="space-y-8">
              {reviews.map((review, idx) => (
                <article key={`${review.author}-${idx}`} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-10">
                  <div className="mb-6 flex gap-1 text-red-600">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-5 fill-red-600 text-red-600" />
                    ))}
                  </div>
                  <p className="mb-6 text-xl italic leading-relaxed text-zinc-800">&quot;{review.text}&quot;</p>
                  <div className="flex items-center gap-4">
                    <div className="h-1 w-10 rounded-full bg-red-600" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                      {review.author}, {review.role}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-8 shadow-sm md:p-10">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Your Name</label>
                  <input
                    value={reviewForm.author}
                    onChange={(event) => setReviewForm((current) => ({ ...current, author: event.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-5 py-4 text-zinc-900 outline-none transition focus:border-red-600"
                    placeholder="Jane D."
                    type="text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Your Role</label>
                  <input
                    value={reviewForm.role}
                    onChange={(event) => setReviewForm((current) => ({ ...current, role: event.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-5 py-4 text-zinc-900 outline-none transition focus:border-red-600"
                    placeholder="Local Parent"
                    type="text"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Your Review</label>
                <textarea
                  value={reviewForm.text}
                  onChange={(event) => setReviewForm((current) => ({ ...current, text: event.target.value }))}
                  className="min-h-[160px] w-full rounded-xl border border-zinc-200 bg-white px-5 py-4 text-zinc-900 outline-none transition focus:border-red-600"
                  placeholder="Tell other families what made your visit great."
                  required
                />
              </div>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg transition hover:bg-red-700"
                >
                  Post Review
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReviewTab('reviews')}
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-8 py-4 text-sm font-black uppercase tracking-[0.2em] text-zinc-700 transition hover:border-red-600 hover:text-red-600"
                >
                  Back to Reviews
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  )
}