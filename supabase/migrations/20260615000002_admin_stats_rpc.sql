-- Create a secure RPC function to aggregate admin dashboard statistics.
-- This runs as SECURITY DEFINER so it can query counts across all tables
-- (profiles, posts, workspaces, auth.users) regardless of individual client RLS restrictions.

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_admin boolean;
  v_result json;
BEGIN
  -- 1. Security Check: verify the caller email is in the admins database table
  v_is_admin := public.is_admin_email(auth.jwt() ->> 'email');
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Access Denied: Not authorized as an administrator.';
  END IF;

  -- 2. Aggregate counts and trends into a consolidated JSON payload
  SELECT json_build_object(
    'kpis', (
      SELECT json_build_object(
        'totalUsers', count(*),
        'paidUsers', count(*) FILTER (WHERE plan <> 'Free'),
        'trialingUsers', count(*) FILTER (WHERE plan_status = 'trialing'),
        'mrr', coalesce(sum(CASE WHEN plan = 'Pro' AND plan_status = 'active' THEN 49 WHEN plan = 'Creator' AND plan_status = 'active' THEN 29 WHEN plan = 'Starter' AND plan_status = 'active' THEN 19 ELSE 0 END), 0),
        'workspaces', (SELECT count(*) FROM public.workspaces),
        'postsShipped', (SELECT count(*) FROM public.posts WHERE status = 'posted')
      ) FROM public.profiles
    ),
    'users', (
      -- Retrieve recently joined users with count of posts dispatched
      SELECT coalesce(json_agg(t), '[]'::json) FROM (
        SELECT id, name, email, plan, plan_status, ai_credits, joined_date, avatar_url,
               (SELECT count(*) FROM public.posts WHERE user_id = p.id) as posts_count
        FROM public.profiles p
        ORDER BY id DESC
        LIMIT 100
      ) t
    ),
    'signup_trends', (
      -- Group signups by day for the last 30 days
      SELECT coalesce(json_agg(t), '[]'::json) FROM (
        SELECT to_char(u.created_at, 'Mon DD') as date,
               count(*) FILTER (WHERE p.plan = 'Free') as "Free",
               count(*) FILTER (WHERE p.plan = 'Starter') as "Starter",
               count(*) FILTER (WHERE p.plan = 'Creator') as "Creator",
               count(*) FILTER (WHERE p.plan = 'Pro') as "Pro"
        FROM public.profiles p
        JOIN auth.users u ON p.id = u.id
        WHERE u.created_at > now() - interval '30 days'
        GROUP BY to_char(u.created_at, 'Mon DD'), to_char(u.created_at, 'YYYY-MM-DD')
        ORDER BY to_char(u.created_at, 'YYYY-MM-DD') ASC
      ) t
    ),
    'monthly_post_output', (
      -- Group posts by status and month for the last 6 months
      SELECT coalesce(json_agg(t), '[]'::json) FROM (
        SELECT to_char(created_at, 'Mon') as month,
               count(*) FILTER (WHERE status = 'posted') as "Posted",
               count(*) FILTER (WHERE status = 'scheduled') as "Scheduled",
               count(*) FILTER (WHERE status = 'draft') as "Drafted"
        FROM public.posts
        WHERE created_at > now() - interval '6 months'
        GROUP BY to_char(created_at, 'Mon'), to_char(created_at, 'MM')
        ORDER BY to_char(created_at, 'MM') ASC
      ) t
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;
