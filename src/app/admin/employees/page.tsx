'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { ROLE_LABELS } from '@/lib/constants'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { UserCog, Users, Search } from 'lucide-react'
import type { Profile } from '@/types/database'

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-purple-100 text-purple-800',
  manager: 'bg-blue-100 text-blue-800',
  employee: 'bg-green-100 text-green-800',
  customer: 'bg-gray-100 text-gray-800',
}

export default function EmployeesPage() {
  const { isOwner } = useAuth()
  const supabase = createClient()
  const [staff, setStaff] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editDialog, setEditDialog] = useState(false)
  const [editing, setEditing] = useState<Profile | null>(null)
  const [editRole, setEditRole] = useState('')
  const [editActive, setEditActive] = useState(true)

  useEffect(() => { loadStaff() }, [])

  const loadStaff = async () => {
    const { data } = await supabase.from('profiles').select('*').neq('role', 'customer').order('role').order('first_name')
    setStaff((data as Profile[]) || [])
    setLoading(false)
  }

  const filtered = staff.filter(s =>
    !search || `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
  )

  const openEdit = (p: Profile) => {
    setEditing(p)
    setEditRole(p.role)
    setEditActive(p.is_active)
    setEditDialog(true)
  }

  const saveChanges = async () => {
    if (!editing) return
    const { error } = await supabase.from('profiles').update({ role: editRole, is_active: editActive }).eq('id', editing.id)
    if (error) toast.error(error.message)
    else { toast.success('Employee updated'); setEditDialog(false); loadStaff() }
  }

  const owners = staff.filter(s => s.role === 'owner').length
  const managers = staff.filter(s => s.role === 'manager').length
  const employees = staff.filter(s => s.role === 'employee').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Employee Management</h1>
        <p className="text-muted-foreground">Staff directory and role management</p>
      </div>

      <div className="grid gap-4 grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Owners</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-purple-600">{owners}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Managers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{managers}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Employees</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{employees}</div></CardContent></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                {isOwner() && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{loading ? 'Loading...' : 'No staff found'}</TableCell></TableRow>
              ) : filtered.map(s => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{s.first_name?.[0]}{s.last_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{s.first_name} {s.last_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{s.email}</TableCell>
                  <TableCell className="text-sm">{s.phone || '—'}</TableCell>
                  <TableCell><Badge className={ROLE_COLORS[s.role]}>{ROLE_LABELS[s.role]}</Badge></TableCell>
                  <TableCell>
                    {s.is_active ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(s.created_at), 'MMM yyyy')}</TableCell>
                  {isOwner() && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>Edit</Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editing?.first_name} {editing?.last_name}</DialogTitle>
            <DialogDescription>Update role and status.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editActive} onCheckedChange={setEditActive} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>Cancel</Button>
            <Button onClick={saveChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}