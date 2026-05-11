-- JOB FIT - CONSOLIDATED SUPABASE SCHEMA
-- This file contains the complete database structure, including tables, 
-- security policies (RLS), functions, and performance indexes.

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABLES

-- PROFILES: Mirrors auth.users and stores public profile/subscription info
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  first_name text, -- Added for personalization
  last_name text, -- Added for personalization
  subscription_tier text default 'free',
  is_admin boolean default false,
  is_tester boolean default false,
  job_analyses_count int default 0,
  total_ai_calls int default 0,
  last_analysis_date timestamp with time zone,
  inbound_email_token text unique,
  stripe_customer_id text, -- Stripe Customer ID
  stripe_subscription_id text, -- Stripe Subscription ID
  device_id text, -- Browser fingerprint for abuse prevention
  email_verified boolean default false, -- Email verification status
  normalized_email text, -- Stored without +tags for abuse checks
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RESUMES: Stores parsed resume data blocks
create table resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  name text not null,
  content jsonb not null, -- Stores the ResumeBlock[] array
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- JOBS: Stores saved jobs and analysis
create table jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  job_title text,
  company text,
  original_text text,
  url text,
  location text, -- Added for geographic filtering
  source_type text default 'manual',
  analysis jsonb, -- Stores the Analysis result
  status text default 'new' check (status in ('new', 'saved', 'applied', 'interview', 'offer', 'rejected', 'ghosted', 'feed', 'error', 'analyzing')),
  resume_id text, -- Link to the resume used
  cover_letter text,
  cover_letter_critique jsonb,
  fit_score numeric,
  canonical_role text, -- Added for role farming
  date_added timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CANONICAL_ROLES: Stores standard job titles and their manually-vetted guidelines
create table canonical_roles (
  id text primary key, -- The slug/canonical title (e.g. 'Software Engineer')
  guidelines jsonb, -- Stores promptAdvice, tailoringFocus, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- FEEDBACK: Stores user feedback on AI responses
create table feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  job_id text not null, 
  rating int not null, -- 1 for good, -1 for bad
  context text, -- e.g. "cover_letter" or "resume"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- INVITE CODES: Manages access to the invite-only beta
create table invite_codes (
  code text primary key,
  remaining_uses int not null default 1,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DAILY USAGE: Rate limiting and tracking for requests
create table daily_usage (
  user_id uuid references auth.users(id) not null,
  date date not null default current_date,
  request_count int not null default 0,
  token_count int not null default 0,
  analysis_count int not null default 0, -- Track analyses separately for periodic limits
  primary key (user_id, date)
);

-- USER_SKILLS: Stores verified and manual skills
create table user_skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  name text not null,
  proficiency text default 'beginner' check (proficiency in ('beginner', 'intermediate', 'advanced', 'expert')),
  evidence jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, name)
);

-- LOGS: Stores individual AI interaction history
create table logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id),
  job_id uuid references jobs(id), -- Optional link to specific job context
  event_type text not null,
  model_name text not null,
  prompt_text text,
  response_text text,
  latency_ms int,
  status text check (status in ('success', 'error')),
  error_message text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROLE_MODELS: Stores target professional profiles for gap analysis
create table role_models (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  name text not null,
  content jsonb not null, -- Stores the RoleModelProfile
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TARGET_JOBS: Stores high-level career goals and associated roadmaps
create table target_jobs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  title text not null,
  description text,
  role_model_id uuid references role_models(id),
  gap_analysis jsonb,
  roadmap jsonb,
  type text default 'goal' check (type in ('goal', 'role_model')),
  strict_mode boolean default true,
  date_added timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRANSCRIPTS: Stores parsed academic transcripts
create table transcripts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  university text,
  program text,
  content jsonb not null, -- Stores the Transcript object
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- 3. SECURITY (Row Level Security)

alter table profiles enable row level security;
alter table resumes enable row level security;
alter table jobs enable row level security;
alter table feedback enable row level security;
alter table invite_codes enable row level security;
alter table daily_usage enable row level security;
alter table user_skills enable row level security;
alter table role_models enable row level security;
alter table target_jobs enable row level security;
alter table transcripts enable row level security;


-- Profile Policies
create policy "Users can view their own profile" on profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (
  (select is_admin from profiles where id = auth.uid()) = true
);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);


-- Resume Policies
create policy "Users can manage own resumes" on resumes for all using (auth.uid() = user_id);

-- Job Policies
create policy "Users can manage own jobs" on jobs for all using (auth.uid() = user_id);

