-- Strictly enforce per-plan AI credits.
--
-- Problem: profiles.ai_credits and profiles.plan were freely writable by any signed-in
-- client (the UPDATE policy had no WITH CHECK), and the credit decrement happened in the
-- browser after the AI call. So credits were not actually enforceable.
--
-- This migration makes plan/credits server-authoritative:
--   * a trigger blocks clients from changing plan/ai_credits (only the service role used by
--     the openai edge function, or our trusted SECURITY DEFINER RPCs, may change them);
--   * consume_ai_credits/refund_ai_credits give the edge function a race-safe atomic
--     decrement + refund primitive;
--   * set_user_plan is the single trusted path that grants a plan's allowance, and only
--     refills credits on a genuine upgrade (or first-time provisioning) — never on
--     re-selecting the same plan, so a user out of credits must upgrade to get more.
--
-- Subscription model: this is a monthly subscription SaaS. Each billing month the plan's
-- credit allowance is refreshed (Starter 100, Creator 400, Pro unlimited). Until a payment
-- provider is wired up, renewal is modelled as a time-based monthly cycle anchored to when
-- the plan was set (credits_renews_at). The renewal logic lives in _renew_credits_if_due so
-- a future billing webhook (e.g. Stripe invoice.paid) can call the same path.
--
-- Allowances: Free = 0 (no AI), Starter = 100, Creator = 400, Pro = unlimited.

-- New users start with no credits until onboarding provisions a plan via set_user_plan().
alter table public.profiles alter column ai_credits set default 0;

-- When the current credit period ends; on/after this the allowance is refreshed.
alter table public.profiles add column if not exists credits_renews_at timestamptz;

-- ── Plan helpers ─────────────────────────────────────────────────────────────
-- Rank used to distinguish upgrades from same-plan/downgrade.
create or replace function public.plan_rank(p_plan text)
returns integer
language sql
immutable
as $$
  select case lower(coalesce(p_plan, 'free'))
    when 'pro' then 3
    when 'creator' then 2
    when 'starter' then 1
    else 0
  end;
$$;

-- Per-plan credit allowance. Pro is effectively unlimited (high sentinel; code never
-- decrements Pro).
create or replace function public.plan_allowance(p_plan text)
returns integer
language sql
immutable
as $$
  select case lower(coalesce(p_plan, 'free'))
    when 'pro' then 999999
    when 'creator' then 400
    when 'starter' then 100
    else 0
  end;
$$;

