-- 00020: Token transactions — allow correcting / removing processed sales
--
-- Customer request (Jun 2026):
--   • "Ability to delete out token purchases (or edit them after processed)"
--
-- The initial schema only allowed INSERT (employees+) and SELECT on
-- token_transactions. This adds UPDATE and DELETE for managers/owners so a
-- mistaken or duplicate sale can be corrected or removed after the fact.
-- Safe to run multiple times (idempotent).

DROP POLICY IF EXISTS "Managers+ can update token transactions" ON public.token_transactions;
CREATE POLICY "Managers+ can update token transactions"
  ON public.token_transactions FOR UPDATE
  USING (public.is_manager_or_owner())
  WITH CHECK (public.is_manager_or_owner());

DROP POLICY IF EXISTS "Managers+ can delete token transactions" ON public.token_transactions;
CREATE POLICY "Managers+ can delete token transactions"
  ON public.token_transactions FOR DELETE
  USING (public.is_manager_or_owner());
