import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const auth = request.headers.get('authorization')
  if (cronSecret && auth !== `Bearer ${cronSecret}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID_SMILE_FACTORY
  if (!key || !placeId) {
    return NextResponse.json({ ok: false, message: 'Missing Google env vars' })
  }

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'reviews')
  url.searchParams.set('key', key)

  const res = await fetch(url.toString())
  const json = (await res.json()) as {
    result?: { reviews?: { author_name?: string; rating?: number; text?: string; time?: number }[] }
  }

  if (json.result?.reviews == null) {
    return NextResponse.json({ ok: false, message: 'No reviews in Places response' })
  }

  const supabase = await createClient()
  let n = 0
  for (const r of json.result.reviews) {
    const googleId = `${placeId}-${r.time ?? r.text?.slice(0, 20)}`
    await supabase.from('cached_google_reviews').upsert(
      {
        google_review_id: googleId.slice(0, 200),
        author_name: r.author_name ?? 'Google user',
        rating: r.rating ?? null,
        body: (r.text ?? '').slice(0, 8000),
        created_at_google: r.time ? new Date(r.time * 1000).toISOString() : null,
      },
      { onConflict: 'google_review_id' }
    )
    n++
  }

  return NextResponse.json({ ok: true, count: n })
}
