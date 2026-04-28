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
