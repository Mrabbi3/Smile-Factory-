-- ==========================================================================
-- Migration 00015 — owner-managed access keys + role promotion
--
-- Fixes the "site alerts won't post" bug and the "owner vs employee" split.
--
-- Problem before this migration:
--   * Staff entering ADMIN_ACCESS_KEY only set a cookie. Their profiles.role
--     stayed as 'customer'. Every RLS-protected mutation (site_alerts,
--     coupons, work-order notes, machine notes, etc.) silently failed.
--
-- After this migration:
--   * `access_keys` table holds hashed keys for owner / employee roles
--   * Owners manage keys from /admin/settings (rotate, deactivate, label)
--   * Function `verify_access_key(p_key)` (SECURITY DEFINER) hashes the
--     entered key, looks it up, and atomically promotes the calling user's
--     profile.role to whatever role that key is for.
--   * `bootstrap_owner_if_no_keys(p_key)` is a one-shot helper for the very
--     first owner — it creates the initial owner key and promotes the
--     caller. Becomes inert as soon as one active owner key exists.
-- ==========================================================================

-- Make sure pgcrypto digest() is available (was extension'd in 00001 but be safe)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----- access_keys table --------------------------------------------------
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

-- ----- helper: hash a plaintext key (sha256 hex) --------------------------
CREATE OR REPLACE FUNCTION public.access_key_hash(p_key text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT encode(extensions.digest(convert_to(p_key, 'UTF8'), 'sha256'), 'hex');
$$;

-- ----- verify_access_key — promotes calling user's role -------------------
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
    -- prefer owner if both happen to share a hash collision (won't, but safe)
    ORDER BY CASE role WHEN 'owner' THEN 0 ELSE 1 END
    LIMIT 1;

  IF v_role IS NULL THEN
    RETURN NULL;
  END IF;

  -- Promote the caller to that role. Don't downgrade an existing higher role.
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

-- ----- bootstrap_owner_if_no_keys — first-owner helper --------------------
-- Self-locks once any active owner key exists. Use this once when migrating
-- to seed the first owner with whatever value used to live in ADMIN_ACCESS_KEY.
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
    RETURN NULL;  -- bootstrap closed — owner must use the real key
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

-- ----- create_access_key — owner-side helper to add/rotate keys -----------
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
