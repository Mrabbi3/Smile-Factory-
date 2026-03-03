import { NextRequest, NextResponse } from 'next/server'
import { SMILE_FACTORY_SYSTEM_PROMPT, ADMIN_ANALYTICS_PROMPT } from '@/lib/ai/chat-context'

export async function POST(request: NextRequest) {
  try {
    const { messages, mode = 'customer' } = await request.json()

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      return NextResponse.json({
        message: mode === 'customer'
          ? "I'm currently being set up! In the meantime, feel free to call us at (609) 266-3866 for any questions. We're open Sat-Sun 10AM-10PM and Mon-Fri 12PM-10PM!"
          : "AI analytics is not yet configured. Please add your OpenAI API key to the environment variables."
      })
    }

    const systemPrompt = mode === 'admin' ? ADMIN_ANALYTICS_PROMPT : SMILE_FACTORY_SYSTEM_PROMPT

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10),
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenAI API error: ${err}`)
    }

    const data = await response.json()
    const message = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({ message })
  } catch (error: any) {
    console.error('AI Chat Error:', error)
    return NextResponse.json(
      { message: 'Sorry, I encountered an error. Please try again or call us at (609) 266-3866.' },
      { status: 500 }
    )
  }
}