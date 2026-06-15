-- 00019: Machines — editable description, picture, and delete capability
--
-- Customer request (Jun 2026):
--   • "Machines - Ability to edit within the description for each one /
--      delete ones no longer inventoried"
--   • "Machines - Picture section slotted"
--
-- Adds two optional columns and a DELETE RLS policy for staff managers/owners.
-- Safe to run multiple times (idempotent).

ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.machines ADD COLUMN IF NOT EXISTS image_url   text;

-- The initial schema gave machines INSERT/UPDATE/SELECT policies but no DELETE.
-- Allow managers and owners to remove machines that are no longer inventoried.
DROP POLICY IF EXISTS "Managers+ can delete machines" ON public.machines;
CREATE POLICY "Managers+ can delete machines"
  ON public.machines FOR DELETE
  USING (public.is_manager_or_owner());
