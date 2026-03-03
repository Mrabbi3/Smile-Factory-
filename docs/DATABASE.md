# Database Documentation

## Overview

The SFMS uses PostgreSQL hosted on Supabase with 17 tables, full Row Level Security, automated triggers, and optimized indexes.

## Tables

### Core Tables

| Table | Purpose | Key Fields |
|---|---|---|
| `profiles` | User accounts (extends auth.users) | id, email, first_name, last_name, role, is_active |
| `system_settings` | Configurable business parameters | key, value, description |
| `audit_logs` | Activity tracking | user_id, action, table_name, old/new_values |

### Token & Revenue

| Table | Purpose | Key Fields |
|---|---|---|
| `token_pricing` | Price tiers ($1=3, $5=15, etc.) | price, token_count, is_loyalty_bonus, min_role |
| `token_transactions` | Sales records | amount_paid, payment_type, tokens_given, employee_id |
| `daily_revenue` | Daily summaries (auto-populated) | date, total_cash, total_card, total_revenue |

### Inventory

| Table | Purpose | Key Fields |
|---|---|---|
| `prizes` | Prize catalog | name, ticket_cost, stock_quantity, reorder_threshold, category |
| `prize_redemptions` | Redemption history | prize_id, tickets_used, quantity, employee_id |

### Machines

| Table | Purpose | Key Fields |
|---|---|---|
| `machines` | Machine directory (41+ units) | name, machine_type, tokens_per_play, status |
| `machine_maintenance` | Maintenance history | machine_id, description, resolved, cost |

### Bookings

| Table | Purpose | Key Fields |
|---|---|---|
| `party_packages` | Package definitions | name, base_price, max_kids, includes, add_ons |
| `party_bookings` | Reservation records | booking_date, start_time, num_kids, status, deposit_paid |

### Operations

| Table | Purpose | Key Fields |
|---|---|---|
| `work_orders` | Task management | title, priority, status, assigned_to, machine_id |
| `expenses` | Expense tracking | description, amount, category, payment_method |

### Loyalty

| Table | Purpose | Key Fields |
|---|---|---|
| `loyalty_accounts` | Customer reward accounts | total_spent, reward_balance, tier |
| `loyalty_transactions` | Reward activity | type (earn/redeem), amount, description |
| `coupons` | Promotional codes | code, discount_type, discount_value, usage_limit |

## Seed Data

- 4 standard token pricing tiers
- 1 manager-only loyalty bonus ($100 = 30 bonus tokens)
- Classic Birthday Party package ($400, 12 kids)
- 4 system settings (card_minimum, party_buffer, max_kids, deposit_amount)

## Row Level Security

Every table has RLS enabled with role-based policies using a `get_my_role()` helper function that retrieves the current user's role from the profiles table.

## Triggers

1. **handle_new_user** - Auto-creates a profile row when a user signs up
2. **set_updated_at** - Keeps `updated_at` current on 8 tables
3. **update_daily_revenue_on_token_sale** - Upserts daily revenue on each token transaction