-- User Skills Policies
create policy "Users can manage own skills" on user_skills for all using (auth.uid() = user_id);

-- Logs Policies
create policy "Users can insert own logs" on logs for insert with check (auth.uid() = user_id);
create policy "Users can view own logs" on logs for select using (auth.uid() = user_id);

-- Role Models Policies
create policy "Users can manage own role models" on role_models for all using (auth.uid() = user_id);

-- Target Jobs Policies
create policy "Users can manage own target jobs" on target_jobs for all using (auth.uid() = user_id);

-- Transcript Policies
create policy "Users can manage own transcripts" on transcripts for all using (auth.uid() = user_id);


-- Canonical Roles Policies
create policy "Anyone can view canonical roles" on canonical_roles for select using (true);
create policy "Admins can manage canonical roles" on canonical_roles for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Feedback Policies
create policy "Users can insert own feedback" on feedback for insert with check (auth.uid() = user_id);

-- Usage Policies
-- Start with strict Admin-only access (Users cannot query their own usage directly)
create policy "Admins can view all usage" on daily_usage for select using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Invite Codes: Only Service Role/Functions can view/edit. No direct public policies.

-- 4. FUNCTIONS & TRIGGERS

-- Automatically create a profile when a new user signs up
create or replace function public.handle_new_user() 
returns trigger as $$
declare
  raw_email text;
  clean_email text;
  meta_device_id text;
  meta_first_name text;
  meta_last_name text;
