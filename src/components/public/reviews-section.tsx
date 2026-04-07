'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Star } from 'lucide-react'

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

const STORAGE_KEY = 'smile-factory-home-reviews'

export function ReviewsSection() {
  const [activeTab, setActiveTab] = useState<'reviews' | 'form'>('reviews')
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [form, setForm] = useState({ author: '', role: '', text: '' })

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (!stored) return
      const parsed = JSON.parse(stored) as Review[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        setReviews([...initialReviews, ...parsed])
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed: Review = {
      author: form.author.trim(),
      role: form.role.trim(),
      text: form.text.trim(),
    }
    if (!trimmed.author || !trimmed.role || !trimmed.text) return

    const customReviews = [...reviews.slice(initialReviews.length), trimmed]
    setReviews([...initialReviews, ...customReviews])
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(customReviews))
    setForm({ author: '', role: '', text: '' })
    setActiveTab('reviews')
  }

  return (
    <section id="reviews" className="py-24 px-8 bg-white border-t border-zinc-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-zinc-100 p-1.5 rounded-2xl shadow-inner flex mb-12 overflow-hidden border border-zinc-200">
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-4 text-center text-sm font-black uppercase tracking-widest font-display rounded-xl transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'text-primary bg-white shadow-sm border border-zinc-200'
                : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-primary'
            }`}
          >
            Real Reviews
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-4 text-center text-sm font-black uppercase tracking-widest font-display rounded-xl transition-all cursor-pointer ${
              activeTab === 'form'
                ? 'text-primary bg-white shadow-sm border border-zinc-200'
                : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-primary'
            }`}
          >
            Leave a Review
          </button>
        </div>

        {activeTab === 'reviews' ? (
          <div className="space-y-8">
            {reviews.map((review, idx) => (
              <div
                key={`${review.author}-${idx}`}
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
                    — {review.author}, {review.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-8 shadow-sm md:p-10">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500">
                  Your Name
                </label>
                <input
                  value={form.author}
                  onChange={(e) => setForm((c) => ({ ...c, author: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-5 py-4 text-zinc-900 outline-none transition focus:border-primary"
                  placeholder="Jane D."
                  type="text"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500">
                  Your Role
                </label>
                <input
                  value={form.role}
                  onChange={(e) => setForm((c) => ({ ...c, role: e.target.value }))}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-5 py-4 text-zinc-900 outline-none transition focus:border-primary"
                  placeholder="Local Parent"
                  type="text"
                  required
                />
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500">
                Your Review
              </label>
              <textarea
                value={form.text}
                onChange={(e) => setForm((c) => ({ ...c, text: e.target.value }))}
                className="min-h-[160px] w-full rounded-xl border border-zinc-200 bg-white px-5 py-4 text-zinc-900 outline-none transition focus:border-primary"
                placeholder="Tell other families what made your visit great..."
                required
              />
            </div>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full gradient-primary px-8 py-4 text-sm font-black uppercase tracking-widest text-primary-foreground shadow-lg transition hover:opacity-90"
              >
                Post Review
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-zinc-700 transition hover:border-primary hover:text-primary"
              >
                Back to Reviews
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
