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
