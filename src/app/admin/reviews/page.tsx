'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type SiteReview = {
  id: string
  body: string
  rating: number
  approved: boolean
  reviewer_name: string | null
  created_at: string
}

export default function AdminReviewsPage() {
  const sb = createClient()
  const [rows, setRows] = useState<SiteReview[]>([])

  useEffect(() => {
    sb.from('site_reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setRows((data as SiteReview[]) ?? []))
  }, [sb])

  const approve = async (id: string, approved: boolean) => {
    await sb.from('site_reviews').update({ approved }).eq('id', id)
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, approved } : r)))
  }

  const pending = rows.filter((r) => !r.approved)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black font-display">Review moderation</h1>
      <p className="text-sm text-muted-foreground">Approve on-site reviews before they appear on the home page.</p>
      <div className="grid gap-4">
        {pending.map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle className="text-base flex justify-between gap-4">
                <span>{r.reviewer_name || 'Customer'}</span>
                <span className="text-muted-foreground text-sm">{r.rating}★</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm whitespace-pre-wrap">{r.body}</p>
              <div className="flex gap-2">
                <Button type="button" onClick={() => void approve(r.id, true)}>
                  Approve
                </Button>
                <Button type="button" variant="destructive" onClick={() => void approve(r.id, false)}>
                  Hide (keep unpublished)
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {pending.length === 0 && <Card><CardContent className="py-10 text-center text-muted-foreground text-sm">No pending reviews.</CardContent></Card>}
      </div>
    </div>
  )
}
