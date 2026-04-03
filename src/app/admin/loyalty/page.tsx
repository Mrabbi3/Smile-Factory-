import { redirect } from 'next/navigation'

export default function LoyaltyPage() {
  redirect('/admin/dashboard?section=loyalty')
}

