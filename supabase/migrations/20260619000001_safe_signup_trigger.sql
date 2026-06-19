-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Make signup webhook trigger safe when Postgres configuration is missing
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_profile_signup_webhook()
RETURNS TRIGGER AS $$
DECLARE
  v_url text;
  v_key text;
BEGIN
  -- Safely retrieve configurations without throwing errors
  BEGIN
    v_url := current_setting('app.supabase_url', true);
    v_key := current_setting('app.service_role_key', true);
  EXCEPTION WHEN OTHERS THEN
    v_url := NULL;
    v_key := NULL;
  END;

  -- Only perform the HTTP post if the configurations are set
  IF v_url IS NOT NULL AND v_key IS NOT NULL THEN
    PERFORM net.http_post(
      url     := v_url || '/functions/v1/handle-signup',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || v_key
      ),
      body    := jsonb_build_object(
        'record', row_to_json(NEW)
      )::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
