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
