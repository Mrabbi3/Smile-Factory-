-- ==========================================================================
-- Migration 00016 — fix infinite recursion on profiles RLS
--
-- ROOT CAUSE
-- Migration 00007 added this policy ON public.profiles:
--
--   CREATE POLICY "Staff can read customer profiles for POS" ON public.profiles
--     FOR SELECT USING (
--       EXISTS (SELECT 1 FROM public.profiles p
--               WHERE p.id = auth.uid() AND p.role IN ('owner','manager','employee'))
--       AND profiles.role = 'customer'
--     );
--
-- The EXISTS subquery reads `public.profiles`, which triggers the SAME
-- SELECT policy, which evaluates the same EXISTS, which triggers the same
-- policy, ... → "infinite recursion detected in policy for relation profiles".
--
-- This blew up:
--   * /admin/customers      (failed to load customers in owner page)
--   * /admin/alerts         (insert RLS check on site_alerts reads profiles)
--   * useAuth hook          (reading own profile)
--   * verify_access_key RPC (its UPDATE on profiles silently failed)
--
-- FIX
-- Use the existing SECURITY DEFINER helper `public.get_my_role()` (defined in
-- 00001) instead of an EXISTS subquery. SECURITY DEFINER bypasses RLS, so no
-- recursion. Add a couple of small wrapper helpers (is_staff/is_owner) so
-- future policies can stay readable, and rewrite the offending policy.
-- ==========================================================================

-- Boolean wrappers around the existing get_my_role() — also SECURITY DEFINER
-- so they never re-enter the profiles RLS policies.
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT coalesce(public.get_my_role(), '') IN ('owner','manager','employee');
$$;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT coalesce(public.get_my_role(), '') = 'owner';
$$;

CREATE OR REPLACE FUNCTION public.is_manager_or_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT coalesce(public.get_my_role(), '') IN ('owner','manager');
$$;

REVOKE ALL ON FUNCTION public.is_staff()             FROM public;
REVOKE ALL ON FUNCTION public.is_owner()             FROM public;
REVOKE ALL ON FUNCTION public.is_manager_or_owner()  FROM public;

GRANT EXECUTE ON FUNCTION public.is_staff()             TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_owner()             TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_manager_or_owner()  TO authenticated;

-- ----- Replace the recursive profiles policy --------------------------------
DROP POLICY IF EXISTS "Staff can read customer profiles for POS" ON public.profiles;

CREATE POLICY "Staff can read customer profiles for POS" ON public.profiles
  FOR SELECT USING (
    public.is_staff() AND role = 'customer'
  );

-- ----- Rewrite other policies that did EXISTS-on-profiles ------------------
-- These won't recurse (they're on different tables) but they're inefficient
-- and cause subtle issues if the profiles SELECT policy ever changes. Using
-- the helper functions keeps everything consistent.

-- site_alerts (00008)
DROP POLICY IF EXISTS "staff manages alerts" ON public.site_alerts;
CREATE POLICY "staff manages alerts" ON public.site_alerts
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- work_order_history (00009)
DROP POLICY IF EXISTS "staff full access work order history" ON public.work_order_history;
CREATE POLICY "staff full access work order history" ON public.work_order_history
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- pending_token_purchases (00005)
DROP POLICY IF EXISTS "staff reads all pending"   ON public.pending_token_purchases;
DROP POLICY IF EXISTS "staff updates pending"     ON public.pending_token_purchases;
CREATE POLICY "staff reads all pending"   ON public.pending_token_purchases
  FOR SELECT USING (public.is_staff());
CREATE POLICY "staff updates pending"     ON public.pending_token_purchases
  FOR UPDATE USING (public.is_staff());

-- customer_tickets (00006)
DROP POLICY IF EXISTS "staff reads all ticket counts"   ON public.customer_tickets;
DROP POLICY IF EXISTS "staff insert ticket counts"      ON public.customer_tickets;
DROP POLICY IF EXISTS "staff update ticket counts"      ON public.customer_tickets;
DROP POLICY IF EXISTS "staff delete ticket counts"      ON public.customer_tickets;
CREATE POLICY "staff reads all ticket counts" ON public.customer_tickets
  FOR SELECT USING (public.is_staff());
CREATE POLICY "staff insert ticket counts"    ON public.customer_tickets
  FOR INSERT WITH CHECK (public.is_staff());
CREATE POLICY "staff update ticket counts"    ON public.customer_tickets
  FOR UPDATE USING (public.is_staff());
CREATE POLICY "staff delete ticket counts"    ON public.customer_tickets
  FOR DELETE USING (public.is_staff());

DROP POLICY IF EXISTS "staff ledger all" ON public.ticket_ledger;
CREATE POLICY "staff ledger all" ON public.ticket_ledger
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- access_keys (00015) — owner-only management
DROP POLICY IF EXISTS "owners read access keys"   ON public.access_keys;
DROP POLICY IF EXISTS "owners insert access keys" ON public.access_keys;
DROP POLICY IF EXISTS "owners update access keys" ON public.access_keys;
DROP POLICY IF EXISTS "owners delete access keys" ON public.access_keys;
CREATE POLICY "owners read access keys"   ON public.access_keys
  FOR SELECT USING (public.is_owner());
CREATE POLICY "owners insert access keys" ON public.access_keys
  FOR INSERT WITH CHECK (public.is_owner());
CREATE POLICY "owners update access keys" ON public.access_keys
  FOR UPDATE USING (public.is_owner()) WITH CHECK (public.is_owner());
CREATE POLICY "owners delete access keys" ON public.access_keys
  FOR DELETE USING (public.is_owner());

-- coupon_assignments (00011) — staff manage, customers see their own
DROP POLICY IF EXISTS "staff coupon assignments all" ON public.coupon_assignments;
CREATE POLICY "staff coupon assignments all" ON public.coupon_assignments
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- site_reviews staff select (00014)
DROP POLICY IF EXISTS "staff read all site reviews" ON public.site_reviews;
CREATE POLICY "staff read all site reviews" ON public.site_reviews
  FOR SELECT USING (public.is_manager_or_owner());
