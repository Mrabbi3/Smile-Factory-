'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

type Alert = {
  id: string
  message: string
  active: boolean
  starts_at: string
  ends_at: string | null
}

export default function AdminAlertsPage() {
  const { user } = useAuth()
  const sb = createClient()
  const [items, setItems] = useState<Alert[]>([])
  const [draft, setDraft] = useState('')

  const load = () => {
    sb.from('site_alerts').select('*').order('starts_at', { ascending: false }).then(({ data }) => setItems((data as Alert[]) ?? []))
  }

  useEffect(() => {
    load()
  }, [sb])

  const create = async () => {
    if (!user || !draft.trim()) return
    await sb.from('site_alerts').insert({ message: draft.trim(), created_by: user.id, active: true })
    setDraft('')
    load()
  }

  const toggle = async (id: string, active: boolean) => {
    await sb.from('site_alerts').update({ active }).eq('id', id)
    load()
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-black font-display">Site alerts marquee</h1>
      <Card>
        <CardHeader>
          <CardTitle>New announcement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="msg">Message</Label>
            <Input id="msg" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Closing at 9pm tonight" />
          </div>
          <Button type="button" className="w-full" onClick={() => void create()}>
            Post alert
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-xl border p-4 gap-4">
            <p className="text-sm flex-1">{a.message}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Active</span>
              <Switch checked={a.active} onCheckedChange={(v) => void toggle(a.id, v)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
