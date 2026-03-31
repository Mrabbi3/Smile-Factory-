import { StitchPageRenderer } from '@/components/admin/stitch-page-renderer'

const allowedSections = new Set([
  'dashboard',
  'pos',
  'tokens',
  'inventory',
  'bookings',
  'work-orders',
  'machines',
  'customers',
  'employees',
  'expenses',
  'loyalty',
  'coupons',
  'reports',
  'documents',
])

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ section?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const section = resolvedSearchParams?.section
  const routeKey = section && allowedSections.has(section) ? section : 'dashboard'

  return <StitchPageRenderer routeKey={routeKey} />
}

