-- Allow managers/owners to moderate the full review queue (pending + approved).

DROP POLICY IF EXISTS "staff read all site reviews" ON site_reviews;
CREATE POLICY "staff read all site reviews" ON site_reviews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager'))
  );
