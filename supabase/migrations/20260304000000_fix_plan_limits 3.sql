-- Migration: Fix plan limits
-- 1. Corrects Pro daily analysis cap: 500 → 100 (aligns with PLAN_LIMITS constants and comments)
-- 2. Confirms Plus weekly analysis cap: 200/week (already correct in DB)

CREATE OR REPLACE FUNCTION check_analysis_limit(p_user_id UUID, p_source_type TEXT DEFAULT 'manual')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier TEXT;
  v_count INT;
  v_today_inbound_jobs_count INT;
  v_today_email_count INT;
  v_is_admin BOOLEAN;
  v_is_tester BOOLEAN;
  v_email_verified BOOLEAN;
  
  -- Limits
  v_inbound_email_limit INT;
  v_inbound_job_limit INT;
  v_total_job_limit INT;
BEGIN
  -- Get user details
  SELECT subscription_tier, job_analyses_count, is_admin, is_tester, email_verified
  INTO v_tier, v_count, v_is_admin, v_is_tester, v_email_verified
  FROM profiles
  WHERE id = p_user_id;

  -- Resolve Tier Limits
  IF v_is_admin OR v_is_tester THEN
    v_inbound_email_limit := 100;
    v_inbound_job_limit := 500;
    v_total_job_limit := 1000000;
  ELSIF v_tier = 'pro' THEN
    v_inbound_email_limit := 100;
    v_inbound_job_limit := 500;
    v_total_job_limit := 100; -- Daily limit
  ELSIF v_tier = 'plus' THEN
    v_inbound_email_limit := 10;
    v_inbound_job_limit := 25;
    v_total_job_limit := 200; -- Weekly limit
  ELSE -- Free
    v_inbound_email_limit := 0;
    v_inbound_job_limit := 0;
    v_total_job_limit := 3; -- Lifetime limit
  END IF;

  -- 0. Email Verification Gate
  IF NOT v_is_admin AND NOT v_is_tester AND NOT v_email_verified THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'email_unverified',
      'message', 'Please verify your email address to use AI credits.'
    );
  END IF;

  -- 1. Anti-Abuse: Cross-Account Checks (Free Tier only)
  IF v_tier = 'free' THEN
    DECLARE
      v_abuse_owner_id UUID;
      v_normalized_email TEXT;
      v_device_id TEXT;
    BEGIN
      SELECT normalized_email, device_id INTO v_normalized_email, v_device_id
      FROM profiles WHERE id = p_user_id;

      -- A. Check Device Fingerprint
      SELECT id INTO v_abuse_owner_id
      FROM profiles
      WHERE device_id = v_device_id
      AND id != p_user_id
      AND job_analyses_count >= v_total_job_limit
      LIMIT 1;

      IF v_abuse_owner_id IS NOT NULL THEN
        RETURN jsonb_build_object(
          'allowed', false,
          'reason', 'device_limit_reached',
          'message', 'A different account on this device has already used the free credits.'
        );
      END IF;

      -- B. Check Normalized Email (Gmail dots/plus abuse)
      SELECT id INTO v_abuse_owner_id
      FROM profiles
      WHERE normalized_email = v_normalized_email
      AND id != p_user_id
      AND job_analyses_count >= v_total_job_limit
      LIMIT 1;

      IF v_abuse_owner_id IS NOT NULL THEN
        RETURN jsonb_build_object(
          'allowed', false,
          'reason', 'email_alias_limit_reached',
          'message', 'A different alias of this email address has already used the free credits.'
        );
      END IF;
    END;
  END IF;

  -- 2. Analysis Count Check
  IF v_tier = 'pro' THEN
    -- Pro: 100/day
    SELECT COALESCE(SUM(analysis_count), 0) INTO v_count
    FROM daily_usage
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
    
    IF v_count >= v_total_job_limit THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'daily_limit_reached',
        'used', v_count,
        'limit', v_total_job_limit
      );
    END IF;
  ELSIF v_tier = 'plus' THEN
    -- Plus: 200/week (rolling 7 days)
    SELECT COALESCE(SUM(analysis_count), 0) INTO v_count
    FROM daily_usage
    WHERE user_id = p_user_id AND date > CURRENT_DATE - INTERVAL '7 days';
    
    IF v_count >= v_total_job_limit THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'weekly_limit_reached',
        'used', v_count,
        'limit', v_total_job_limit
      );
    END IF;
  ELSE -- Free (Lifetime)
    IF v_count >= v_total_job_limit THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'free_limit_reached',
        'used', v_count,
        'limit', v_total_job_limit
      );
    END IF;
  END IF;

  -- 3. Inbound Email Specific Gates
  IF p_source_type = 'email' THEN
    SELECT COUNT(*)
    INTO v_today_inbound_jobs_count
    FROM jobs
    WHERE user_id = p_user_id
    AND source_type = 'email'
    AND date_added::date = CURRENT_DATE;

    IF v_today_inbound_jobs_count >= v_inbound_job_limit THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'daily_limit_reached',
        'used', v_today_inbound_jobs_count,
        'limit', v_inbound_job_limit
      );
    END IF;
  END IF;

  -- 4. Daily Token Usage Ceiling (Emergency Safety Fuse)
  IF NOT v_is_admin AND NOT v_is_tester THEN
    DECLARE
      v_token_count INT;
      v_token_limit INT;
    BEGIN
      IF v_tier = 'pro' THEN v_token_limit := 5000000;
      ELSIF v_tier = 'plus' THEN v_token_limit := 1000000;
      ELSE v_token_limit := 250000;
      END IF;

      SELECT COALESCE(SUM(token_count), 0) INTO v_token_count
      FROM daily_usage
      WHERE user_id = p_user_id AND date = CURRENT_DATE;

      IF v_token_count >= v_token_limit THEN
        RETURN jsonb_build_object(
          'allowed', false,
          'reason', 'token_limit_reached',
          'used', v_token_count,
          'limit', v_token_limit,
          'message', 'Daily token usage exceeded. Try again tomorrow.'
        );
      END IF;
    END;
  END IF;

  -- All checks passed
  RETURN jsonb_build_object('allowed', true);
END;
$$;
