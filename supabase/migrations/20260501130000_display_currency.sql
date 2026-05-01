-- Display-only multi-currency support. The data model stays USD; this just
-- persists the user's preferred display currency so it follows them across
-- devices, plus the most recently fetched USD->INR rate so two devices show
-- the same converted totals without each pulling a slightly different rate.
alter table public.user_preferences
  add column if not exists display_currency text not null default 'USD'
    check (display_currency in ('USD', 'INR')),
  add column if not exists usd_inr_rate numeric,
  add column if not exists usd_inr_rate_fetched_at timestamptz;
