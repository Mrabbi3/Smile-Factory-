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
