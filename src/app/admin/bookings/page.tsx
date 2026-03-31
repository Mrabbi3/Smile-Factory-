import { redirect } from 'next/navigation'

export default function BookingsPage() {
  redirect('/admin/dashboard?section=bookings')
}

