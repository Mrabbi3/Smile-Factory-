import { redirect } from 'next/navigation'

export default function WorkOrdersPage() {
  redirect('/admin/dashboard?section=work-orders')
}

