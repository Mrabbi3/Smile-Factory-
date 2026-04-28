'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Settings, Save, KeyRound, Trash2 } from 'lucide-react'

type AccessKey = {
  id: string
  role: 'owner' | 'employee'
  label: string
  is_active: boolean
  created_at: string
  rotated_at: string | null
}

export default function SettingsPage() {
  const { user, isOwner } = useAuth()
  const supabase = createClient()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('system_settings').select('*')
        const map: Record<string, string> = {}
        ;(data || []).forEach((s: any) => { map[s.key] = s.value })
        setSettings(map)
      } catch (err: any) {
        console.error('Failed to load settings:', err)
        toast.error(err?.message || 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const updateSetting = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value })
  }

  const saveSettings = async () => {
    if (!user?.id) { toast.error('You must be logged in'); return }
    setSaving(true)
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase.from('system_settings')
          .update({ value, updated_by: user?.id, updated_at: new Date().toISOString() })
          .eq('key', key)
        if (error) throw error
      }
      toast.success('Settings saved')
    } catch (err: any) {
      toast.error(err.message)
    } finally { setSaving(false) }
  }

  const settingFields = [
    { key: 'card_minimum', label: 'Card Payment Minimum ($)', description: 'Minimum amount for card transactions' },
    { key: 'party_buffer_minutes', label: 'Party Buffer (minutes)', description: 'Buffer time between party bookings' },
    { key: 'max_kids_before_call', label: 'Max Kids Before Call Required', description: 'Number of kids that triggers phone call requirement' },
    { key: 'deposit_amount', label: 'Party Deposit Amount ($)', description: 'Required deposit for party bookings' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-muted-foreground">Configure business parameters</p>
      </div>

      <Card className="rounded-2xl shadow-ambient">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-display tracking-tight">Business Settings</CardTitle>
              <CardDescription>Core operational parameters for The Smile Factory</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {settingFields.map(f => (
            <div key={f.key} className="grid gap-2">
              <Label className="font-medium">{f.label}</Label>
              <Input
                type="number"
                value={settings[f.key] || ''}
                onChange={(e) => updateSetting(f.key, e.target.value)}
                disabled={!isOwner()}
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">{f.description}</p>
            </div>
          ))}
          <Separator />
          {isOwner() && (
            <Button onClick={saveSettings} disabled={saving} size="lg">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          )}
          {!isOwner() && (
            <div className="rounded-xl bg-[var(--surface-container-low)] px-4 py-3 text-sm text-muted-foreground">
              Only owners can modify system settings.
            </div>
          )}
        </CardContent>
      </Card>

      {isOwner() && <AccessKeysCard />}
    </div>
  )
}

// =====================================================================
// Access keys — owner-only management for staff/owner sign-in keys.
// =====================================================================
function AccessKeysCard() {
  const supabase = useMemo(() => createClient(), [])
  const [keys, setKeys] = useState<AccessKey[]>([])
  const [loading, setLoading] = useState(true)
  const [draftKey, setDraftKey] = useState('')
  const [draftRole, setDraftRole] = useState<'owner' | 'employee'>('employee')
  const [draftLabel, setDraftLabel] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('access_keys')
      .select('id, role, label, is_active, created_at, rotated_at')
      .order('created_at', { ascending: false })
    if (error) {
      toast.error(error.message)
      setKeys([])
    } else {
      setKeys((data ?? []) as AccessKey[])
    }
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const create = async () => {
    const v = draftKey.trim()
    if (v.length < 4) {
      toast.error('Key must be at least 4 characters')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.rpc('create_access_key', {
      p_key: v,
      p_role: draftRole,
      p_label: draftLabel.trim() || `${draftRole} key`,
    })
    setSubmitting(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Access key created. Share it with the team — it cannot be re-displayed.')
    setDraftKey('')
    setDraftLabel('')
    void load()
  }

  const toggle = async (id: string, is_active: boolean) => {
    const { error } = await supabase
      .from('access_keys')
      .update({ is_active, rotated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      toast.error(error.message)
      return
    }
    void load()
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this access key? Anyone using it will lose access.')) return
    const { error } = await supabase.from('access_keys').delete().eq('id', id)
    if (error) {
      toast.error(error.message)
      return
    }
    void load()
  }

  return (
    <Card className="rounded-2xl shadow-ambient">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="font-display tracking-tight">Staff &amp; Owner Access Keys</CardTitle>
            <CardDescription>
              Single login page, two key types. Owner key promotes the signed-in user to
              <strong className="font-semibold"> owner</strong> (full access including revenue, expenses, employees);
              employee key promotes to <strong className="font-semibold">employee</strong> (operations only).
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Role this key grants</Label>
            <Select value={draftRole} onValueChange={(v) => setDraftRole(v as 'owner' | 'employee')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee (staff)</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Label (visible to owner only)</Label>
            <Input
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              placeholder={draftRole === 'owner' ? 'Owner key — keep secret' : 'Counter staff key'}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>New access key</Label>
            <Input
              type="text"
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              placeholder="Pick something memorable but unique (e.g. brigantine-2026-staff)"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Stored hashed. You won&rsquo;t be able to read this key back later — copy it before saving.
            </p>
          </div>
        </div>

        <Button onClick={() => void create()} disabled={submitting || !draftKey}>
          <KeyRound className="mr-2 h-4 w-4" />
          {submitting ? 'Saving…' : 'Create access key'}
        </Button>

        <Separator />

        <div className="space-y-3">
          <h3 className="font-medium">Active keys</h3>
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && keys.length === 0 && (
            <p className="text-sm text-muted-foreground">No keys yet — create one above.</p>
          )}
          {keys.map((k) => (
            <div
              key={k.id}
              className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary">
                    {k.role}
                  </span>
                  <span className="text-sm font-medium break-words">{k.label}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Created {new Date(k.created_at).toLocaleString()}
                  {k.rotated_at ? ` · rotated ${new Date(k.rotated_at).toLocaleString()}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Active</span>
                  <Switch
                    checked={k.is_active}
                    onCheckedChange={(v) => void toggle(k.id, v)}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void remove(k.id)}
                  aria-label="Delete access key"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
