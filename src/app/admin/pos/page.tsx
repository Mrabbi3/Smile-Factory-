import { redirect } from 'next/navigation'

export default function POSPage() {
  redirect('/admin/dashboard?section=pos')
}

