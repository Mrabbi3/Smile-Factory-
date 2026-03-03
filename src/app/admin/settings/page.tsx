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
import { Settings, Save } from 'lucide-react'

export default function SettingsPage() {
  const { user, isOwner } = useAuth()
  const supabase = createClient()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('system_settings').select('*')
      const map: Record<string, string> = {}
      ;(data || []).forEach((s: any) => { map[s.key] = s.value })
      setSettings(map)
      setLoading(false)
    }
    load()
  }, [])

  const updateSetting = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value })
  }

  const saveSettings = async () => {
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
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure business parameters</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Settings</CardTitle>
          <CardDescription>Core operational parameters for The Smile Factory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settingFields.map(f => (
            <div key={f.key} className="grid gap-2">
              <Label>{f.label}</Label>
              <Input
                type="number"
                value={settings[f.key] || ''}
                onChange={(e) => updateSetting(f.key, e.target.value)}
                disabled={!isOwner()}
              />
              <p className="text-xs text-muted-foreground">{f.description}</p>
            </div>
          ))}
          <Separator />
          {isOwner() && (
            <Button onClick={saveSettings} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          )}
          {!isOwner() && (
            <p className="text-sm text-muted-foreground">Only owners can modify system settings.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}