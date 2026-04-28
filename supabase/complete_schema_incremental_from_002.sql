-- =============================================================================
-- Smile Factory — INCREMENTAL SCHEMA (00002 … 00014 only)
-- Use when public.profiles and base tables ALREADY exist (partial / earlier 00001).
-- Do NOT run if you never applied loyalty tables from 00001 — try full one-shot
--   on empty DB instead, OR run 00001 first.
-- =============================================================================


-- ---------- 00002_drop_loyalty.sql ----------
-- Backup before dropping loyalty feature (SFMS implementation plan Phase 2.2)

CREATE TABLE IF NOT EXISTS _backup_loyalty_accounts_2026_04 AS
  SELECT * FROM public.loyalty_accounts;

CREATE TABLE IF NOT EXISTS _backup_loyalty_transactions_2026_04 AS
  SELECT * FROM public.loyalty_transactions;

DROP TRIGGER IF EXISTS set_loyalty_accounts_updated_at ON public.loyalty_accounts;

DROP TABLE IF EXISTS public.loyalty_transactions;
DROP TABLE IF EXISTS public.loyalty_accounts;

-- token_transactions has is_loyalty_bonus column (bonus tier flag — keep for backward compatibility)

-- ---------- 00003_reviews.sql ----------
-- Reviews: on-site moderation + cached Google Places reviews

CREATE TABLE IF NOT EXISTS site_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body text NOT NULL,
  approved boolean NOT NULL DEFAULT false,
  reviewer_name text,
  reviewer_role text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cached_google_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_review_id text UNIQUE NOT NULL,
  author_name text,
  rating int,
  body text,
  created_at_google timestamptz,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_reviews_approved_created ON site_reviews (approved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cached_google_reviews_fetched ON cached_google_reviews (fetched_at DESC);

ALTER TABLE site_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cached_google_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone reads approved reviews" ON site_reviews;
CREATE POLICY "anyone reads approved reviews" ON site_reviews
  FOR SELECT USING (approved = true);

DROP POLICY IF EXISTS "auth users insert own review" ON site_reviews;
CREATE POLICY "auth users insert own review" ON site_reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND customer_id IS NOT NULL AND auth.uid() = customer_id
  );

DROP POLICY IF EXISTS "owners and managers update reviews" ON site_reviews;
CREATE POLICY "owners and managers update reviews" ON site_reviews
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager'))
  );

DROP POLICY IF EXISTS "anyone reads google review cache" ON cached_google_reviews;
CREATE POLICY "anyone reads google review cache" ON cached_google_reviews
  FOR SELECT USING (true);

-- ---------- 00004_staff_inquiries.sql ----------
CREATE TABLE IF NOT EXISTS staff_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_name text NOT NULL,
  email text NOT NULL,
  mission_type text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','resolved')),
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_staff_inquiries_status_created ON staff_inquiries (status, created_at DESC);

ALTER TABLE staff_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone submits inquiry" ON staff_inquiries;
CREATE POLICY "anyone submits inquiry" ON staff_inquiries
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "staff reads inquiries" ON staff_inquiries;
CREATE POLICY "staff reads inquiries" ON staff_inquiries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee'))
  );

DROP POLICY IF EXISTS "staff updates inquiries" ON staff_inquiries;
CREATE POLICY "staff updates inquiries" ON staff_inquiries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee'))
  );

-- ---------- 00005_pending_token_purchases.sql ----------
CREATE TABLE IF NOT EXISTS pending_token_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_count int NOT NULL CHECK (token_count > 0),
  price_cents int NOT NULL CHECK (price_cents >= 0),
  qr_payload text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled','expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 minutes'),
  paid_at timestamptz,
  paid_by_staff_id uuid REFERENCES public.profiles(id)
);

ALTER TABLE pending_token_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customer reads own pending" ON pending_token_purchases;
CREATE POLICY "customer reads own pending" ON pending_token_purchases
  FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "customer inserts own pending" ON pending_token_purchases;
CREATE POLICY "customer inserts own pending" ON pending_token_purchases
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "staff reads all pending" ON pending_token_purchases;
CREATE POLICY "staff reads all pending" ON pending_token_purchases
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee'))
  );

