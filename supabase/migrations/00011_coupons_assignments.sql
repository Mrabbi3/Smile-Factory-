-- Coupons rebuild: single-use per customer assignment (Phase 7)

ALTER TABLE public.coupons DROP CONSTRAINT IF EXISTS coupons_discount_type_check;
ALTER TABLE public.coupons ADD CONSTRAINT coupons_discount_type_check
  CHECK (discount_type IN ('percentage','percent','fixed','free_tokens'));

ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id);

CREATE TABLE IF NOT EXISTS coupon_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sent_at timestamptz NOT NULL DEFAULT now(),
  redeemed_at timestamptz,
  redeemed_in_transaction_id uuid REFERENCES public.token_transactions(id),
  UNIQUE (coupon_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_assignments_customer ON coupon_assignments (customer_id, redeemed_at);

ALTER TABLE coupon_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customer reads own coupon assignments" ON coupon_assignments;
CREATE POLICY "customer reads own coupon assignments" ON coupon_assignments
  FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "staff coupon assignments all" ON coupon_assignments;
CREATE POLICY "staff coupon assignments all" ON coupon_assignments
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')));

CREATE OR REPLACE FUNCTION public.redeem_coupon(
  p_coupon_code text,
  p_customer_id uuid,
  p_transaction_id uuid
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_coupon public.coupons%ROWTYPE;
  v_assignment public.coupon_assignments%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_customer_id THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT * INTO v_coupon FROM public.coupons WHERE upper(code) = upper(p_coupon_code) FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid coupon code'; END IF;

  IF NOT v_coupon.is_active THEN RAISE EXCEPTION 'Coupon inactive'; END IF;

  IF v_coupon.valid_from > now() THEN RAISE EXCEPTION 'Coupon not yet active'; END IF;
  IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < now()
    THEN RAISE EXCEPTION 'Coupon expired'; END IF;

  SELECT * INTO v_assignment
    FROM public.coupon_assignments
    WHERE coupon_id = v_coupon.id AND customer_id = p_customer_id
    FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Coupon not assigned to you'; END IF;

  IF v_assignment.redeemed_at IS NOT NULL THEN RAISE EXCEPTION 'Coupon already redeemed'; END IF;

  UPDATE public.coupon_assignments
    SET redeemed_at = now(),
        redeemed_in_transaction_id = p_transaction_id
    WHERE id = v_assignment.id;

  RETURN jsonb_build_object(
    'discount_type', v_coupon.discount_type,
    'discount_value', v_coupon.discount_value,
    'description', v_coupon.description
  );
END $$;

GRANT EXECUTE ON FUNCTION public.redeem_coupon(text, uuid, uuid) TO authenticated;
