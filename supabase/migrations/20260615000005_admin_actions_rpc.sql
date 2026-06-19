-- Create a secure RPC function to perform admin operations on users.
-- Bypasses general client column protection securely via SECURITY DEFINER,
-- after verifying the caller is authenticated as an administrator.

CREATE OR REPLACE FUNCTION public.admin_perform_user_action(
  p_target_user_id uuid,
  p_action text,
  p_param text DEFAULT null
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_is_admin boolean;
  v_result json;
  v_param_int integer;
  v_profile public.profiles;
BEGIN
  -- 1. Security Check: verify the caller email is an admin
  v_is_admin := public.is_admin_email(auth.jwt() ->> 'email');
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Access Denied: Not authorized as an administrator.';
  END IF;

  -- 2. Execute Action
  IF p_action = 'force_upgrade' THEN
    -- Param is the plan name: 'Starter', 'Creator', or 'Pro'
    IF p_param IS NULL OR p_param NOT IN ('Starter', 'Creator', 'Pro', 'Free') THEN
      p_param := 'Pro';
    END IF;
    
    SELECT * INTO v_profile FROM public.admin_apply_subscription(
      p_target_user_id,
      p_param,
      'active'
    );
    
    v_result := json_build_object(
      'success', true,
      'message', 'Plan successfully set to ' || p_param,
      'profile', row_to_json(v_profile)
    );

  ELSIF p_action = 'add_credits' THEN
    -- Param is the amount of credits to add
    BEGIN
      v_param_int := p_param::integer;
    EXCEPTION WHEN OTHERS THEN
      v_param_int := 1000; -- default bonus
    END;

    -- Bypass client protection using transaction session settings
    PERFORM set_config('app.allow_privileged_profile_write', 'on', true);

    UPDATE public.profiles
       SET ai_credits = ai_credits + v_param_int,
           updated_at = now()
     WHERE id = p_target_user_id
     RETURNING * INTO v_profile;

    v_result := json_build_object(
      'success', true,
      'message', v_param_int || ' AI credits added successfully.',
      'profile', row_to_json(v_profile)
    );

  ELSIF p_action = 'suspend' THEN
    -- Suspend by setting plan to Free and plan_status to inactive
    SELECT * INTO v_profile FROM public.admin_apply_subscription(
      p_target_user_id,
      'Free',
      'inactive'
    );

    v_result := json_build_object(
      'success', true,
      'message', 'User successfully suspended (downgraded to Free/inactive).',
      'profile', row_to_json(v_profile)
    );

  ELSE
    RAISE EXCEPTION 'Unknown admin action: %', p_action;
  END IF;

  RETURN v_result;
END;
$$;
