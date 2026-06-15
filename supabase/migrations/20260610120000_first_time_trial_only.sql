-- Restrict the 7-day free trial to first-time subscribers.
--
-- Previously dodo-checkout hardcoded trial_period_days: 7 on every subscription it created, so a
-- user could cancel and re-subscribe to get a fresh free week each time (cancel → re-subscribe →
-- repeat). We now track whether a user has ever started a trial/subscription and only grant the
-- trial when they have not.
--
-- Flow:
--   * dodo-checkout reads profiles.has_used_trial and sets trial_period_days to 7 only when false.
--   * admin_apply_subscription (the verified webhook path) flips has_used_trial to true the first
--     time a subscription becomes trialing/active. This is the authoritative signal that a trial
--     was actually consumed — marking it at checkout time would wrongly lock out a user who
--     abandoned checkout before the trial started.

-- ── Trial-usage column ──────────────────────────────────────────────────────────
alter table public.profiles add column if not exists has_used_trial boolean not null default false;

-- ── Extend column protection to has_used_trial ────────────────────────────────────
-- Same rule as the other billing columns: only the service role (webhook) or our trusted RPCs
-- (which set the transaction-local flag) may change it. A client resetting it to false would
-- re-open the trial-abuse hole, so client writes are reverted.
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
    new.has_used_trial := false;
  else -- UPDATE
    new.plan := old.plan;
    new.ai_credits := old.ai_credits;
    new.plan_status := old.plan_status;
    new.dodo_customer_id := old.dodo_customer_id;
    new.dodo_subscription_id := old.dodo_subscription_id;
    new.has_used_trial := old.has_used_trial;
  end if;

  return new;
end;
$$;

-- ── Mark the trial as consumed when a subscription becomes trialing/active ─────────
-- Identical to the prior version except active/trialing grants now also set has_used_trial = true
-- (it is never reset to false here — once used, always used).
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
           has_used_trial = true,
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
