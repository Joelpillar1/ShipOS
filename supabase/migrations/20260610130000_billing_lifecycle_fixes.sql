-- Billing lifecycle fixes for launch.
--
-- 1. Stop refilling AI credits on every "active" webhook event. A single plan change fires a
--    burst of events (subscription.updated / .plan_changed / .renewed / payment.succeeded), and
--    standalone subscription.updated events fire whenever a user edits their card or billing
--    address. Previously each of these reset ai_credits to the full plan allowance AND pushed
--    credits_renews_at out a month — so a user could refill credits mid-cycle just by updating
--    billing info. We now grant the allowance only when the plan actually changes (new
--    subscription, upgrade, or downgrade). Same-plan events preserve the current balance; ordinary
--    monthly renewals are handled on read by _renew_credits_if_due.
--
-- 2. Cancel at period end. subscription.cancelled now KEEPS the plan + credits and only flags
--    plan_status = 'cancelled' (so the UI can show "cancels at period end"); the actual downgrade
--    to Free happens when the subscription truly ends (subscription.expired → status 'expired').

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
    -- Grant the plan. Refill credits + reset the cycle ONLY when the plan actually changes
    -- (v_norm <> existing plan: new subscription, upgrade, or downgrade). Same-plan events
    -- (card/address updates, renewals, recovered payments) preserve the current balance; renewals
    -- refill on read via _renew_credits_if_due. (In an UPDATE's SET, a bare column name refers to
    -- the row's current/old value.)
    update public.profiles
       set plan = v_norm,
           plan_status = v_status,
           ai_credits = case when v_norm <> plan then plan_allowance(v_norm) else ai_credits end,
           credits_renews_at = case when v_norm <> plan then now() + interval '1 month' else credits_renews_at end,
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

  elsif v_status = 'cancelled' then
    -- Cancellation scheduled: keep the plan and credits until the subscription actually ends.
    -- Flag the status only, so the user retains the access they have paid for.
    update public.profiles
       set plan_status = 'cancelled',
           dodo_subscription_id = coalesce(p_subscription_id, dodo_subscription_id),
           dodo_customer_id = coalesce(p_customer_id, dodo_customer_id),
           updated_at = now()
     where id = p_user_id
    returning * into v_row;

  else -- 'expired' / 'ended' / any terminal status → the subscription has truly ended: downgrade.
    update public.profiles
       set plan = 'Free',
           ai_credits = 0,
           plan_status = 'inactive',
           dodo_subscription_id = coalesce(p_subscription_id, dodo_subscription_id),
           dodo_customer_id = coalesce(p_customer_id, dodo_customer_id),
           updated_at = now()
     where id = p_user_id
    returning * into v_row;
  end if;

  return v_row;
end;
$$;
