import { redirect } from 'next/navigation'

export default function DocumentsPage() {
  redirect('/admin/dashboard?section=documents')
}

