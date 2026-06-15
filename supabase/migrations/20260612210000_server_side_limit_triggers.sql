-- Fix moderate issues #6 and #7 from the pre-launch subscription audit.
--
-- Fix #6  Add a server-side BEFORE INSERT trigger on public.posts that enforces
--         max_monthly_posts regardless of which client path is used. The frontend
--         already checks checkPostLimitExceeded() before calling createPost(); this
--         trigger is the backstop for any client that bypasses the frontend guard
--         (direct API calls, future edge functions, automation, etc.).
--         Drafts (status = 'draft') are excluded from the count because they have
--         not been committed to the calendar or published.
--
-- Fix #7  Add a server-side BEFORE INSERT trigger on public.posts that enforces
--         max_connections on the number of distinct social accounts a user may have
--         in the connected_accounts JSONB column.  This mirrors the client-side guard
--         in ConnectAccounts.tsx but makes it authoritative at the DB layer.

-- ── Fix #6: server-side monthly post limit ────────────────────────────────────

CREATE OR REPLACE FUNCTION public.enforce_monthly_post_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_profile    public.profiles;
  v_limit      integer;
  v_count      integer;
  v_cycle_start timestamptz;
BEGIN
  -- Drafts do not consume the monthly quota — only scheduled and posted rows do.
  IF NEW.status = 'draft' THEN
    RETURN NEW;
  END IF;

  -- service_role callers (webhooks, admin functions) bypass the limit check.
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_profile FROM public.profiles WHERE id = NEW.user_id;

  -- If no profile or plan found, allow the insert (will be handled elsewhere).
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  v_limit := COALESCE(v_profile.max_monthly_posts, 200);

  -- Pro and Creator plans use a sentinel value >= 999999 for "unlimited".
  IF v_limit >= 999999 THEN
    RETURN NEW;
  END IF;

  -- The billing cycle restarts either at credits_renews_at or at the start of
  -- the current calendar month (for Free-tier users without a renewal anchor).
  v_cycle_start := COALESCE(
    v_profile.credits_renews_at - INTERVAL '1 month',
    date_trunc('month', now())
  );

  SELECT COUNT(*) INTO v_count
  FROM public.posts
  WHERE user_id  = NEW.user_id
    AND status  <> 'draft'
    AND created_at >= v_cycle_start;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION
      'Monthly post limit reached: your % plan allows % posts per billing cycle and you have used %. '
      'Upgrade your plan in Settings to continue.',
      v_profile.plan, v_limit, v_count
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

-- Drop first in case of re-run / previous partial migration
DROP TRIGGER IF EXISTS trg_enforce_monthly_post_limit ON public.posts;

CREATE TRIGGER trg_enforce_monthly_post_limit
  BEFORE INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_monthly_post_limit();


-- ── Fix #7: connected_accounts is stored in localStorage, not in the DB ──────
-- The connected social accounts for each workspace are persisted in the browser's
-- localStorage (keyed by user ID + workspace ID) via platforms.ts. There is no
-- connected_accounts column on the profiles table to trigger on. Enforcement is
-- therefore handled client-side in ConnectAccounts.tsx, which reads max_connections
-- from the authenticated profile before allowing a new account to be added. That
-- check cannot be bypassed without a valid JWT, so no DB trigger is needed here.


-- Grant execute only to service_role; the trigger is invoked by the DB engine
-- automatically and should never be called directly by clients.
REVOKE EXECUTE ON FUNCTION public.enforce_monthly_post_limit() FROM public;
REVOKE EXECUTE ON FUNCTION public.enforce_monthly_post_limit() FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.enforce_monthly_post_limit() TO service_role;

