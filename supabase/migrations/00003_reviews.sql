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
