'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Row = {
  id: string
  operator_name: string
  email: string
  mission_type: string | null
  message: string
  status: string
  created_at: string
}

export default function AdminInquiriesPage() {
  const sb = createClient()
  const [rows, setRows] = useState<Row[]>([])
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'resolved'>('all')
  const [viewTarget, setViewTarget] = useState<Row | null>(null)

  useEffect(() => {
    sb.from('staff_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setRows((data as Row[]) ?? []))
  }, [sb])

  const visible = filter === 'all' ? rows : rows.filter((r) => r.status === filter)

  const setStatus = async (id: string, status: string) => {
    await sb.from('staff_inquiries').update({ status }).eq('id', id)
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  const openMessage = (row: Row) => {
    setViewTarget(row)
    // Mark a brand-new inquiry as read once it's opened.
    if (row.status === 'new') void setStatus(row.id, 'read')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black font-display">Customer inquiries</h1>
      <div className="flex gap-2 flex-wrap">
        {(['all', 'new', 'read', 'resolved'] as const).map((f) => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>From</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="font-medium">{r.operator_name}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{r.mission_type || '—'}</TableCell>
                  <TableCell>
                    <Badge>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button variant="secondary" size="sm" type="button" onClick={() => openMessage(r)}>
                      View
                    </Button>
                    <Button variant="outline" size="sm" type="button" onClick={() => void setStatus(r.id, 'read')}>
                      Read
                    </Button>
                    <Button size="sm" type="button" onClick={() => void setStatus(r.id, 'resolved')}>
                      Resolve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {visible.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No inquiries yet.</p>}
        </CardContent>
      </Card>

      <Dialog open={!!viewTarget} onOpenChange={(open) => { if (!open) setViewTarget(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-black tracking-tight">
              {viewTarget?.operator_name}
            </DialogTitle>
            <DialogDescription>
              {viewTarget?.email}
              {viewTarget?.created_at
                ? ` · ${new Date(viewTarget.created_at).toLocaleString()}`
                : ''}
            </DialogDescription>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {viewTarget.mission_type && (
                  <Badge variant="outline">{viewTarget.mission_type}</Badge>
                )}
                <Badge>{viewTarget.status}</Badge>
              </div>
              <div className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm leading-relaxed text-foreground">
                {viewTarget.message}
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            {viewTarget?.email && (
              <Button asChild variant="outline">
                <a href={`mailto:${viewTarget.email}`}>Reply by email</a>
              </Button>
            )}
            {viewTarget && (
              <Button
                type="button"
                onClick={() => {
                  void setStatus(viewTarget.id, 'resolved')
                  setViewTarget(null)
                }}
              >
                Mark resolved
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
