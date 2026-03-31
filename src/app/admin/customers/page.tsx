'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { safeFormatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, Search } from 'lucide-react'
import type { Profile } from '@/types/database'

export default function CustomersPage() {
  const supabase = createClient()
  const [customers, setCustomers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('role', 'customer').order('created_at', { ascending: false })
        setCustomers((data as Profile[]) || [])
      } catch (err) {
        console.error('Failed to load customers:', err)
        toast.error('Failed to load customers')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = customers.filter(c =>
    !search || `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">Customer directory and accounts</p>
      </div>

      <Card className="rounded-2xl shadow-ambient">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Users className="h-4 w-4" /></div>Total Customers</CardTitle></CardHeader>
        <CardContent><div className="font-display text-3xl font-bold">{customers.length}</div></CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 rounded-xl" />
      </div>

      <Card className="rounded-2xl shadow-ambient">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-display tracking-tight">Name</TableHead>
                <TableHead className="font-display tracking-tight">Email</TableHead>
                <TableHead className="font-display tracking-tight">Phone</TableHead>
                <TableHead className="font-display tracking-tight">Status</TableHead>
                <TableHead className="font-display tracking-tight">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{loading ? 'Loading...' : 'No customers found'}</TableCell></TableRow>
              ) : filtered.map(c => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{c.first_name?.[0]}{c.last_name?.[0]}</AvatarFallback></Avatar>
                      <span className="font-medium">{c.first_name} {c.last_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.phone || '—'}</TableCell>
                  <TableCell>{c.is_active ? <Badge className="bg-success text-success-foreground">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{safeFormatDate(c.created_at, 'MMM dd, yyyy')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
