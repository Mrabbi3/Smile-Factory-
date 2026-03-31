import { redirect } from 'next/navigation'

export default function InventoryPage() {
  redirect('/admin/dashboard?section=inventory')
}

