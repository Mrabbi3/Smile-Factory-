-- Migration 00018 — Security Questions for Password Reset
--
-- Adds support for custom password resets via security questions,
-- bypassing the need for transactional emails in dev/production.

-- 1. Add security question and answer columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS security_question text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS security_answer text;

-- 2. Update the auto-profile trigger function to extract metadata fields on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    security_question,
    security_answer
  )
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    coalesce(new.raw_user_meta_data->>'security_question', ''),
    coalesce(new.raw_user_meta_data->>'security_answer', '')
  );
  RETURN new;
END;
$$;

-- 3. Create a public function to fetch security questions and user roles for unauthenticated password resets
CREATE OR REPLACE FUNCTION public.get_security_question_and_role(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_question text;
  v_role text;
BEGIN
  SELECT security_question, role INTO v_question, v_role
    FROM public.profiles
   WHERE LOWER(email) = LOWER(p_email);
   
  IF v_question IS NULL OR v_question = '' THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'security_question', v_question,
    'is_staff', v_role IN ('owner', 'manager', 'employee')
  );
END;
$$;

-- 4. Grant access to public execute roles so unauthenticated clients can resolve security questions
GRANT EXECUTE ON FUNCTION public.get_security_question_and_role(text) TO anon, authenticated;
