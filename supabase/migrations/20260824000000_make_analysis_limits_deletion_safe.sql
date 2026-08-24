-- Count analysis usage from permanent AI logs, not deletable saved-job rows.
-- A user must not be able to reset a paid-plan quota by deleting job history.

CREATE OR REPLACE FUNCTION check_analysis_limit(p_user_id UUID, p_source_type TEXT DEFAULT 'manual')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier TEXT;
  v_is_admin BOOLEAN;
  v_is_tester BOOLEAN;
  v_email_verified BOOLEAN;
  v_lifetime_count INT;
  v_rolling_count INT;
BEGIN
  SELECT subscription_tier, is_admin, is_tester, email_verified, job_analyses_count
  INTO v_tier, v_is_admin, v_is_tester, v_email_verified, v_lifetime_count
  FROM profiles
  WHERE id = p_user_id;

  IF v_is_admin OR v_is_tester THEN
    RETURN jsonb_build_object('allowed', true);
  END IF;

  IF NOT v_email_verified THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'email_unverified');
  END IF;

  IF v_tier = 'free' THEN
    IF v_lifetime_count >= 3 THEN
      RETURN jsonb_build_object('allowed', false, 'reason', 'free_limit_reached', 'used', v_lifetime_count, 'limit', 3);
    END IF;
    RETURN jsonb_build_object('allowed', true);
  END IF;

  IF v_tier = 'plus' THEN
    SELECT COUNT(*) INTO v_rolling_count
    FROM logs
    WHERE user_id = p_user_id
      AND event_type = 'job_extraction'
      AND status = 'success'
      AND created_at >= CURRENT_DATE - INTERVAL '6 days';

    IF v_rolling_count >= 200 THEN
      RETURN jsonb_build_object('allowed', false, 'reason', 'weekly_limit_reached', 'used', v_rolling_count, 'limit', 200);
    END IF;
    RETURN jsonb_build_object('allowed', true);
  END IF;

  IF v_tier = 'pro' THEN
    SELECT COUNT(*) INTO v_rolling_count
    FROM logs
    WHERE user_id = p_user_id
      AND event_type = 'job_extraction'
      AND status = 'success'
      AND created_at::date = CURRENT_DATE;

    IF v_rolling_count >= 100 THEN
      RETURN jsonb_build_object('allowed', false, 'reason', 'daily_limit_reached', 'used', v_rolling_count, 'limit', 100);
    END IF;
    RETURN jsonb_build_object('allowed', true);
  END IF;

  RETURN jsonb_build_object('allowed', true);
END;
$$;
