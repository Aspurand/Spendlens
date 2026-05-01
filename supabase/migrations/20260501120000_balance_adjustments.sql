-- One-off credit/debit adjustments to bank/debit accounts. Audit trail for
-- the +/- modal: friend paid me back, paid friend, loan repayment, etc.
-- Also stores amount + direction separately so the UI can keep the displayed
-- amount positive and let direction drive the sign.
create table if not exists public.balance_adjustments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.cards(id) on delete cascade,
  direction text not null check (direction in ('in', 'out')),
  amount numeric not null check (amount > 0),
  category text not null check (category in (
    'friend_payment',
    'loan_payment',
    'loan_disbursement',
    'refund',
    'reimbursement',
    'gift_received',
    'gift_given',
    'fee',
    'interest_earned',
    'cash_deposit',
    'cash_withdrawal',
    'other'
  )),
  note text,
  adjusted_at date not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_balance_adjustments_user_account_date
  on public.balance_adjustments (user_id, account_id, adjusted_at desc);

alter table public.balance_adjustments enable row level security;

create policy "balance_adjustments_select_own"
  on public.balance_adjustments for select
  using (auth.uid() = user_id);

create policy "balance_adjustments_insert_own"
  on public.balance_adjustments for insert
  with check (auth.uid() = user_id);

create policy "balance_adjustments_update_own"
  on public.balance_adjustments for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "balance_adjustments_delete_own"
  on public.balance_adjustments for delete
  using (auth.uid() = user_id);