-- ── Monthly renewal ───────────────────────────────────────────────────────────
-- Refreshes a user's credits to their plan allowance once the billing period elapses.
-- Idempotent and safe to call often: it only writes when a renewal is actually due.
--   * Free  → nothing (no AI access).
--   * Pro   → nothing to refill (unlimited / never decremented), period still advanced.
--   * Starter/Creator → on/after credits_renews_at, set ai_credits = allowance and advance
--     credits_renews_at by whole months until it is in the future (a single grant even if
--     the user was away for several months — allowances do not stack).
-- For rows provisioned before this column existed, a NULL credits_renews_at is initialised
-- to one month out WITHOUT touching the current balance.
create or replace function public._renew_credits_if_due(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_plan text;
  v_renews timestamptz;
  v_next timestamptz;
begin
  select plan, credits_renews_at into v_plan, v_renews
    from public.profiles where id = p_user_id for update;

  if v_plan is null or lower(v_plan) = 'free' then
    return;
  end if;

  perform set_config('app.allow_privileged_profile_write', 'on', true);

  if v_renews is null then
    -- Backfill: anchor the cycle without altering the existing balance.
    update public.profiles
       set credits_renews_at = now() + interval '1 month'
     where id = p_user_id;
    return;
  end if;

  if now() >= v_renews then
    v_next := v_renews;
    while v_next <= now() loop
      v_next := v_next + interval '1 month';
    end loop;

    update public.profiles
       set ai_credits = plan_allowance(v_plan),
           credits_renews_at = v_next,
           updated_at = now()
     where id = p_user_id;
  end if;
end;
$$;

-- ── Column protection trigger ────────────────────────────────────────────────
-- Reverts any client attempt to change plan/ai_credits. The service role (edge function)
-- and our trusted RPCs (which set the transaction-local flag) are allowed through.
create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_privileged boolean;
begin
  v_privileged :=
    auth.role() = 'service_role'
    or coalesce(current_setting('app.allow_privileged_profile_write', true), '') = 'on';

  if v_privileged then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Clients may never self-provision a paid plan or credits.
    new.plan := 'Free';
    new.ai_credits := 0;
  else -- UPDATE
    new.plan := old.plan;
    new.ai_credits := old.ai_credits;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_columns on public.profiles;
create trigger protect_profile_privileged_columns
  before insert or update on public.profiles
  for each row
  execute function public.protect_profile_privileged_columns();

-- ── Atomic credit reservation / refund (used by the openai edge function) ──────
-- Decrements only if enough credits remain. Returns the new balance, or NULL when the
-- caller does not have p_amount credits (so the edge function can reject the request).
create or replace function public.consume_ai_credits(p_user_id uuid, p_amount integer)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_remaining integer;
begin
  perform set_config('app.allow_privileged_profile_write', 'on', true);

  -- Refresh the monthly allowance first if the billing period has elapsed, so a user is
  -- never wrongly blocked at the start of a new month.
  perform public._renew_credits_if_due(p_user_id);

  update public.profiles
     set ai_credits = ai_credits - p_amount,
         updated_at = now()
   where id = p_user_id
     and ai_credits >= p_amount
  returning ai_credits into v_remaining;

  -- v_remaining is NULL when no row matched (insufficient credits / unknown user).
  return v_remaining;
end;
$$;

create or replace function public.refund_ai_credits(p_user_id uuid, p_amount integer)
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_remaining integer;
begin
  perform set_config('app.allow_privileged_profile_write', 'on', true);

  update public.profiles
     set ai_credits = ai_credits + p_amount,
         updated_at = now()
   where id = p_user_id
  returning ai_credits into v_remaining;

  return v_remaining;
end;
$$;

-- ── Trusted plan provisioning / upgrade ────────────────────────────────────────
-- The ONLY way a plan + its credit allowance is granted. Credits are (re)granted only on a
-- genuine upgrade or first-time provisioning; re-selecting the same plan or downgrading
-- leaves the current balance untouched, so an out-of-credits user cannot refill without
-- upgrading. Callable by the authenticated user (acts on their own row only).
create or replace function public.set_user_plan(p_plan text)
returns public.profiles
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_uid uuid := auth.uid();
  v_norm text;
  v_current text;
  v_is_upgrade boolean;
  v_row public.profiles;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Normalise to the canonical capitalisation we store.
  v_norm := case lower(coalesce(p_plan, ''))
    when 'pro' then 'Pro'
    when 'creator' then 'Creator'
    when 'starter' then 'Starter'
    when 'free' then 'Free'
    else null
  end;

  if v_norm is null then
    raise exception 'Invalid plan: %', p_plan;
  end if;

  select plan into v_current from public.profiles where id = v_uid;

  -- Upgrade (or first-time provisioning from Free/NULL) grants the new allowance.
  v_is_upgrade := plan_rank(v_norm) > plan_rank(v_current);

  perform set_config('app.allow_privileged_profile_write', 'on', true);

  if v_is_upgrade then
    -- Grant the new allowance and start a fresh monthly billing cycle.
    update public.profiles
       set plan = v_norm,
           ai_credits = plan_allowance(v_norm),
           credits_renews_at = now() + interval '1 month',
           updated_at = now()
     where id = v_uid
    returning * into v_row;
  else
    -- Same plan or downgrade: change the label only, never refill credits or reset the cycle.
    update public.profiles
       set plan = v_norm,
           updated_at = now()
     where id = v_uid
    returning * into v_row;
  end if;

  return v_row;
end;
$$;

-- Renew-if-due for the calling user, then return their (possibly refreshed) profile. The
-- client calls this when loading the profile so the displayed balance reflects a new month
-- without requiring an AI call. Safe to expose to authenticated users: it acts only on
-- auth.uid()'s own row and only grants when the period has genuinely elapsed (no early refill).
create or replace function public.renew_my_ai_credits()
returns public.profiles
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.profiles;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  perform public._renew_credits_if_due(v_uid);

  select * into v_row from public.profiles where id = v_uid;
  return v_row;
end;
$$;

-- Lock down execution. The decrement/refund primitives and the internal renewal helper take
-- an arbitrary p_user_id, so they must NOT be callable by clients (a user could otherwise
-- drain/grant another user's credits) — they are reserved for the service role (the openai
-- edge function), which bypasses these grants. set_user_plan and renew_my_ai_credits act only
-- on auth.uid()'s own row, so authenticated users may call them. Revoke from PUBLIC because
-- Postgres grants EXECUTE to PUBLIC by default.
revoke execute on function public.consume_ai_credits(uuid, integer) from public;
revoke execute on function public.refund_ai_credits(uuid, integer) from public;
revoke execute on function public._renew_credits_if_due(uuid) from public;
revoke execute on function public.set_user_plan(text) from public;
revoke execute on function public.renew_my_ai_credits() from public;
grant execute on function public.set_user_plan(text) to authenticated;
grant execute on function public.renew_my_ai_credits() to authenticated;
