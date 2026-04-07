export type UserRole = 'owner' | 'manager' | 'employee' | 'customer'
export type PaymentType = 'cash' | 'card'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent'
export type WorkOrderStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type MachineStatus = 'active' | 'maintenance' | 'inactive'
export type ExpenseCategory = 'maintenance' | 'supplies' | 'prizes' | 'utilities' | 'other'
export type DiscountType = 'percentage' | 'fixed'
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  role: UserRole
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TokenPricing {
  id: string
  price: number
  token_count: number
  is_active: boolean
  is_loyalty_bonus: boolean
  min_role: UserRole
  created_at: string
  updated_at: string
}

export interface TokenTransaction {
  id: string
  customer_id: string | null
  employee_id: string
  amount_paid: number
  payment_type: PaymentType
  tokens_given: number
  is_loyalty_bonus: boolean
  notes: string | null
  created_at: string
}

export interface Machine {
  id: string
  name: string
  machine_type: string
  tokens_per_play: number
  status: MachineStatus
  location_note: string | null
  purchase_date: string | null
  serial_number: string | null
  created_at: string
  updated_at: string
}

export interface MachineMaintenance {
  id: string
  machine_id: string
  description: string
  resolved: boolean
  resolved_at: string | null
  reported_by: string
  resolved_by: string | null
  cost: number | null
  created_at: string
}

export interface Prize {
  id: string
  name: string
  description: string | null
  image_url: string | null
  ticket_cost: number
  stock_quantity: number
  reorder_threshold: number
  category: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PrizeRedemption {
  id: string
  customer_id: string | null
  employee_id: string
  prize_id: string
  tickets_used: number
  quantity: number
  created_at: string
}

export interface PartyPackage {
  id: string
  name: string
  description: string
  base_price: number
  max_kids: number
  duration_minutes: number
  includes: string[]
  add_ons: { name: string; price: number }[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PartyBooking {
  id: string
  customer_id: string
  package_id: string
  booking_date: string
  start_time: string
  end_time: string
  num_kids: number
  num_adults: number
  is_adult_party: boolean
  special_requests: string | null
  deposit_amount: number
  deposit_paid: boolean
  deposit_method: string | null
  total_amount: number
  status: BookingStatus
  contact_name: string
  contact_phone: string
  contact_email: string
  created_at: string
  updated_at: string
}

export interface WorkOrder {
  id: string
  title: string
  description: string
  assigned_to: string | null
  created_by: string
  machine_id: string | null
  priority: WorkOrderPriority
  status: WorkOrderStatus
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  category: ExpenseCategory
  payment_method: PaymentType
  recorded_by: string
  expense_date: string
  receipt_url: string | null
  created_at: string
}

export interface LoyaltyAccount {
  id: string
  customer_id: string
  total_spent: number
  reward_balance: number
  tier: LoyaltyTier
  created_at: string
  updated_at: string
}

export interface LoyaltyTransaction {
  id: string
  loyalty_account_id: string
  type: 'earn' | 'redeem'
  amount: number
  description: string
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  description: string
  discount_type: DiscountType
  discount_value: number
  min_purchase: number
  valid_from: string
  valid_until: string
  usage_limit: number
  times_used: number
  is_active: boolean
  created_at: string
}

export interface DailyRevenue {
  id: string
  date: string
  total_cash: number
  total_card: number
  total_revenue: number
  token_sales_count: number
  prize_redemptions_count: number
  notes: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string
  action: string
  table_name: string
  record_id: string
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  created_at: string
}

export interface SystemSetting {
  id: string
  key: string
  value: string
  description: string
  updated_by: string | null
  updated_at: string
}
