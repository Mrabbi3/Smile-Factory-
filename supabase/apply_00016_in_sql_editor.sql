-- =======================================================================
-- Run this in Supabase SQL editor (project tatstgyphzkambjacbvl)
-- AFTER you've already run apply_00015_in_sql_editor.sql.
--
-- Fixes the "infinite recursion detected in policy for relation profiles"
-- error that breaks: site alerts insert, customers list, useAuth profile
-- read, and the access-key RPC.
-- =======================================================================

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

DROP POLICY IF EXISTS "Staff can read customer profiles for POS" ON public.profiles;
CREATE POLICY "Staff can read customer profiles for POS" ON public.profiles
  FOR SELECT USING (public.is_staff() AND role = 'customer');

DROP POLICY IF EXISTS "staff manages alerts" ON public.site_alerts;
CREATE POLICY "staff manages alerts" ON public.site_alerts
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "staff full access work order history" ON public.work_order_history;
CREATE POLICY "staff full access work order history" ON public.work_order_history
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "staff reads all pending"   ON public.pending_token_purchases;
DROP POLICY IF EXISTS "staff updates pending"     ON public.pending_token_purchases;
CREATE POLICY "staff reads all pending"   ON public.pending_token_purchases
  FOR SELECT USING (public.is_staff());
CREATE POLICY "staff updates pending"     ON public.pending_token_purchases
  FOR UPDATE USING (public.is_staff());

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

DROP POLICY IF EXISTS "staff coupon assignments all" ON public.coupon_assignments;
CREATE POLICY "staff coupon assignments all" ON public.coupon_assignments
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "staff read all site reviews" ON public.site_reviews;
CREATE POLICY "staff read all site reviews" ON public.site_reviews
  FOR SELECT USING (public.is_manager_or_owner());
