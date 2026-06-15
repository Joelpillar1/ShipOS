-- Dodo Payments subscription integration.
--
-- Wires the existing server-authoritative plan/credit system (see
-- 20260608170000_enforce_ai_credits.sql) to a real payment provider. The migration there
-- anticipated this: "a future billing webhook (e.g. Stripe invoice.paid) can call the same
-- path." Here that webhook is Dodo Payments, and admin_apply_subscription is that path.
--
-- Security model unchanged and reinforced:
--   * Clients still cannot write plan / ai_credits (the protect trigger reverts them), and
--     now also cannot write the new billing columns.
--   * set_user_plan is restricted to the Free plan only — the ONLY way to a PAID plan is a
--     verified Dodo webhook calling admin_apply_subscription with the service role.

-- ── Billing columns ───────────────────────────────────────────────────────────
alter table public.profiles add column if not exists dodo_customer_id text;
alter table public.profiles add column if not exists dodo_subscription_id text;
-- inactive | trialing | active | past_due | cancelled
alter table public.profiles add column if not exists plan_status text not null default 'inactive';

-- ── Extend column protection to the billing columns ───────────────────────────
-- Same rule as plan/ai_credits: only the service role (webhook) or our trusted RPCs (which
-- set the transaction-local flag) may change these. Clients get their writes reverted.
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
    new.plan := 'Free';
    new.ai_credits := 0;
    new.plan_status := 'inactive';
    new.dodo_customer_id := null;
    new.dodo_subscription_id := null;
  else -- UPDATE
    new.plan := old.plan;
    new.ai_credits := old.ai_credits;
    new.plan_status := old.plan_status;
    new.dodo_customer_id := old.dodo_customer_id;
    new.dodo_subscription_id := old.dodo_subscription_id;
  end if;

  return new;
end;
$$;

-- ── Restrict client plan selection to Free only ───────────────────────────────
-- Paid plans must now flow through checkout + the Dodo webhook. A direct client call asking
-- for a paid plan is rejected so a signed-in user can no longer grant themselves a paid tier.
create or replace function public.set_user_plan(p_plan text)
returns public.profiles
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_uid uuid := auth.uid();
  v_norm text;
  v_row public.profiles;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  v_norm := case lower(coalesce(p_plan, ''))
    when 'free' then 'Free'
    when 'starter' then 'Starter'
    when 'creator' then 'Creator'
    when 'pro' then 'Pro'
    else null
  end;

  if v_norm is null then
    raise exception 'Invalid plan: %', p_plan;
  end if;

  if v_norm <> 'Free' then
    raise exception 'Paid plans are provisioned through checkout, not set_user_plan';
  end if;

  perform set_config('app.allow_privileged_profile_write', 'on', true);

  -- Selecting Free never refills credits; it only labels the row and clears active billing
  -- status. (A genuine downgrade from a paid plan happens via the webhook on cancellation.)
  update public.profiles
     set plan = 'Free',
         updated_at = now()
   where id = v_uid
  returning * into v_row;

  return v_row;
end;
$$;

-- ── Trusted subscription application (called by the Dodo webhook, service role only) ──────
-- The single path that grants/revokes a PAID plan in response to a verified payment event.
--   active / trialing → grant the plan's allowance and start/refresh the monthly cycle.
--   past_due          → keep the plan + credits (grace period) but flag the status.
--   cancelled/expired → revert to Free with no credits.
-- Always records the Dodo customer/subscription ids when provided.
create or replace function public.admin_apply_subscription(
  p_user_id uuid,
  p_plan text,
  p_status text,
  p_subscription_id text default null,
  p_customer_id text default null
)
returns public.profiles
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_norm text;
  v_status text := lower(coalesce(p_status, ''));
  v_row public.profiles;
begin
  if p_user_id is null then
    raise exception 'admin_apply_subscription: p_user_id is required';
  end if;

  v_norm := case lower(coalesce(p_plan, ''))
    when 'pro' then 'Pro'
    when 'creator' then 'Creator'
    when 'starter' then 'Starter'
    when 'free' then 'Free'
    else null
  end;

  perform set_config('app.allow_privileged_profile_write', 'on', true);

  if v_status in ('active', 'trialing') then
    if v_norm is null or v_norm = 'Free' then
      raise exception 'admin_apply_subscription: active subscription requires a paid plan, got %', p_plan;
    end if;
    update public.profiles
       set plan = v_norm,
           ai_credits = plan_allowance(v_norm),
           plan_status = v_status,
           credits_renews_at = now() + interval '1 month',
           dodo_subscription_id = coalesce(p_subscription_id, dodo_subscription_id),
           dodo_customer_id = coalesce(p_customer_id, dodo_customer_id),
           updated_at = now()
     where id = p_user_id
    returning * into v_row;

  elsif v_status in ('past_due', 'on_hold', 'failed') then
    update public.profiles
       set plan_status = 'past_due',
           dodo_subscription_id = coalesce(p_subscription_id, dodo_subscription_id),
           dodo_customer_id = coalesce(p_customer_id, dodo_customer_id),
           updated_at = now()
     where id = p_user_id
    returning * into v_row;

  else -- cancelled, expired, or anything terminal
    update public.profiles
       set plan = 'Free',
           ai_credits = 0,
           plan_status = 'cancelled',
           dodo_subscription_id = coalesce(p_subscription_id, dodo_subscription_id),
           dodo_customer_id = coalesce(p_customer_id, dodo_customer_id),
           updated_at = now()
     where id = p_user_id
    returning * into v_row;
  end if;

  return v_row;
end;
$$;

-- ── Persist the Dodo customer id from the checkout function (service role) ──────
-- Lets dodo-checkout record the customer id before any webhook arrives, so a returning user
-- reuses the same Dodo customer instead of creating duplicates.
create or replace function public.admin_set_dodo_customer(p_user_id uuid, p_customer_id text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if p_user_id is null or p_customer_id is null then
    return;
  end if;
  perform set_config('app.allow_privileged_profile_write', 'on', true);
  update public.profiles
     set dodo_customer_id = p_customer_id,
         updated_at = now()
   where id = p_user_id
     and dodo_customer_id is null;
end;
$$;

-- ── Lock down execution ────────────────────────────────────────────────────────
-- These take an arbitrary user id and must never be client-callable; they are invoked only
-- by the service role used by the Dodo edge functions.
revoke execute on function public.admin_apply_subscription(uuid, text, text, text, text) from public;
revoke execute on function public.admin_set_dodo_customer(uuid, text) from public;
grant execute on function public.admin_apply_subscription(uuid, text, text, text, text) to service_role;
grant execute on function public.admin_set_dodo_customer(uuid, text) to service_role;
