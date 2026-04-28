-- =======================================================================
-- Run AFTER 00015 and 00016. Adds promote_to_employee() RPC used by the
-- new /admin/auth flow.
-- =======================================================================

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
