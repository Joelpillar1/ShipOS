-- Global free-trial ledger to curb trial farming.
--
-- Trial eligibility was previously tracked only by profiles.has_used_trial — a PER-ACCOUNT flag.
-- A user could therefore sign up with a fresh email, get a brand-new profile (has_used_trial =
-- false), and claim another 7-day trial indefinitely. There is no card available before the trial
-- starts (Dodo only charges after the trial), so the strongest signal we can key on up front is
-- the email *mailbox* itself, normalized so the common aliasing tricks resolve to one identity
-- (Gmail "+tag" / dots, googlemail.com, casing).
--
-- This table records, globally across all accounts, which normalized mailboxes have already
-- consumed a trial. dodo-checkout reads it to decide trial eligibility; dodo-webhook writes to it
-- when a subscription actually starts (trialing/active), mirroring when has_used_trial is set.
--
-- RLS is enabled with NO policies: only the service role (the Dodo edge functions) can read or
-- write it. Regular clients get nothing, so the ledger cannot be probed or tampered with.

create table if not exists public.trial_ledger (
  email_norm    text primary key,
  first_user_id uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

alter table public.trial_ledger enable row level security;
