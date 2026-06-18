-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Grace period for expired subscriptions
-- When a subscription expires or is cancelled, users get a 3-day grace window
-- during which their scheduled posts continue to run. After 3 days without
-- renewal the `expire-grace-periods` edge function cancels all scheduled posts
-- and downgrades the account to Free.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add the grace_period_ends_at column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS grace_period_ends_at timestamptz DEFAULT NULL;

COMMENT ON COLUMN profiles.grace_period_ends_at IS
  'Set to NOW() + 3 days when a subscription expires/cancels. Cleared on renewal '
  'or when the grace period expires and the account is downgraded to Free.';

-- 2. Schedule the expire-grace-periods edge function to run every hour via pg_cron.
--    Requires: pg_cron extension + pg_net extension (both available on Supabase).
--    Enable them in Dashboard → Database → Extensions if not already active.
SELECT cron.schedule(
  'expire-grace-periods',       -- job name (unique)
  '0 * * * *',                  -- every hour on the hour
  $$
    SELECT net.http_post(
      url     := current_setting('app.supabase_url') || '/functions/v1/expire-grace-periods',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body    := '{}'::jsonb
    );
  $$
);
