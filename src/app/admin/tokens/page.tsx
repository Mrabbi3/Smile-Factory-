import { redirect } from 'next/navigation'

export default function TokensPage() {
  redirect('/admin/dashboard?section=tokens')
}

