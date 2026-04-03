import { redirect } from 'next/navigation'

export default function MachinesPage() {
  redirect('/admin/dashboard?section=machines')
}

