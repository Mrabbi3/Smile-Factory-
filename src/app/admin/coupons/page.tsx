import { redirect } from 'next/navigation'

export default function CouponsPage() {
  redirect('/admin/dashboard?section=coupons')
}

