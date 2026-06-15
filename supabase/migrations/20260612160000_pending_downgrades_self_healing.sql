-- Migration to support self-healing pending plan downgrades on profile reads or credit consumption.
-- Adds the internal function _apply_pending_downgrade_if_due and updates renew_my_ai_credits and consume_ai_credits.

-- 1. Create the helper function to apply pending plan downgrades on-the-fly
create or replace function public._apply_pending_downgrade_if_due(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_plan text;
  v_pending_plan text;
  v_pending_at timestamp with time zone;
  
  v_max_workspaces integer;
  v_max_connections integer;
  v_max_bulk_posts integer;
  v_max_monthly_posts integer;
  v_max_slideshow_slides integer;
  v_allowance integer;
begin
  -- Fetch current plan info
  select plan, pending_plan, pending_plan_effective_at
    into v_plan, v_pending_plan, v_pending_at
    from public.profiles
   where id = p_user_id;

  -- If a pending plan exists and its effective date has passed, apply it
  if v_pending_plan is not null and v_pending_at is not null and now() >= v_pending_at then
    -- Normalise to canonical capitalisation
    v_pending_plan := case lower(coalesce(v_pending_plan, ''))
      when 'pro' then 'Pro'
      when 'creator' then 'Creator'
      when 'starter' then 'Starter'
      else 'Free'
    end;

    -- Determine limits dynamically based on the pending plan
    v_max_workspaces := case lower(v_pending_plan)
      when 'pro' then 999999
      when 'creator' then 5
      else 1
    end;

    v_max_connections := case lower(v_pending_plan)
      when 'pro' then 999999
      when 'creator' then 15
      else 5
    end;

    v_max_bulk_posts := case lower(v_pending_plan)
      when 'pro' then 50
      when 'creator' then 25
      else 10
    end;

    v_max_monthly_posts := case lower(v_pending_plan)
      when 'pro' then 999999
      when 'creator' then 999999
      else 200
    end;

    v_max_slideshow_slides := case lower(v_pending_plan)
      when 'pro' then 10
      when 'creator' then 5
      else 0
    end;

    -- Determine credit allowance for the new plan
    v_allowance := case lower(v_pending_plan)
      when 'pro' then 999999
      when 'creator' then 400
      when 'starter' then 100
      else 0
    end;

    -- Bypass client protection using transaction session local settings
    perform set_config('app.allow_privileged_profile_write', 'on', true);

    -- Apply the plan downgrade, update corresponding limits and allowances, and clear scheduled metadata
    update public.profiles
       set plan = v_pending_plan,
           ai_credits = v_allowance,
           credits_renews_at = now() + interval '1 month',
           max_workspaces = v_max_workspaces,
           max_connections = v_max_connections,
           max_bulk_posts = v_max_bulk_posts,
           max_monthly_posts = v_max_monthly_posts,
           max_slideshow_slides = v_max_slideshow_slides,
           pending_plan = null,
           pending_plan_effective_at = null,
           updated_at = now()
     where id = p_user_id;
  end if;
end;
$$;

-- 2. Update renew_my_ai_credits to run the downgrade check first
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

  -- Apply pending downgrade first if due
  perform public._apply_pending_downgrade_if_due(v_uid);

  -- Renew credits if due
  perform public._renew_credits_if_due(v_uid);

  select * into v_row from public.profiles where id = v_uid;
  return v_row;
end;
$$;

-- 3. Update consume_ai_credits to run the downgrade check first
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

  -- Apply pending downgrade first if due
  perform public._apply_pending_downgrade_if_due(p_user_id);

  -- Refresh the monthly allowance first if the billing period has elapsed
  perform public._renew_credits_if_due(p_user_id);

  update public.profiles
     set ai_credits = ai_credits - p_amount,
         updated_at = now()
   where id = p_user_id
     and ai_credits >= p_amount
  returning ai_credits into v_remaining;

  return v_remaining;
end;
$$;

-- 4. Set executing permissions for security
revoke execute on function public._apply_pending_downgrade_if_due(uuid) from public;
grant execute on function public._apply_pending_downgrade_if_due(uuid) to authenticated;
grant execute on function public._apply_pending_downgrade_if_due(uuid) to service_role;
