import { redirect } from 'next/navigation'

export default function CustomersPage() {
  redirect('/admin/dashboard?section=customers')
}