begin
  -- Extract Metadata
  raw_email := new.email;
  meta_device_id := new.raw_user_meta_data->>'device_id';
  meta_first_name := new.raw_user_meta_data->>'first_name';
  meta_last_name := new.raw_user_meta_data->>'last_name';

  -- Normalize Email (Remove +tags)
  -- Logic: Split by @, split local part by +, take first part, rejoin with domain
  clean_email := split_part(raw_email, '@', 1);
  if position('+' in clean_email) > 0 then
    clean_email := split_part(clean_email, '+', 1);
  end if;
  clean_email := clean_email || '@' || split_part(raw_email, '@', 2);

  insert into public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    device_id, 
    normalized_email,
    is_admin, 
    is_tester, 
    inbound_email_token
  )
  values (
    new.id, 
    new.email, 
    meta_first_name, 
    meta_last_name, 
    meta_device_id, 
    clean_email, 
    false, 
    false, 
    substring(md5(random()::text) from 1 for 12)
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Secure function to redeem invite codes
create or replace function redeem_invite_code(code_input text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  valid_code boolean;
begin
  select exists(
    select 1 from invite_codes 
    where code = code_input 
    and is_active = true 
    and remaining_uses > 0
  ) into valid_code;

  if valid_code then
    update invite_codes 
    set remaining_uses = remaining_uses - 1 
    where code = code_input;
    return true;
  else
    return false;
  end if;
end;
$$;

-- 5. PERFORMANCE INDEXES

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_profiles_tester ON profiles(is_tester) WHERE is_tester = true;
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_usage ON profiles(subscription_tier, job_analyses_count);

-- Resumes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);

-- Jobs
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_date_added ON jobs(date_added DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_user_date ON jobs(user_id, date_added DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- User Skills
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_name ON user_skills(name);
CREATE INDEX IF NOT EXISTS idx_user_skills_proficiency ON user_skills(proficiency);

-- Transcripts
CREATE INDEX IF NOT EXISTS idx_transcripts_user_id ON transcripts(user_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_updated_at ON transcripts(updated_at DESC);


-- Function to check if user can create a new analysis
-- Supports both active (browser/manual) and passive (email) limiting
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

  -- 0. Email Verification Gate (Highly Recommended for Public Beta)
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
      -- Get current user's identifiers
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

  -- 2. Inbound Specific Gates
  IF p_source_type = 'email' THEN
    -- Check Daily Email Count (Unique forwards)
    -- Note: We count unique date_added stamps or we need an email_id to be truly accurate.
    -- For now, we'll approximate emails by counting 'email' source type rows (Jobs per-email gate is handled by logic)
    -- Actually, if we want a separate email gate, we need better tracking. 
    -- For now, let's treat inbound_job_limit as the primary gate.
    
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

  -- 3. Daily Token Usage Ceiling (Emergency Safety Fuse)
  IF NOT v_is_admin AND NOT v_is_tester THEN
    DECLARE
      v_token_count INT;
      v_token_limit INT;
    BEGIN
      -- Tiered token ceilings (Emergency Safety Fuse)
      IF v_tier = 'pro' THEN v_token_limit := 5000000; -- 5M/day
      ELSIF v_tier = 'plus' THEN v_token_limit := 1000000; -- 1M/day
      ELSE v_token_limit := 250000; -- 250k/day
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

-- Function to increment analysis count pessimistically
CREATE OR REPLACE FUNCTION increment_analysis_count(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Update Profile (Lifetime count)
  UPDATE profiles
  SET 
    job_analyses_count = job_analyses_count + 1,
    last_analysis_date = NOW()
  WHERE id = p_user_id;

  -- 2. Update Daily Usage (Periodic counts)
  INSERT INTO daily_usage (user_id, date, analysis_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET analysis_count = daily_usage.analysis_count + 1;
END;
$$;

-- Function to decrement analysis count (refund logic)
CREATE OR REPLACE FUNCTION decrement_analysis_count(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET job_analyses_count = GREATEST(0, job_analyses_count - 1)
  WHERE id = p_user_id;

  -- Also decrement from daily_usage if possible
  UPDATE daily_usage
  SET analysis_count = GREATEST(0, analysis_count - 1)
  WHERE user_id = p_user_id AND date = CURRENT_DATE;
END;
$$;

-- Function to handle email normalization for abuse prevention
CREATE OR REPLACE FUNCTION set_normalized_email()
RETURNS TRIGGER AS $$
DECLARE
  v_local TEXT;
  v_domain TEXT;
BEGIN
  v_local := lower(split_part(NEW.email, '@', 1));
  v_domain := lower(split_part(NEW.email, '@', 2));

  -- Step 1: Handle plus addressing (common to Gmail, Outlook, iCloud)
  v_local := split_part(v_local, '+', 1);

  -- Step 2: Handle Gmail/Google dots
  IF v_domain IN ('gmail.com', 'googlemail.com') THEN
    v_local := replace(v_local, '.', '');
  END IF;

  NEW.normalized_email := v_local || '@' || v_domain;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for email normalization
DROP TRIGGER IF EXISTS tr_normalize_email ON profiles;
CREATE TRIGGER tr_normalize_email
  BEFORE INSERT OR UPDATE OF email ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE set_normalized_email();

-- Function to prevent users from updating their own tier/admin status
CREATE OR REPLACE FUNCTION protect_sensitive_profile_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If the requester is not a superuser/service_role
  -- we prevent changes to these specific columns
  IF (current_user <> 'service_role') THEN
    NEW.subscription_tier = OLD.subscription_tier;
    NEW.is_admin = OLD.is_admin;
    NEW.is_tester = OLD.is_tester;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the protection trigger
CREATE TRIGGER ensure_tier_integrity
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE PROCEDURE protect_sensitive_profile_fields();

-- Function to track daily token usage and total AI calls
create or replace function track_usage(p_tokens int, p_is_analysis boolean default false)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 1. Daily Usage (Token based)
  insert into daily_usage (user_id, date, request_count, token_count, analysis_count)
  values (auth.uid(), current_date, 1, p_tokens, case when p_is_analysis then 1 else 0 end)
  on conflict (user_id, date)
  do update set 
    request_count = daily_usage.request_count + 1,
    token_count = daily_usage.token_count + excluded.token_count,
    analysis_count = daily_usage.analysis_count + excluded.analysis_count;

  -- 2. Profile Cumulative Stats
  update profiles 
  set total_ai_calls = total_ai_calls + 1
  where id = auth.uid();
end;
$$;

-- View to spot token outliers (Users > 3x the average FOR THEIR TIER)
create or replace view usage_outliers with (security_invoker = true) as
with daily_stats as (
  select 
    u.date, 
    p.subscription_tier, 
    avg(u.token_count) as avg_tokens
  from daily_usage u
  join profiles p on u.user_id = p.id
  where u.token_count > 0
  group by u.date, p.subscription_tier
)
select 
  u.user_id, 
  p.email, 
  p.subscription_tier,
  u.date, 
  u.token_count, 
  round(ds.avg_tokens) as tier_average,
  round(u.token_count / nullif(ds.avg_tokens, 0), 1) as x_times_normal
from daily_usage u
join profiles p on u.user_id = p.id
join daily_stats ds on u.date = ds.date and p.subscription_tier = ds.subscription_tier
where u.token_count >= 0 -- Inclusive of all active users, UI handles outlier highlighting
order by x_times_normal desc;

-- 6. INITIAL SEEDING
insert into invite_codes (code, remaining_uses) values ('JOBFIT2024', 9999) on conflict do nothing;

