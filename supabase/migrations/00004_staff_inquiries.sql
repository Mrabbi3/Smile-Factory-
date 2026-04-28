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
