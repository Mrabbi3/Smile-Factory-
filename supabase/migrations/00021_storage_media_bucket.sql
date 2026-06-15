-- 00021: Public "media" storage bucket for prize & machine pictures
--
-- Customer request (Jun 2026):
--   • "Prize Inventory - Picture section associated with each product"
--   • "Machines - Picture section slotted"
--
-- Creates a single PUBLIC bucket named `media` (images are non-sensitive product
-- photos, so public read keeps display simple — no signed URLs needed).
-- Uploads/edits/deletes are restricted to authenticated staff via is_staff().
--
-- Folder convention used by the app:
--   media/prizes/<id>-<timestamp>.<ext>
--   media/machines/<id>-<timestamp>.<ext>
--
-- Safe to run multiple times (idempotent).

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Anyone can READ objects in the media bucket (bucket is public).
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
CREATE POLICY "Public read media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Only staff (owner/manager/employee) may upload.
DROP POLICY IF EXISTS "Staff upload media" ON storage.objects;
CREATE POLICY "Staff upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.is_staff());

-- Only staff may replace existing objects.
DROP POLICY IF EXISTS "Staff update media" ON storage.objects;
CREATE POLICY "Staff update media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_staff())
  WITH CHECK (bucket_id = 'media' AND public.is_staff());

-- Only staff may delete objects.
DROP POLICY IF EXISTS "Staff delete media" ON storage.objects;
CREATE POLICY "Staff delete media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND public.is_staff());
