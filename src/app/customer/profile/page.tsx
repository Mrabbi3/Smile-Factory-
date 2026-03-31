'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Save, Lock } from 'lucide-react'

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const supabase = createClient()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  })

  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
      })
    }
  }, [profile])
  const [saving, setSaving] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ password: '', confirm: '' })
  const [changingPassword, setChangingPassword] = useState(false)

  const updateProfile = async () => {
    if (!form.first_name || !form.last_name) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles')
        .update({ first_name: form.first_name, last_name: form.last_name, phone: form.phone })
        .eq('id', user?.id)
      if (error) throw error
      toast.success('Profile updated')
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const updatePassword = async () => {
    if (passwordForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (passwordForm.password !== passwordForm.confirm) {
      toast.error('Passwords do not match')
      return
    }
    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordForm.password })
      if (error) throw error
      toast.success('Password updated')
      setPasswordForm({ password: '', confirm: '' })
    } catch (err: any) { toast.error(err.message) }
    finally { setChangingPassword(false) }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Card className="rounded-2xl shadow-ambient">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/10">
              <AvatarFallback className="text-lg font-bold bg-primary/5 text-primary">{profile?.first_name?.[0]}{profile?.last_name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-display tracking-tight">{profile?.first_name} {profile?.last_name}</CardTitle>
              <CardDescription>{profile?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="my-0" />
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-display">First Name</Label>
              <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="font-display">Last Name</Label>
              <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-display">Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="font-display">Email</Label>
            <Input value={profile?.email || ''} disabled className="rounded-xl bg-[var(--surface-container-low)]" />
          </div>
          <Button onClick={updateProfile} disabled={saving} className="rounded-xl w-full">
            <Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-ambient">
        <CardHeader>
          <CardTitle className="font-display tracking-tight flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <Separator className="my-0" />
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label className="font-display">New Password</Label>
            <Input type="password" value={passwordForm.password} onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="font-display">Confirm Password</Label>
            <Input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="rounded-xl" />
          </div>
          <Button variant="outline" onClick={updatePassword} disabled={changingPassword} className="rounded-xl w-full">
            {changingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
