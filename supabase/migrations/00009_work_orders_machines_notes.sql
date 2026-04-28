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
