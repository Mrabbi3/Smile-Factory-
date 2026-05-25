'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

type Alert = {
  id: string
  message: string
  active: boolean
  starts_at: string
  ends_at: string | null
}

type DurationPreset = '30m' | '2h' | '6h' | '24h' | '3d' | '7d' | 'none'

const DURATION_MS: Record<Exclude<DurationPreset, 'none'>, number> = {
  '30m': 30 * 60 * 1000,
  '2h': 2 * 3600 * 1000,
  '6h': 6 * 3600 * 1000,
  '24h': 24 * 3600 * 1000,
  '3d': 3 * 24 * 3600 * 1000,
  '7d': 7 * 24 * 3600 * 1000,
}

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AdminAlertsPage() {
  const { user } = useAuth()
  const sb = useMemo(() => createClient(), [])
  const [items, setItems] = useState<Alert[]>([])
  const [draft, setDraft] = useState('')
  const defaultStart = useMemo(() => toDatetimeLocalValue(new Date()), [])
  const [startsAtLocal, setStartsAtLocal] = useState(defaultStart)
  const [duration, setDuration] = useState<DurationPreset>('24h')

  const load = () => {
    sb.from('site_alerts')
      .select('*')
      .order('starts_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error(error.message)
        else setItems((data as Alert[]) ?? [])
      })
  }

  useEffect(() => {
    load()
  }, [sb])

  const create = async () => {
    if (!user) {
      toast.error('You must be signed in.')
      return
    }
    const msg = draft.trim()
    if (!msg) {
      toast.error('Enter a message.')
      return
    }

    const startsAt = startsAtLocal
      ? new Date(startsAtLocal)
      : new Date()

    let ends_at: string | null = null
    if (duration !== 'none') {
      ends_at = new Date(startsAt.getTime() + DURATION_MS[duration]).toISOString()
    }

    const { error } = await sb.from('site_alerts').insert({
      message: msg,
      created_by: user.id,
      active: true,
      starts_at: startsAt.toISOString(),
      ends_at,
    })

    if (error) {
      toast.error(error.message ?? 'Could not save alert')
      return
    }

    toast.success('Alert posted')
    setDraft('')
    setStartsAtLocal(toDatetimeLocalValue(new Date()))
    setDuration('24h')
    load()
  }

  const toggle = async (id: string, active: boolean) => {
    const { error } = await sb.from('site_alerts').update({ active }).eq('id', id)
    if (error) {
      toast.error(error.message)
      return
    }
    load()
  }

  const remove = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return
    const { error } = await sb.from('site_alerts').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Alert deleted')
    load()
  }

  const formatWindow = (a: Alert) => {
    const start = new Date(a.starts_at).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
    const end = a.ends_at
      ? new Date(a.ends_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
      : 'open-ended'
    return `${start} → ${end}`
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-black font-display">Site alerts marquee</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Shown at the top of public pages while active, within start/end windows.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New announcement</CardTitle>
          <CardDescription>Schedule visibility and how long it runs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="msg">Message</Label>
            <Input
              id="msg"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Closing at 9pm tonight"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="starts">Visible from</Label>
            <Input
              id="starts"
              type="datetime-local"
              value={startsAtLocal}
              onChange={(e) => setStartsAtLocal(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Use past or current time to show immediately.</p>
          </div>

          <div className="space-y-2">
            <Label>Duration</Label>
            <Select value={duration} onValueChange={(v) => setDuration(v as DurationPreset)}>
              <SelectTrigger>
                <SelectValue placeholder="Pick duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30m">30 minutes</SelectItem>
                <SelectItem value="2h">2 hours</SelectItem>
                <SelectItem value="6h">6 hours</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
                <SelectItem value="3d">3 days</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="none">
                  Until manually turned off (no end date)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="button" className="w-full" onClick={() => void create()}>
            Post alert
          </Button>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium break-words">{a.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatWindow(a)}</p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Active</span>
                <Switch checked={a.active} onCheckedChange={(v) => void toggle(a.id, v)} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8 rounded-lg"
                onClick={() => void remove(a.id)}
                aria-label="Delete alert"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
