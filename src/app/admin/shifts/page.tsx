'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

export default function AdminShiftsPage() {
  const { isOwner } = useAuth()
  const sb = createClient()
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    if (!isOwner()) return
    sb.from('staff_shifts').select('*').order('started_at', { ascending: false }).limit(100).then(({ data }) => setRows(data ?? []))
  }, [sb, isOwner])

  if (!isOwner()) {
    return (
      <Card><CardHeader><CardTitle>Owner only</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">Shift reconciliation lists owner visibility only.</CardContent></Card>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black font-display">Shift reconciliation</h1>
      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Started</TableHead>
                <TableHead>Ending cash</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.started_at).toLocaleString()}</TableCell>
                  <TableCell>{r.ending_cash_cents != null ? `$${(r.ending_cash_cents / 100).toFixed(2)}` : '—'}</TableCell>
                  <TableCell>{r.variance_cents != null ? `$${(r.variance_cents / 100).toFixed(2)}` : '—'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{r.notes || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rows.length === 0 && <p className="text-sm text-muted-foreground py-6">No shifts recorded yet. Staff open a shift from POS when that flow is enabled.</p>}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Link token sales to active shifts from the POS when <code>shift_id</code> tagging is configured in your deployment.
      </p>
    </div>
  )
}
