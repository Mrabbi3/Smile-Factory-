import Link from 'next/link'
import type { Metadata } from 'next'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Reviews | The Smile Factory',
  description:
    'All guest reviews and Google reviews for The Smile Factory arcade in Brigantine, NJ.',
}

// Render server-side so this page never feels frozen waiting for client-side
// Supabase calls. Aggregates on-site reviews and cached Google reviews.
export const revalidate = 60

type Review = {
  author: string
  role: string
  body: string
  rating: number | null
  source: 'site' | 'google'
}

async function loadAllReviews(): Promise<Review[]> {
  try {
    const sb = await createClient()
    const [siteRes, gRes] = await Promise.all([
      sb
        .from('site_reviews')
        .select('body, reviewer_name, reviewer_role, rating, created_at')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(60),
      sb
        .from('cached_google_reviews')
        .select('author_name, body, rating, fetched_at')
        .order('fetched_at', { ascending: false })
        .limit(60),
    ])

    const out: Review[] = []
    for (const r of siteRes.data ?? []) {
      out.push({
        author: ((r.reviewer_name as string) || '').trim() || 'Guest',
        role: ((r.reviewer_role as string) || '').trim() || 'Visitor',
        body: String(r.body || ''),
        rating: typeof r.rating === 'number' ? r.rating : null,
        source: 'site',
      })
    }
    for (const r of gRes.data ?? []) {
      out.push({
        author: ((r.author_name as string) || '').trim() || 'Google reviewer',
        role: 'Google',
        body: String(r.body || ''),
        rating: typeof r.rating === 'number' ? r.rating : null,
        source: 'google',
      })
    }
    return out
  } catch {
    return []
  }
}

const FALLBACK: Review[] = [
  {
    author: 'Sarah M.',
    role: 'Family Vacationer',
    body:
      'Best arcade in Brigantine! We come every summer and the kids never want to leave.',
    rating: 5,
    source: 'site',
  },
  {
    author: 'David L.',
    role: 'Local Parent',
    body: "Had my son's 8th birthday here. The staff was amazing and the kids had a blast.",
    rating: 5,
    source: 'site',
  },
]

export default async function ReviewsPage() {
  const reviews = await loadAllReviews()
  const list = reviews.length > 0 ? reviews : FALLBACK

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black tracking-tight">Reviews</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Every guest review &mdash; on-site submissions plus our latest Google reviews.
          </p>
        </div>
        <Link
          href="/#reviews"
          className="inline-flex rounded-full border border-zinc-200 bg-white px-5 py-2 text-xs font-black uppercase tracking-widest text-zinc-700 transition hover:border-primary hover:text-primary"
        >
          Back to home
        </Link>
      </div>

      <div className="space-y-6">
        {list.map((review, idx) => (
          <article
            key={`${review.source}-${idx}-${review.author}`}
            className="rounded-2xl border border-zinc-100 bg-zinc-50 p-8"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex gap-1 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < (review.rating ?? 5)
                        ? 'size-4 fill-primary text-primary'
                        : 'size-4 text-zinc-300'
                    }
                  />
                ))}
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                {review.source === 'google' ? 'Google' : 'Site review'}
              </span>
            </div>
            <p className="text-base italic leading-relaxed text-zinc-800">
              &ldquo;{review.body}&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="h-1 w-10 rounded-full bg-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
                {review.author} &mdash; {review.role}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/login?redirect=/customer/leave-review"
          className="inline-flex rounded-full bg-primary px-8 py-3 text-sm font-black uppercase tracking-widest text-primary-foreground shadow-lg transition hover:opacity-90"
        >
          Leave your own review
        </Link>
      </div>
    </div>
  )
}
