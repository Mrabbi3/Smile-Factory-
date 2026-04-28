CREATE OR REPLACE FUNCTION public.complete_pending_token_purchase(
  p_qr_payload text,
  p_payment_type text
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pending public.pending_token_purchases%ROWTYPE;
  v_tx uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','manager','employee')
  ) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF p_payment_type NOT IN ('cash','card') THEN RAISE EXCEPTION 'Invalid payment type'; END IF;

  SELECT * INTO pending FROM pending_token_purchases WHERE qr_payload = p_qr_payload FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid code'; END IF;
  IF pending.status <> 'pending' THEN RAISE EXCEPTION 'Purchase not pending'; END IF;
  IF pending.expires_at < now() THEN
    UPDATE pending_token_purchases SET status = 'expired' WHERE id = pending.id;
    RAISE EXCEPTION 'Expired';
  END IF;

  INSERT INTO token_transactions (
    customer_id,
    employee_id,
    amount_paid,
    payment_type,
    tokens_given,
    is_loyalty_bonus,
    notes
  ) VALUES (
    pending.customer_id,
    auth.uid(),
    pending.price_cents::numeric / 100.0,
    p_payment_type,
    pending.token_count,
    false,
    'Customer QR desk purchase'
  ) RETURNING id INTO v_tx;

  UPDATE pending_token_purchases
    SET status = 'paid',
        paid_at = now(),
        paid_by_staff_id = auth.uid()
    WHERE id = pending.id;

  RETURN v_tx;
END $$;

GRANT EXECUTE ON FUNCTION public.complete_pending_token_purchase(text, text) TO authenticated;