DROP POLICY IF EXISTS "staff updates pending" ON pending_token_purchases;
CREATE POLICY "staff updates pending" ON pending_token_purchases
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee'))
  );

CREATE INDEX IF NOT EXISTS idx_pending_qr_payload ON pending_token_purchases(qr_payload);
CREATE INDEX IF NOT EXISTS idx_pending_status_expires ON pending_token_purchases(status, expires_at);

-- ---------- 00006_customer_tickets_and_redeem.sql ----------
-- Prize counter tickets + redemption RPC aligned with existing schema:
-- prizes.stock_quantity, prize_redemptions.tickets_used, employee_id nullable for self-service redemptions.

ALTER TABLE public.prize_redemptions
  ALTER COLUMN employee_id DROP NOT NULL;

DROP POLICY IF EXISTS "customers read own prize redemptions" ON public.prize_redemptions;
CREATE POLICY "customers read own prize redemptions" ON public.prize_redemptions
  FOR SELECT USING (auth.uid() = customer_id);

CREATE TABLE IF NOT EXISTS customer_tickets (
  customer_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  ticket_count int NOT NULL DEFAULT 0 CHECK (ticket_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ticket_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  delta int NOT NULL,
  source text NOT NULL CHECK (source IN ('machine_receipt', 'redemption', 'adjustment')),
  reference_id uuid,
  created_by uuid REFERENCES public.profiles(id),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_ledger_customer ON ticket_ledger (customer_id, created_at DESC);

ALTER TABLE customer_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customer reads own ticket count" ON customer_tickets;
CREATE POLICY "customer reads own ticket count" ON customer_tickets
  FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "staff reads all ticket counts" ON customer_tickets;
CREATE POLICY "staff reads all ticket counts" ON customer_tickets
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')));

DROP POLICY IF EXISTS "staff insert ticket counts" ON customer_tickets;
CREATE POLICY "staff insert ticket counts" ON customer_tickets
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')));

DROP POLICY IF EXISTS "staff update ticket counts" ON customer_tickets;
CREATE POLICY "staff update ticket counts" ON customer_tickets
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')));

DROP POLICY IF EXISTS "staff delete ticket counts" ON customer_tickets;
CREATE POLICY "staff delete ticket counts" ON customer_tickets
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')));

DROP POLICY IF EXISTS "customer reads own ledger" ON ticket_ledger;
CREATE POLICY "customer reads own ledger" ON ticket_ledger
  FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "staff ledger all" ON ticket_ledger;
CREATE POLICY "staff ledger all" ON ticket_ledger
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')));

CREATE OR REPLACE FUNCTION public.redeem_prize(p_customer_id uuid, p_prize_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cost int;
  v_stock int;
  v_current int;
  v_redemption_id uuid;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_customer_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  INSERT INTO customer_tickets (customer_id, ticket_count, updated_at)
    VALUES (p_customer_id, 0, now())
    ON CONFLICT (customer_id) DO NOTHING;

  SELECT ticket_cost, stock_quantity INTO v_cost, v_stock
    FROM prizes WHERE id = p_prize_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Prize not found';
  END IF;

  IF v_stock <= 0 THEN RAISE EXCEPTION 'Out of stock'; END IF;

  SELECT ticket_count INTO v_current FROM customer_tickets WHERE customer_id = p_customer_id FOR UPDATE;
  IF v_current IS NULL THEN
    RAISE EXCEPTION 'Insufficient tickets';
  END IF;
  IF v_current < v_cost THEN
    RAISE EXCEPTION 'Insufficient tickets';
  END IF;

  UPDATE customer_tickets
    SET ticket_count = ticket_count - v_cost, updated_at = now()
    WHERE customer_id = p_customer_id;

  UPDATE prizes SET stock_quantity = stock_quantity - 1, updated_at = now() WHERE id = p_prize_id;

  INSERT INTO prize_redemptions (customer_id, employee_id, prize_id, tickets_used, quantity)
    VALUES (p_customer_id, NULL, p_prize_id, v_cost, 1)
    RETURNING id INTO v_redemption_id;

  INSERT INTO ticket_ledger (customer_id, delta, source, reference_id, created_by)
    VALUES (p_customer_id, -v_cost, 'redemption', v_redemption_id, auth.uid());

  RETURN v_redemption_id;
END $$;

CREATE OR REPLACE FUNCTION public.add_customer_tickets(
  p_customer_id uuid,
  p_delta int,
  p_note text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')
  ) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF p_delta <= 0 THEN RAISE EXCEPTION 'Invalid delta'; END IF;

  INSERT INTO customer_tickets (customer_id, ticket_count, updated_at)
    VALUES (p_customer_id, p_delta, now())
    ON CONFLICT (customer_id) DO UPDATE
      SET ticket_count = customer_tickets.ticket_count + p_delta,
          updated_at = now();

  INSERT INTO ticket_ledger (customer_id, delta, source, created_by, note)
    VALUES (p_customer_id, p_delta, 'machine_receipt', auth.uid(), nullif(trim(p_note), ''))
    RETURNING id INTO v_id;

  RETURN v_id;
END $$;

GRANT EXECUTE ON FUNCTION public.redeem_prize(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_customer_tickets(uuid, int, text) TO authenticated;

-- ---------- 00007_staff_lookup_profiles.sql ----------
-- Allow counter staff (employees) to look up customer profiles for POS attach / QR flow.

DROP POLICY IF EXISTS "Staff can read customer profiles for POS" ON public.profiles;
CREATE POLICY "Staff can read customer profiles for POS" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','manager','employee'))
    AND profiles.role = 'customer'
  );

-- ---------- 00008_site_alerts.sql ----------
CREATE TABLE IF NOT EXISTS site_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_alerts_active ON site_alerts (active, starts_at, ends_at);

ALTER TABLE site_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone reads active alerts" ON site_alerts;
CREATE POLICY "anyone reads active alerts" ON site_alerts
  FOR SELECT USING (active = true AND starts_at <= now() AND (ends_at IS NULL OR ends_at >= now()));

DROP POLICY IF EXISTS "staff manages alerts" ON site_alerts;
CREATE POLICY "staff manages alerts" ON site_alerts
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')));

-- ---------- 00009_work_orders_machines_notes.sql ----------
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS notes text;

CREATE TABLE IF NOT EXISTS work_order_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id uuid NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_work_order_history_wo ON work_order_history(work_order_id, created_at DESC);

ALTER TABLE work_order_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff full access work order history" ON work_order_history;
CREATE POLICY "staff full access work order history" ON work_order_history
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')));

ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS notes text;

-- ---------- 00010_profiles_permissions.sql ----------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pin_hash text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS permissions jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Use existing is_active as "active"; do not duplicate column names.

-- ---------- 00011_coupons_assignments.sql ----------
-- Coupons rebuild: single-use per customer assignment (Phase 7)

ALTER TABLE public.coupons DROP CONSTRAINT IF EXISTS coupons_discount_type_check;
ALTER TABLE public.coupons ADD CONSTRAINT coupons_discount_type_check
  CHECK (discount_type IN ('percentage','percent','fixed','free_tokens'));

ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id);

CREATE TABLE IF NOT EXISTS coupon_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sent_at timestamptz NOT NULL DEFAULT now(),
  redeemed_at timestamptz,
  redeemed_in_transaction_id uuid REFERENCES public.token_transactions(id),
  UNIQUE (coupon_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_assignments_customer ON coupon_assignments (customer_id, redeemed_at);

ALTER TABLE coupon_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customer reads own coupon assignments" ON coupon_assignments;
CREATE POLICY "customer reads own coupon assignments" ON coupon_assignments
  FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "staff coupon assignments all" ON coupon_assignments;
CREATE POLICY "staff coupon assignments all" ON coupon_assignments
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')));

CREATE OR REPLACE FUNCTION public.redeem_coupon(
  p_coupon_code text,
  p_customer_id uuid,
  p_transaction_id uuid
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_coupon public.coupons%ROWTYPE;
  v_assignment public.coupon_assignments%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_customer_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT * INTO v_coupon FROM public.coupons WHERE upper(code) = upper(p_coupon_code) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid coupon code'; END IF;

  IF NOT v_coupon.is_active THEN RAISE EXCEPTION 'Coupon inactive'; END IF;

  IF v_coupon.valid_from > now() THEN RAISE EXCEPTION 'Coupon not yet active'; END IF;
  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < now()
    THEN RAISE EXCEPTION 'Coupon expired'; END IF;

  SELECT * INTO v_assignment
    FROM public.coupon_assignments
    WHERE coupon_id = v_coupon.id AND customer_id = p_customer_id
    FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Coupon not assigned to you'; END IF;

  IF v_assignment.redeemed_at IS NOT NULL THEN RAISE EXCEPTION 'Coupon already redeemed'; END IF;

  UPDATE public.coupon_assignments
    SET redeemed_at = now(),
        redeemed_in_transaction_id = p_transaction_id
    WHERE id = v_assignment.id;

  RETURN jsonb_build_object(
    'discount_type', v_coupon.discount_type,
    'discount_value', v_coupon.discount_value,
    'description', v_coupon.description
  );
END $$;

GRANT EXECUTE ON FUNCTION public.redeem_coupon(text, uuid, uuid) TO authenticated;

-- ---------- 00012_staff_shifts.sql ----------
CREATE TABLE IF NOT EXISTS staff_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  starting_cash_cents int NOT NULL DEFAULT 10000,
  ending_cash_cents int,
  deposited_cash_cents int,
  expected_cash_cents int,
  variance_cents int,
  notes text
);

CREATE INDEX IF NOT EXISTS idx_staff_shifts_staff_started ON staff_shifts (staff_id, started_at DESC);

ALTER TABLE public.token_transactions ADD COLUMN IF NOT EXISTS shift_id uuid REFERENCES public.staff_shifts(id);

ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff manages own shifts" ON staff_shifts;
CREATE POLICY "staff manages own shifts" ON staff_shifts
  FOR ALL USING (auth.uid() = staff_id)
  WITH CHECK (auth.uid() = staff_id);

DROP POLICY IF EXISTS "owner reads all shifts" ON staff_shifts;
CREATE POLICY "owner reads all shifts" ON staff_shifts
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner'));

-- ---------- 00013_complete_pending_purchase_rpc.sql ----------
CREATE OR REPLACE FUNCTION public.complete_pending_token_purchase(
  p_qr_payload text,
  p_payment_type text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pending public.pending_token_purchases%ROWTYPE;
  v_tx uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')
  ) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF p_payment_type NOT IN ('cash','card') THEN RAISE EXCEPTION 'Invalid payment type'; END IF;

  SELECT * INTO pending FROM pending_token_purchases WHERE qr_payload = p_qr_payload FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid code'; END IF;
  IF pending.status <> 'pending' THEN RAISE EXCEPTION 'Purchase not pending'; END IF;
  IF pending.expires_at < now() THEN
    UPDATE pending_token_purchases SET status = 'expired' WHERE id = pending.id;
    RAISE EXCEPTION 'Expired';
  END IF;

  INSERT INTO token_transactions (
    customer_id,
    employee_id,
    amount_paid,
    payment_type,
    tokens_given,
    is_loyalty_bonus,
    notes
  ) VALUES (
    pending.customer_id,
    auth.uid(),
    pending.price_cents::numeric / 100.0,
    p_payment_type,
    pending.token_count,
    false,
    'Customer QR desk purchase'
  ) RETURNING id INTO v_tx;

  UPDATE pending_token_purchases
    SET status = 'paid',
        paid_at = now(),
        paid_by_staff_id = auth.uid()
    WHERE id = pending.id;

  RETURN v_tx;
END $$;

GRANT EXECUTE ON FUNCTION public.complete_pending_token_purchase(text, text) TO authenticated;

-- ---------- 00014_site_reviews_staff_select.sql ----------
-- Allow managers/owners to moderate the full review queue (pending + approved).

DROP POLICY IF EXISTS "staff read all site reviews" ON site_reviews;
CREATE POLICY "staff read all site reviews" ON site_reviews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager'))
  );
