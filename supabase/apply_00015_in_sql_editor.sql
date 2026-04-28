-- =======================================================================
-- Run this once in Supabase SQL editor (project tatstgyphzkambjacbvl)
-- to fix:
--   * site alerts not posting   (RLS rejected because role stayed customer)
--   * owner / employee separation on the single staff login page
-- =======================================================================
-- This is identical to supabase/migrations/00015_access_keys_and_role_promotion.sql
-- but kept here for one-paste convenience. Safe to run twice (idempotent).
-- =======================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.access_keys (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role        text NOT NULL CHECK (role IN ('owner','employee')),
  key_hash    text NOT NULL,
  label       text NOT NULL DEFAULT 'access key',
  is_active   boolean NOT NULL DEFAULT true,
  created_by  uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  rotated_at  timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_access_keys_active_hash
  ON public.access_keys (key_hash) WHERE is_active = true;

ALTER TABLE public.access_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owners read access keys"   ON public.access_keys;
DROP POLICY IF EXISTS "owners insert access keys" ON public.access_keys;
DROP POLICY IF EXISTS "owners update access keys" ON public.access_keys;
DROP POLICY IF EXISTS "owners delete access keys" ON public.access_keys;

CREATE POLICY "owners read access keys"   ON public.access_keys
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner'));
CREATE POLICY "owners insert access keys" ON public.access_keys
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner'));
CREATE POLICY "owners update access keys" ON public.access_keys
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner'))
              WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner'));
CREATE POLICY "owners delete access keys" ON public.access_keys
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner'));

CREATE OR REPLACE FUNCTION public.access_key_hash(p_key text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT encode(extensions.digest(convert_to(p_key, 'UTF8'), 'sha256'), 'hex');
$$;

CREATE OR REPLACE FUNCTION public.verify_access_key(p_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_role text;
  v_hash text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  v_hash := public.access_key_hash(p_key);

  SELECT role INTO v_role
    FROM public.access_keys
    WHERE key_hash = v_hash AND is_active = true
    ORDER BY CASE role WHEN 'owner' THEN 0 ELSE 1 END
    LIMIT 1;

  IF v_role IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.profiles
     SET role = CASE
                  WHEN role = 'owner' THEN 'owner'
                  WHEN role = 'manager' AND v_role = 'employee' THEN 'manager'
                  ELSE v_role
                END,
         updated_at = now()
   WHERE id = auth.uid();

  RETURN v_role;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_access_key(text) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_access_key(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.bootstrap_owner_if_no_keys(p_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_existing int;
  v_hash text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT count(*) INTO v_existing
    FROM public.access_keys
    WHERE role = 'owner' AND is_active = true;

  IF v_existing > 0 THEN
    RETURN NULL;
  END IF;

  v_hash := public.access_key_hash(p_key);

  INSERT INTO public.access_keys (role, key_hash, label, created_by)
    VALUES ('owner', v_hash, 'initial owner key (bootstrap)', auth.uid())
    ON CONFLICT (key_hash) WHERE is_active = true DO NOTHING;

  UPDATE public.profiles
     SET role = 'owner', updated_at = now()
   WHERE id = auth.uid();

  RETURN 'owner';
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_owner_if_no_keys(text) FROM public;
GRANT EXECUTE ON FUNCTION public.bootstrap_owner_if_no_keys(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_access_key(
  p_key     text,
  p_role    text,
  p_label   text DEFAULT 'access key'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_id uuid;
  v_caller_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
  IF v_caller_role IS DISTINCT FROM 'owner' THEN
    RAISE EXCEPTION 'only owners can create access keys';
  END IF;

  IF p_role NOT IN ('owner','employee') THEN
    RAISE EXCEPTION 'role must be owner or employee';
  END IF;

  IF length(p_key) < 4 THEN
    RAISE EXCEPTION 'access key must be at least 4 characters';
  END IF;

  INSERT INTO public.access_keys (role, key_hash, label, created_by)
    VALUES (p_role, public.access_key_hash(p_key), p_label, auth.uid())
    RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_access_key(text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.create_access_key(text, text, text) TO authenticated;
