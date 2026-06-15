export const SITE_NAME = 'The Smile Factory'
export const SITE_DESCRIPTION = 'Family-oriented arcade entertainment venue in Brigantine, New Jersey since 2006'
export const SITE_URL = 'https://thesmilefactoryarcade.com'

export const BUSINESS_INFO = {
  name: 'The Smile Factory Arcade & Family Fun Center',
  address: '1307 W Brigantine Ave # B, Brigantine, NJ 08203',
  phone: '(609) 266-3866',
  email: 'info@thesmilefactoryarcade.com',
  hours: {
    weekday: '12:00 PM - 10:00 PM',
    weekend: '10:00 AM - 10:00 PM',
  },
  established: 2006,
  machineCount: 41,
  brandColor: '#DC2626',
}

// Flat rate: $1 = 3 tokens at every amount. The old 10% bulk bonus was removed
// per the client (Jun 2026) — seasonal deals (e.g. "$100 gets $10 free") are now
// run through staff-issued coupons instead, so they can be toggled on/off.
export const TOKEN_PRICING = [
  { price: 1, tokens: 3, label: '$1 = 3 Tokens' },
  { price: 5, tokens: 15, label: '$5 = 15 Tokens' },
  { price: 10, tokens: 30, label: '$10 = 30 Tokens' },
  { price: 20, tokens: 60, label: '$20 = 60 Tokens' },
] as const

export const CARD_MINIMUM = 10

export const PARTY_CONFIG = {
  durationMinutes: 120,
  bufferMinutes: 60,
  maxKidsBeforeCall: 25,
  depositAmount: 100,
  operatingHours: { start: 10, end: 22 },
}

export const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  manager: 'Manager',
  employee: 'Employee',
  customer: 'Customer',
}

export const EXPENSE_CATEGORIES = [
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'prizes', label: 'Prizes' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'other', label: 'Other' },
] as const

export const WORK_ORDER_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
] as const

