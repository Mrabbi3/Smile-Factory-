import { redirect } from 'next/navigation'

export default function EmployeesPage() {
  redirect('/admin/dashboard?section=employees')
}

