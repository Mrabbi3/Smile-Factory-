'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Settings, Save, KeyRound } from 'lucide-react'

export default function SettingsPage() {
  const { user, isOwner } = useAuth()
  const supabase = createClient()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('system_settings').select('*')
        const map: Record<string, string> = {}
        ;(data || []).forEach((s: { key: string; value: string }) => {
          map[s.key] = s.value
        })
        setSettings(map)
      } catch (err) {
        console.error('Failed to load settings:', err)
        toast.error(err instanceof Error ? err.message : 'Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [supabase])

  const updateSetting = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value })
  }

  const saveSettings = async () => {
    if (!user?.id) {
      toast.error('You must be logged in')
      return
    }
    setSaving(true)
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase.from('system_settings')
          .update({ value, updated_by: user?.id, updated_at: new Date().toISOString() })
          .eq('key', key)
        if (error) throw error
      }
      toast.success('Settings saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
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
          {settingFields.map((f) => (
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
          {isOwner() ? (
            <Button onClick={saveSettings} disabled={saving} size="lg">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          ) : (
            <div className="rounded-xl bg-[var(--surface-container-low)] px-4 py-3 text-sm text-muted-foreground">
              Only owners can modify system settings.
            </div>
          )}
        </CardContent>
      </Card>

      {isOwner() && (
        <Card className="rounded-2xl shadow-ambient">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="font-display tracking-tight">Staff access &amp; roles</CardTitle>
                <CardDescription>How sign-in and roles work right now.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <strong>Staff access key</strong> &mdash; one shared key set in the{' '}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">STAFF_ACCESS_KEY</code>{' '}
              environment variable. Anyone who enters it at <code>/admin/login</code> can sign in
              or create an account, and is recorded as <strong>employee</strong>.
            </p>
            <p>
              <strong>Owner access</strong> &mdash; granted manually. In the Supabase SQL editor:
            </p>
            <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100">
{`UPDATE public.profiles
   SET role = 'owner', updated_at = now()
 WHERE email = 'their-email@example.com';`}
            </pre>
            <p>
              <strong>To change the staff key</strong> &mdash; edit{' '}
              <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs">STAFF_ACCESS_KEY</code> in
              your local <code>.env.local</code> AND in Vercel project settings, then redeploy.
              Tell your team the new key.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
