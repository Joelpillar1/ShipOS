-- Migration to ensure public.admin_apply_subscription configures limit columns dynamically.
-- Updates public.admin_apply_subscription to write workspace, connection, bulk batch, monthly volume, and slideshow slide limits.

create or replace function public.admin_apply_subscription(
  p_user_id uuid,
  p_plan text,
  p_status text,
  p_subscription_id text default null,
  p_customer_id text default null,
  p_pending_plan text default null,
  p_pending_plan_effective_at timestamp with time zone default null
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
  
  v_max_workspaces integer;
  v_max_connections integer;
  v_max_bulk_posts integer;
  v_max_monthly_posts integer;
  v_max_slideshow_slides integer;
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

    -- Determine limits dynamically based on the plan being applied
    v_max_workspaces := case lower(v_norm)
      when 'pro' then 999999
      when 'creator' then 5
      else 1
    end;

    v_max_connections := case lower(v_norm)
      when 'pro' then 999999
      when 'creator' then 15
      else 5
    end;

    v_max_bulk_posts := case lower(v_norm)
      when 'pro' then 50
      when 'creator' then 25
      else 10
    end;

    v_max_monthly_posts := case lower(v_norm)
      when 'pro' then 999999
      when 'creator' then 999999
      else 200
    end;

    v_max_slideshow_slides := case lower(v_norm)
      when 'pro' then 10
      when 'creator' then 5
      else 0
    end;

    -- Grant the plan. Refill credits + reset the cycle ONLY when the plan actually changes
    -- (v_norm <> existing plan: new subscription, upgrade, or downgrade). Same-plan events
    -- (card/address updates, renewals, recovered payments) preserve the current balance; renewals
    -- refill on read via _renew_credits_if_due.
    update public.profiles
       set plan = v_norm,
           plan_status = v_status,
           ai_credits = case when v_norm <> plan then plan_allowance(v_norm) else ai_credits end,
           credits_renews_at = case when v_norm <> plan then now() + interval '1 month' else credits_renews_at end,
           dodo_subscription_id = coalesce(p_subscription_id, dodo_subscription_id),
           dodo_customer_id = coalesce(p_customer_id, dodo_customer_id),
           pending_plan = p_pending_plan,
           pending_plan_effective_at = p_pending_plan_effective_at,
           max_workspaces = v_max_workspaces,
           max_connections = v_max_connections,
           max_bulk_posts = v_max_bulk_posts,
           max_monthly_posts = v_max_monthly_posts,
           max_slideshow_slides = v_max_slideshow_slides,
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
           pending_plan = p_pending_plan,
           pending_plan_effective_at = p_pending_plan_effective_at,
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
           pending_plan = null,
           pending_plan_effective_at = null,
           max_workspaces = 1,
           max_connections = 5,
           max_bulk_posts = 10,
           max_monthly_posts = 200,
           max_slideshow_slides = 0,
           updated_at = now()
     where id = p_user_id
    returning * into v_row;
  end if;

  return v_row;
end;
$$;
