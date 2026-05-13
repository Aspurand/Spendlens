-- Guilt-Free Wallet: a shared ledger between the Reps fitness app and SpendLens.
-- Reps deposits rewards for completed workouts, streaks, PRs, etc. SpendLens
-- reads the balance and lets the user spend it on rewards (clothes, treats)
-- without polluting their normal income/spending stats.
--
-- One table, one row per event. Balance = sum(amount) where user_id = auth.uid().
-- Positive amounts are deposits, negative are spends.
create table if not exists public.guilt_free_wallet (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null check (amount <> 0),
  source text not null check (source in (
    'workout',         -- base reward for completing a workout
    'streak_bonus',    -- per-day streak bonus
    'weekly_goal',     -- hit the weekly workout target
    'pr_bonus',        -- new personal record on a lift
    'cardio',          -- cardio session
    'manual_deposit',  -- user-added deposit (rare)
    'spend',           -- user spent the reward
    'adjustment'       -- corrections
  )),
  description text,
  reference_id text,   -- e.g. workout session id, exercise id; opaque
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_guilt_free_wallet_user_date
  on public.guilt_free_wallet (user_id, occurred_at desc);

create index if not exists idx_guilt_free_wallet_user_source
  on public.guilt_free_wallet (user_id, source);

-- Prevent the same reward event from being inserted twice if Reps retries a
-- sync. Reps generates a stable reference_id per session+source pair.
create unique index if not exists uniq_guilt_free_wallet_user_ref_source
  on public.guilt_free_wallet (user_id, reference_id, source)
  where reference_id is not null;

alter table public.guilt_free_wallet enable row level security;

create policy "guilt_free_wallet_select_own"
  on public.guilt_free_wallet for select
  using (auth.uid() = user_id);

create policy "guilt_free_wallet_insert_own"
  on public.guilt_free_wallet for insert
  with check (auth.uid() = user_id);

create policy "guilt_free_wallet_update_own"
  on public.guilt_free_wallet for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "guilt_free_wallet_delete_own"
  on public.guilt_free_wallet for delete
  using (auth.uid() = user_id);
