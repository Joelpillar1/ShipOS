-- Add notification_preferences JSONB column to profiles table.
-- Safe to run multiple times (IF NOT EXISTS guard).
-- The default value matches DEFAULT_NOTIFICATION_PREFS in postStorage.ts.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB
    NOT NULL
    DEFAULT '{"automationEmails": true, "postFailureAlerts": true, "postSummaryEmails": false}'::jsonb;

-- Optional: add a comment so future devs know what this is.
COMMENT ON COLUMN public.profiles.notification_preferences IS
  'User email notification preferences. Keys: automationEmails, postFailureAlerts, postSummaryEmails.';
