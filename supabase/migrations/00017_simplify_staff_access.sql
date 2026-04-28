-- ==========================================================================
-- Migration 00017 — simplify staff access
--
-- Replaces the two-key, DB-managed model from 00015 with the simple model
-- the business actually wants:
--
--   * Single env var STAFF_ACCESS_KEY gates entry to staff portal.
--   * Anyone who passes the key + signs in/creates an account becomes
--     'employee'.
--   * Owner role is granted MANUALLY via Supabase (UPDATE profiles SET role
--     = 'owner' WHERE id = ...) — no UI needed.
--
-- The access_keys table from 00015 stays in place but the app no longer
-- touches it. Feel free to drop it later if you don't need the history.
-- ==========================================================================

-- Promote the calling user from 'customer' to 'employee'. No-op for anyone
-- who is already manager / owner so we never accidentally downgrade.
CREATE OR REPLACE FUNCTION public.promote_to_employee()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();

  IF v_role IN ('owner','manager','employee') THEN
    -- already at or above employee level, leave alone
    RETURN v_role;
  END IF;

  UPDATE public.profiles
     SET role = 'employee', updated_at = now()
   WHERE id = auth.uid();

  RETURN 'employee';
END;
$$;

REVOKE ALL ON FUNCTION public.promote_to_employee() FROM public;
GRANT EXECUTE ON FUNCTION public.promote_to_employee() TO authenticated;
