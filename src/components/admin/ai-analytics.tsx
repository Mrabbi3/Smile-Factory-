'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Brain, Send, Loader2, Sparkles, TrendingUp, BarChart3, Package } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { safeFormatDate } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_QUERIES = [
  { label: 'Revenue Summary', query: 'Give me a summary of revenue for the last 30 days', icon: TrendingUp },
  { label: 'Busiest Hours', query: 'What are the busiest hours and days based on transaction data?', icon: BarChart3 },
  { label: 'Prize Restocking', query: 'Which prizes need restocking and what are the redemption trends?', icon: Package },
  { label: 'Revenue Forecast', query: 'Based on current trends, what revenue can we expect next month?', icon: Sparkles },
]

export function AIAnalytics() {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const gatherBusinessData = async () => {
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
    const [txRes, prizeRes, bookingRes, expRes] = await Promise.all([
      supabase.from('token_transactions').select('*').gte('created_at', thirtyDaysAgo),
      supabase.from('prizes').select('*'),
      supabase.from('party_bookings').select('*').gte('booking_date', format(subDays(new Date(), 30), 'yyyy-MM-dd')),
      supabase.from('expenses').select('*').gte('expense_date', format(subDays(new Date(), 30), 'yyyy-MM-dd')),
    ])

    const tx = txRes.data || []
    const totalRevenue = tx.reduce((s, t) => s + Number(t.amount_paid), 0)
    const cashRev = tx.filter(t => t.payment_type === 'cash').reduce((s, t) => s + Number(t.amount_paid), 0)
    const cardRev = tx.filter(t => t.payment_type === 'card').reduce((s, t) => s + Number(t.amount_paid), 0)

    const prizes = prizeRes.data || []
    const lowStock = prizes.filter(p => p.stock_quantity <= p.reorder_threshold && p.is_active)

    const bookings = bookingRes.data || []
    const expenses = expRes.data || []
    const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0)

    return `BUSINESS DATA (Last 30 Days):
Revenue: $${totalRevenue.toFixed(2)} (${tx.length} transactions)
- Cash: $${cashRev.toFixed(2)}
- Card: $${cardRev.toFixed(2)}
- Avg Transaction: $${tx.length > 0 ? (totalRevenue / tx.length).toFixed(2) : '0.00'}

Expenses: $${totalExpenses.toFixed(2)} (${expenses.length} entries)
Net Profit: $${(totalRevenue - totalExpenses).toFixed(2)}

Bookings: ${bookings.length} total
- Pending: ${bookings.filter(b => b.status === 'pending').length}
- Confirmed: ${bookings.filter(b => b.status === 'confirmed').length}
- Completed: ${bookings.filter(b => b.status === 'completed').length}

Prize Inventory:
- Total prizes: ${prizes.length}
- Low stock alerts: ${lowStock.length}
${lowStock.map(p => `  - ${p.name}: ${p.stock_quantity} remaining (threshold: ${p.reorder_threshold})`).join('\n')}

Transaction Timing:
${tx.slice(0, 50).map(t => `  ${safeFormatDate(t.created_at, 'EEE HH:mm')} - $${t.amount_paid} (${t.payment_type})`).join('\n')}`
  }

  const sendQuery = async (query?: string) => {
    const message = query || input.trim()
    if (!message || loading) return

    const userMessage: Message = { role: 'user', content: message }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const businessData = await gatherBusinessData()
      const enrichedMessage = `${message}\n\nHere is the current business data:\n${businessData}`

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: enrichedMessage },
          ],
          mode: 'admin',
        }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get AI analysis. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Business Analytics
        </CardTitle>
        <CardDescription>Ask questions about your business data in natural language</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {QUICK_QUERIES.map(q => (
            <Button key={q.label} variant="outline" size="sm" onClick={() => sendQuery(q.query)} disabled={loading}>
              <q.icon className="mr-1 h-3 w-3" />{q.label}
            </Button>
          ))}
        </div>

        {messages.length > 0 && (
          <ScrollArea className="h-80 border rounded-lg p-4">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={msg.role === 'user' ? 'default' : 'secondary'} className="text-xs">
                      {msg.role === 'user' ? 'You' : 'AI'}
                    </Badge>
                  </div>
                  <div className={`text-sm whitespace-pre-wrap ${msg.role === 'assistant' ? 'bg-muted p-3 rounded-lg' : ''}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing your data...</span>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        <form onSubmit={(e) => { e.preventDefault(); sendQuery() }} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your business... e.g., 'What was our busiest day last week?'"
            className="min-h-[44px] max-h-24"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendQuery() } }}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
