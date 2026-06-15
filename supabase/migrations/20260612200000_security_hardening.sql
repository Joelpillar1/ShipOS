-- Security hardening: fix three critical / moderate bugs found in the pre-launch audit.
--
-- Fix #1  _apply_pending_downgrade_if_due was mistakenly granted to 'authenticated',
--         letting any signed-in user call it with an arbitrary UUID and force-downgrade
--         another subscriber's plan. Revoke the grant; service_role (via renew_my_ai_credits
--         / consume_ai_credits) is the only caller that should ever reach it.
--
-- Fix #2  protect_profile_privileged_columns (UPDATE branch) was missing has_used_trial,
--         plan_status, dodo_customer_id, dodo_subscription_id, pending_plan, and
--         pending_plan_effective_at, introduced by later migrations. A client could therefore
--         reset has_used_trial = false to reclaim unlimited free trials, or manipulate
--         plan_status to appear as active/trialing when they are not.
--
-- Fix #3  The 20260612150000_profile_limits migration replaced set_user_plan with a version
--         that silently removed the Free-only guard from 20260609120000_dodo_payments. Any
--         authenticated user could call set_user_plan('Pro') and the SECURITY DEFINER
--         function would bypass the protect trigger and write 'Pro' directly into profiles.
--         Restore the guard: only 'Free' is allowed via this client-callable RPC; paid plans
--         must flow through the verified Dodo webhook -> admin_apply_subscription path.

-- ── Fix #1: lock down _apply_pending_downgrade_if_due ─────────────────────────
-- Remove the broad 'authenticated' grant that allowed cross-user attacks.
revoke execute on function public._apply_pending_downgrade_if_due(uuid) from authenticated;
revoke execute on function public._apply_pending_downgrade_if_due(uuid) from public;
-- The function is only ever invoked by renew_my_ai_credits and consume_ai_credits,
-- both of which already run with appropriate privilege (security definer / service role).
-- service_role retains implicit EXECUTE on all functions; explicit grant is belt-and-braces.
grant execute on function public._apply_pending_downgrade_if_due(uuid) to service_role;


-- ── Fix #2: harden protect_profile_privileged_columns ─────────────────────────
-- Rebuild the trigger to include every privileged column in the UPDATE branch,
-- across all migrations: plan, ai_credits, plan_status, dodo_customer_id,
-- dodo_subscription_id, has_used_trial, pending_plan, pending_plan_effective_at,
-- and all max_* limit columns.
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
    -- Clients may never self-provision a paid plan, credits, billing status, or raised limits.
    new.plan                    := 'Free';
    new.ai_credits              := 0;
    new.plan_status             := 'inactive';
    new.dodo_customer_id        := null;
    new.dodo_subscription_id    := null;
    new.has_used_trial          := false;
    new.pending_plan            := null;
    new.pending_plan_effective_at := null;
    new.max_workspaces          := 1;
    new.max_connections         := 5;
    new.max_bulk_posts          := 10;
    new.max_monthly_posts       := 200;
    new.max_slideshow_slides     := 0;
  else -- UPDATE: revert every privileged column to its current (old) value
    new.plan                    := old.plan;
    new.ai_credits              := old.ai_credits;
    new.plan_status             := old.plan_status;
    new.dodo_customer_id        := old.dodo_customer_id;
    new.dodo_subscription_id    := old.dodo_subscription_id;
    new.has_used_trial          := old.has_used_trial;
    new.pending_plan            := old.pending_plan;
    new.pending_plan_effective_at := old.pending_plan_effective_at;
    new.max_workspaces          := old.max_workspaces;
    new.max_connections         := old.max_connections;
    new.max_bulk_posts          := old.max_bulk_posts;
    new.max_monthly_posts       := old.max_monthly_posts;
    new.max_slideshow_slides     := old.max_slideshow_slides;
  end if;

  return new;
end;
$$;


-- ── Fix #3: restore the Free-only guard in set_user_plan ──────────────────────
-- The 20260612150000 migration replaced set_user_plan with a version that accepts all
-- plan names (Starter, Creator, Pro) and updates them via SECURITY DEFINER, thereby
-- allowing any authenticated user to grant themselves a paid plan for free.
-- This replacement restores the original restriction: only 'Free' is accepted; any
-- attempt to set a paid plan raises an exception.  The max_* limit columns are NOT
-- touched here (they are set by admin_apply_subscription on the webhook path).
create or replace function public.set_user_plan(p_plan text)
returns public.profiles
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_uid  uuid := auth.uid();
  v_norm text;
  v_row  public.profiles;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  v_norm := case lower(coalesce(p_plan, ''))
    when 'free'    then 'Free'
    when 'starter' then 'Starter'
    when 'creator' then 'Creator'
    when 'pro'     then 'Pro'
    else null
  end;

  if v_norm is null then
    raise exception 'Invalid plan: %', p_plan;
  end if;

  -- CRITICAL GUARD: paid plans must be provisioned by the verified Dodo webhook via
  -- admin_apply_subscription. A direct client call attempting a paid plan is rejected.
  if v_norm <> 'Free' then
    raise exception 'Paid plans are provisioned through checkout, not set_user_plan';
  end if;

  perform set_config('app.allow_privileged_profile_write', 'on', true);

  -- Downgrade to Free: clear billing status and credits. The plan label and limits are
  -- reset here; the webhook handles all upward transitions.
  update public.profiles
     set plan        = 'Free',
         ai_credits  = 0,
         plan_status = 'inactive',
         updated_at  = now()
   where id = v_uid
  returning * into v_row;

  return v_row;
end;
$$;

-- Re-apply the same grants as the original (authenticated users call this for themselves).
revoke execute on function public.set_user_plan(text) from public;
grant  execute on function public.set_user_plan(text) to authenticated;
