import type { Profile } from '@/types/database'

export type Permissions = {
  view_revenue: boolean
  view_expenses: boolean
  manage_employees: boolean
  issue_coupons: boolean
  manage_alerts: boolean
  manage_bookings: boolean
  approve_reviews: boolean
}

export const canAccess = (profile: Profile | null, permission: keyof Permissions) => {
  if (!profile) return false
  if (profile.role === 'owner') return true
  return profile.permissions?.[permission] === true
}
