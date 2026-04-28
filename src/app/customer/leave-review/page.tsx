'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function LeaveReviewPage() {
  const { user, profile } = useAuth()
  const sb = createClient()
  const router = useRouter()
  const [body, setBody] = useState('')
  const [rating, setRating] = useState(5)

  const submit = async () => {
    if (!user || !profile) return
    const t = body.trim()
    if (t.length < 8) {
      toast.error('Please write a bit more detail.')
      return
    }
    const { error } = await sb.from('site_reviews').insert({
      customer_id: user.id,
      body: t,
      rating,
      approved: false,
      reviewer_name: `${profile.first_name} ${profile.last_name}`.trim(),
    })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Thanks! Your review will appear after staff approval.')
    router.push('/customer/dashboard')
  }

  if (!user) {
    return <Card><CardHeader><CardTitle>Sign in required</CardTitle></CardHeader></Card>
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="font-display text-3xl font-bold">Leave a review</h1>
      <Card>
        <CardHeader>
          <CardTitle>How was your visit?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stars">Rating</Label>
            <input
              id="stars"
              type="range"
              min={1}
              max={5}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">{rating} / 5</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Your review</Label>
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
          </div>
          <Button type="button" className="w-full rounded-xl" onClick={() => void submit()}>
            Submit for approval
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
