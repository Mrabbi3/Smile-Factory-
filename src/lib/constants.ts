export const SITE_NAME = 'The Smile Factory'
export const SITE_DESCRIPTION = 'Family-oriented arcade entertainment venue in Brigantine, New Jersey since 2006'
export const SITE_URL = 'https://thesmilefactoryarcade.com'

export const BUSINESS_INFO = {
  name: 'The Smile Factory Arcade & Family Fun Center',
  address: '1307 W Brigantine Ave # B, Brigantine, NJ 08203',
  phone: '(609) 266-3866',
  hours: {
    weekday: '12:00 PM - 10:00 PM',
    weekend: '10:00 AM - 10:00 PM',
  },
  established: 2006,
  machineCount: 41,
  brandColor: '#DC2626',
}

export const TOKEN_PRICING = [
  { price: 1, tokens: 3, label: '$1 = 3 Tokens' },
  { price: 5, tokens: 15, label: '$5 = 15 Tokens' },
  { price: 10, tokens: 30, label: '$10 = 30 Tokens' },
  { price: 20, tokens: 66, label: '$20 = 66 Tokens (10% savings!)' },
] as const

export const LOYALTY_DEAL = {
  price: 100,
  bonusTokens: 30,
  label: '$100 = $10 worth bonus tokens',
  minRole: 'manager' as const,
}

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

export const LOYALTY_TIERS = [
  { tier: 'bronze', minSpend: 0, label: 'Bronze', color: '#CD7F32' },
  { tier: 'silver', minSpend: 200, label: 'Silver', color: '#C0C0C0' },
  { tier: 'gold', minSpend: 500, label: 'Gold', color: '#FFD700' },
  { tier: 'platinum', minSpend: 1000, label: 'Platinum', color: '#E5E4E2' },
] as const
