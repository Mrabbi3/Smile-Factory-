'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  className?: string
  children?: React.ReactNode
  variant?: 'default' | 'outline' | 'ghost'
}

export function BuyTokensRedirectButton({ className, children = 'Buy tokens', variant = 'default' }: Props) {
  const router = useRouter()

  const onClick = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      router.push('/customer/buy-tokens')
    } else {
      router.push('/login?redirect=/customer/buy-tokens')
    }
  }

  return (
    <Button type="button" variant={variant} className={cn(className)} onClick={() => void onClick()}>
      {children}
    </Button>
  )
}
