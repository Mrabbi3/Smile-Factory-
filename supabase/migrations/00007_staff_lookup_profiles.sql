-- Allow counter staff (employees) to look up customer profiles for POS attach / QR flow.

DROP POLICY IF EXISTS "Staff can read customer profiles for POS" ON public.profiles;
CREATE POLICY "Staff can read customer profiles for POS" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','manager','employee'))
    AND profiles.role = 'customer'
  );
