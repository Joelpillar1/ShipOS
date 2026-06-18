-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: User signup synchronization webhook
-- Triggers whenever a new row is created in `public.profiles` (on user signup).
-- Calls the `handle-signup` edge function to add the contact to Resend and send
-- a welcome email.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create the trigger function to dispatch HTTP post via pg_net
CREATE OR REPLACE FUNCTION public.handle_profile_signup_webhook()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url     := current_setting('app.supabase_url') || '/functions/v1/handle-signup',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key')
    ),
    body    := jsonb_build_object(
      'record', row_to_json(NEW)
    )::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind the trigger function to profiles INSERT event
CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_profile_signup_webhook();
