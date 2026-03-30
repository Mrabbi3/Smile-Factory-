import { redirect } from 'next/navigation'

export default function ReportsPage() {
  redirect('/admin/dashboard?section=reports')
}

