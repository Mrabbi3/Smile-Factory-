-- ============================================================
-- Smile Factory Management System — Initial Schema Migration
-- ============================================================

-- 0. Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. TABLES
-- ============================================================

-- 1a. profiles (extends auth.users)
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text not null,
  first_name  text not null,
  last_name   text not null,
  phone       text,
  role        text not null default 'customer'
              check (role in ('owner','manager','employee','customer')),
  avatar_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 1b. token_pricing
create table public.token_pricing (
  id              uuid primary key default gen_random_uuid(),
  price           numeric not null,
  token_count     int not null,
  is_active       boolean not null default true,
  is_loyalty_bonus boolean not null default false,
  min_role        text not null default 'employee',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 1c. token_transactions
create table public.token_transactions (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid references public.profiles on delete set null,
  employee_id     uuid not null references public.profiles on delete restrict,
  amount_paid     numeric not null,
  payment_type    text not null check (payment_type in ('cash','card')),
  tokens_given    int not null,
  is_loyalty_bonus boolean not null default false,
  notes           text,
  created_at      timestamptz not null default now()
);

-- 1d. machines
create table public.machines (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  machine_type    text not null,
  tokens_per_play int not null default 1,
  status          text not null default 'active'
                  check (status in ('active','maintenance','inactive')),
  location_note   text,
  purchase_date   date,
  serial_number   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 1e. machine_maintenance
create table public.machine_maintenance (
  id            uuid primary key default gen_random_uuid(),
  machine_id    uuid not null references public.machines on delete cascade,
  description   text not null,
  resolved      boolean not null default false,
  resolved_at   timestamptz,
  reported_by   uuid not null references public.profiles on delete restrict,
  resolved_by   uuid references public.profiles on delete set null,
  cost          numeric,
  created_at    timestamptz not null default now()
);

-- 1f. prizes
create table public.prizes (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text,
  image_url         text,
  ticket_cost       int not null,
  stock_quantity    int not null default 0,
  reorder_threshold int not null default 5,
  category          text not null default 'general',
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 1g. prize_redemptions
create table public.prize_redemptions (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid references public.profiles on delete set null,
  employee_id   uuid not null references public.profiles on delete restrict,
  prize_id      uuid not null references public.prizes on delete restrict,
  tickets_used  int not null,
  quantity      int not null default 1,
  created_at    timestamptz not null default now()
);

-- 1h. party_packages
create table public.party_packages (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text not null,
  base_price        numeric not null,
  max_kids          int not null,
  duration_minutes  int not null default 120,
  includes          jsonb not null default '[]'::jsonb,
  add_ons           jsonb not null default '[]'::jsonb,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 1i. party_bookings
create table public.party_bookings (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid not null references public.profiles on delete restrict,
  package_id        uuid not null references public.party_packages on delete restrict,
  booking_date      date not null,
  start_time        time not null,
  end_time          time not null,
  num_kids          int not null,
  num_adults        int not null default 0,
  is_adult_party    boolean not null default false,
  special_requests  text,
  deposit_amount    numeric not null default 100,
  deposit_paid      boolean not null default false,
  deposit_method    text,
  total_amount      numeric not null,
  status            text not null default 'pending'
                    check (status in ('pending','confirmed','completed','cancelled')),
  contact_name      text not null,
  contact_phone     text not null,
  contact_email     text not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 1j. work_orders
create table public.work_orders (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text not null,
  assigned_to   uuid references public.profiles on delete set null,
  created_by    uuid not null references public.profiles on delete restrict,
  machine_id    uuid references public.machines on delete set null,
  priority      text not null default 'medium'
                check (priority in ('low','medium','high','urgent')),
  status        text not null default 'open'
                check (status in ('open','in_progress','completed','cancelled')),
  due_date      date,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 1k. expenses
create table public.expenses (
  id              uuid primary key default gen_random_uuid(),
  description     text not null,
  amount          numeric not null,
  category        text not null
                  check (category in ('maintenance','supplies','prizes','utilities','other')),
  payment_method  text not null
                  check (payment_method in ('cash','card')),
  recorded_by     uuid not null references public.profiles on delete restrict,
  expense_date    date not null,
  receipt_url     text,
  created_at      timestamptz not null default now()
);

-- 1l. loyalty_accounts
create table public.loyalty_accounts (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null unique references public.profiles on delete cascade,
  total_spent     numeric not null default 0,
  reward_balance  numeric not null default 0,
  tier            text not null default 'bronze'
                  check (tier in ('bronze','silver','gold','platinum')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 1m. loyalty_transactions
create table public.loyalty_transactions (
  id                  uuid primary key default gen_random_uuid(),
  loyalty_account_id  uuid not null references public.loyalty_accounts on delete cascade,
  type                text not null check (type in ('earn','redeem')),
  amount              numeric not null,
  description         text not null,
  created_at          timestamptz not null default now()
);

-- 1n. coupons
create table public.coupons (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  description     text not null,
  discount_type   text not null check (discount_type in ('percentage','fixed')),
  discount_value  numeric not null,
  min_purchase    numeric not null default 0,
  valid_from      timestamptz not null,
  valid_until     timestamptz not null,
  usage_limit     int not null default 0,
  times_used      int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- 1o. daily_revenue
create table public.daily_revenue (
  id                      uuid primary key default gen_random_uuid(),
  date                    date not null unique,
  total_cash              numeric not null default 0,
  total_card              numeric not null default 0,
  total_revenue           numeric not null default 0,
  token_sales_count       int not null default 0,
  prize_redemptions_count int not null default 0,
  notes                   text,
  created_at              timestamptz not null default now()
);

-- 1p. audit_logs
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles on delete restrict,
  action      text not null,
  table_name  text not null,
  record_id   text not null,
  old_values  jsonb,
  new_values  jsonb,
  created_at  timestamptz not null default now()
);

-- 1q. system_settings
create table public.system_settings (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  value       text not null,
  description text not null,
  updated_by  uuid references public.profiles on delete set null,
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

create index idx_token_transactions_employee   on public.token_transactions (employee_id);
create index idx_token_transactions_created    on public.token_transactions (created_at);
create index idx_token_transactions_customer   on public.token_transactions (customer_id);

create index idx_party_bookings_date           on public.party_bookings (booking_date);
create index idx_party_bookings_customer       on public.party_bookings (customer_id);
create index idx_party_bookings_status         on public.party_bookings (status);

create index idx_prizes_category               on public.prizes (category);
create index idx_prizes_is_active              on public.prizes (is_active);

create index idx_work_orders_status            on public.work_orders (status);
create index idx_work_orders_assigned          on public.work_orders (assigned_to);

create index idx_expenses_date                 on public.expenses (expense_date);
create index idx_expenses_category             on public.expenses (category);

create index idx_audit_logs_user               on public.audit_logs (user_id);
create index idx_audit_logs_created            on public.audit_logs (created_at);

create index idx_coupons_code                  on public.coupons (code);

-- ============================================================
-- 3. FUNCTIONS
-- ============================================================

-- 3a. Auto-create profile when a new auth.users row is inserted
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$;

-- 3b. Generic updated_at setter
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3c. Roll token transaction totals into daily_revenue
create or replace function public.update_daily_revenue_on_token_sale()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.daily_revenue (date, total_cash, total_card, total_revenue, token_sales_count)
  values (
    (new.created_at at time zone 'UTC')::date,
    case when new.payment_type = 'cash' then new.amount_paid else 0 end,
    case when new.payment_type = 'card' then new.amount_paid else 0 end,
    new.amount_paid,
    1
  )
  on conflict (date) do update set
    total_cash        = public.daily_revenue.total_cash
                        + case when new.payment_type = 'cash' then new.amount_paid else 0 end,
    total_card        = public.daily_revenue.total_card
                        + case when new.payment_type = 'card' then new.amount_paid else 0 end,
    total_revenue     = public.daily_revenue.total_revenue + new.amount_paid,
    token_sales_count = public.daily_revenue.token_sales_count + 1;
  return new;
end;
$$;

-- ============================================================
-- 4. TRIGGERS
-- ============================================================

-- 4a. New user → profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4b. updated_at triggers for every table that has the column
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_token_pricing_updated_at
  before update on public.token_pricing
  for each row execute function public.set_updated_at();

create trigger set_machines_updated_at
  before update on public.machines
  for each row execute function public.set_updated_at();

create trigger set_prizes_updated_at
  before update on public.prizes
  for each row execute function public.set_updated_at();

create trigger set_party_packages_updated_at
  before update on public.party_packages
  for each row execute function public.set_updated_at();

create trigger set_party_bookings_updated_at
  before update on public.party_bookings
  for each row execute function public.set_updated_at();

create trigger set_work_orders_updated_at
  before update on public.work_orders
  for each row execute function public.set_updated_at();

create trigger set_loyalty_accounts_updated_at
  before update on public.loyalty_accounts
  for each row execute function public.set_updated_at();

-- 4c. Daily revenue auto-update on token sale
create trigger on_token_transaction_insert
  after insert on public.token_transactions
  for each row execute function public.update_daily_revenue_on_token_sale();

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

-- Helper: check role of the current user
create or replace function public.get_my_role()
returns text
language sql
stable
security definer set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Enable RLS on every table
alter table public.profiles            enable row level security;
alter table public.token_pricing       enable row level security;
alter table public.token_transactions  enable row level security;
alter table public.machines            enable row level security;
alter table public.machine_maintenance enable row level security;
alter table public.prizes              enable row level security;
alter table public.prize_redemptions   enable row level security;
alter table public.party_packages      enable row level security;
alter table public.party_bookings      enable row level security;
alter table public.work_orders         enable row level security;
alter table public.expenses            enable row level security;
alter table public.loyalty_accounts    enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.coupons             enable row level security;
alter table public.daily_revenue       enable row level security;
alter table public.audit_logs          enable row level security;
alter table public.system_settings     enable row level security;

-- -------------------------------------------------------
-- profiles
-- -------------------------------------------------------
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Owners and managers can read all profiles"
  on public.profiles for select
  using (public.get_my_role() in ('owner','manager'));

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Owners can update any profile"
  on public.profiles for update
  using (public.get_my_role() = 'owner');

-- -------------------------------------------------------
-- token_pricing (read for authenticated, manage for managers+)
-- -------------------------------------------------------
create policy "Authenticated users can read active token pricing"
  on public.token_pricing for select
  using (auth.role() = 'authenticated');

create policy "Managers and owners can manage token pricing"
  on public.token_pricing for all
  using (public.get_my_role() in ('owner','manager'));

-- -------------------------------------------------------
-- token_transactions
-- -------------------------------------------------------
create policy "Employees+ can insert token transactions"
  on public.token_transactions for insert
  with check (public.get_my_role() in ('owner','manager','employee'));

create policy "Employees can read own token transactions"
  on public.token_transactions for select
  using (
    employee_id = auth.uid()
    and public.get_my_role() in ('owner','manager','employee')
  );

create policy "Owners can read all token transactions"
  on public.token_transactions for select
  using (public.get_my_role() = 'owner');

-- -------------------------------------------------------
-- machines
-- -------------------------------------------------------
create policy "Authenticated users can read machines"
  on public.machines for select
  using (auth.role() = 'authenticated');

create policy "Managers+ can insert machines"
  on public.machines for insert
  with check (public.get_my_role() in ('owner','manager'));

create policy "Managers+ can update machines"
  on public.machines for update
  using (public.get_my_role() in ('owner','manager'));

-- -------------------------------------------------------
-- machine_maintenance
-- -------------------------------------------------------
create policy "Employees+ can read maintenance records"
  on public.machine_maintenance for select
  using (public.get_my_role() in ('owner','manager','employee'));

create policy "Employees+ can insert maintenance records"
  on public.machine_maintenance for insert
  with check (public.get_my_role() in ('owner','manager','employee'));

create policy "Managers+ can update maintenance records"
  on public.machine_maintenance for update
  using (public.get_my_role() in ('owner','manager'));

-- -------------------------------------------------------
-- prizes
-- -------------------------------------------------------
create policy "Anyone authenticated can read active prizes"
  on public.prizes for select
  using (auth.role() = 'authenticated' and is_active = true);

create policy "Managers+ can read all prizes"
  on public.prizes for select
  using (public.get_my_role() in ('owner','manager'));

create policy "Managers+ can insert prizes"
  on public.prizes for insert
  with check (public.get_my_role() in ('owner','manager'));

create policy "Managers+ can update prizes"
  on public.prizes for update
  using (public.get_my_role() in ('owner','manager'));

create policy "Managers+ can delete prizes"
  on public.prizes for delete
  using (public.get_my_role() in ('owner','manager'));

-- -------------------------------------------------------
-- prize_redemptions
-- -------------------------------------------------------
create policy "Employees+ can insert prize redemptions"
  on public.prize_redemptions for insert
  with check (public.get_my_role() in ('owner','manager','employee'));

create policy "Employees+ can read prize redemptions"
  on public.prize_redemptions for select
  using (public.get_my_role() in ('owner','manager','employee'));

-- -------------------------------------------------------
-- party_packages
-- -------------------------------------------------------
create policy "Anyone authenticated can read active packages"
  on public.party_packages for select
  using (auth.role() = 'authenticated' and is_active = true);

create policy "Managers+ can manage party packages"
  on public.party_packages for all
  using (public.get_my_role() in ('owner','manager'));

-- -------------------------------------------------------
-- party_bookings
-- -------------------------------------------------------
create policy "Customers can read own bookings"
  on public.party_bookings for select
  using (auth.uid() = customer_id);

create policy "Customers can insert own bookings"
  on public.party_bookings for insert
  with check (auth.uid() = customer_id);

create policy "Employees+ can read all bookings"
  on public.party_bookings for select
  using (public.get_my_role() in ('owner','manager','employee'));

create policy "Managers+ can update bookings"
  on public.party_bookings for update
  using (public.get_my_role() in ('owner','manager'));

-- -------------------------------------------------------
-- work_orders
-- -------------------------------------------------------
create policy "Employees can read assigned work orders"
  on public.work_orders for select
  using (
    assigned_to = auth.uid()
    and public.get_my_role() in ('owner','manager','employee')
  );

create policy "Managers+ can read all work orders"
  on public.work_orders for select
  using (public.get_my_role() in ('owner','manager'));

create policy "Managers+ can insert work orders"
  on public.work_orders for insert
  with check (public.get_my_role() in ('owner','manager'));

create policy "Managers+ can update work orders"
  on public.work_orders for update
  using (public.get_my_role() in ('owner','manager'));

create policy "Managers+ can delete work orders"
  on public.work_orders for delete
  using (public.get_my_role() in ('owner','manager'));

-- -------------------------------------------------------
-- expenses
-- -------------------------------------------------------
create policy "Managers+ can insert expenses"
  on public.expenses for insert
  with check (public.get_my_role() in ('owner','manager'));

create policy "Owners can read all expenses"
  on public.expenses for select
  using (public.get_my_role() = 'owner');

create policy "Managers can read expenses"
  on public.expenses for select
  using (public.get_my_role() = 'manager');

-- -------------------------------------------------------
-- loyalty_accounts
-- -------------------------------------------------------
create policy "Customers can read own loyalty account"
  on public.loyalty_accounts for select
  using (auth.uid() = customer_id);

create policy "Managers+ can read all loyalty accounts"
  on public.loyalty_accounts for select
  using (public.get_my_role() in ('owner','manager'));

create policy "Managers+ can manage loyalty accounts"
  on public.loyalty_accounts for all
  using (public.get_my_role() in ('owner','manager'));

-- -------------------------------------------------------
-- loyalty_transactions
-- -------------------------------------------------------
create policy "Customers can read own loyalty transactions"
  on public.loyalty_transactions for select
  using (
    exists (
      select 1 from public.loyalty_accounts la
      where la.id = loyalty_account_id and la.customer_id = auth.uid()
    )
  );

create policy "Managers+ can manage loyalty transactions"
  on public.loyalty_transactions for all
  using (public.get_my_role() in ('owner','manager'));

-- -------------------------------------------------------
-- coupons
-- -------------------------------------------------------
create policy "Anyone authenticated can read active coupons"
  on public.coupons for select
  using (auth.role() = 'authenticated' and is_active = true);

create policy "Managers+ can read all coupons"
  on public.coupons for select
  using (public.get_my_role() in ('owner','manager'));

create policy "Managers+ can insert coupons"
  on public.coupons for insert
  with check (public.get_my_role() in ('owner','manager'));

create policy "Managers+ can update coupons"
  on public.coupons for update
  using (public.get_my_role() in ('owner','manager'));

create policy "Managers+ can delete coupons"
  on public.coupons for delete
  using (public.get_my_role() in ('owner','manager'));

-- -------------------------------------------------------
-- daily_revenue
-- -------------------------------------------------------
create policy "Owners can read daily revenue"
  on public.daily_revenue for select
  using (public.get_my_role() = 'owner');

create policy "Managers can read daily revenue"
  on public.daily_revenue for select
  using (public.get_my_role() = 'manager');

-- -------------------------------------------------------
-- audit_logs
-- -------------------------------------------------------
create policy "Owners can read audit logs"
  on public.audit_logs for select
  using (public.get_my_role() = 'owner');

-- -------------------------------------------------------
-- system_settings
-- -------------------------------------------------------
create policy "Authenticated users can read system settings"
  on public.system_settings for select
  using (auth.role() = 'authenticated');

create policy "Owners can manage system settings"
  on public.system_settings for all
  using (public.get_my_role() = 'owner');
