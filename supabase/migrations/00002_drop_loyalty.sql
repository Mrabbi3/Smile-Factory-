-- Backup before dropping loyalty feature (SFMS implementation plan Phase 2.2)

CREATE TABLE IF NOT EXISTS _backup_loyalty_accounts_2026_04 AS
  SELECT * FROM public.loyalty_accounts;

CREATE TABLE IF NOT EXISTS _backup_loyalty_transactions_2026_04 AS
  SELECT * FROM public.loyalty_transactions;

DROP TRIGGER IF EXISTS set_loyalty_accounts_updated_at ON public.loyalty_accounts;

DROP TABLE IF EXISTS public.loyalty_transactions;
DROP TABLE IF EXISTS public.loyalty_accounts;

-- token_transactions has is_loyalty_bonus column (bonus tier flag — keep for backward compatibility)
