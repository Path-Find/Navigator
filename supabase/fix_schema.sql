-- FIX SCHEMA DRIFT
-- Run this in your Supabase SQL Editor to restore missing tables and columns.

-- 1. Add missing columns to PROFILES
alter table profiles 
add column if not exists job_analyses_count int default 0,
add column if not exists total_ai_calls int default 0,
add column if not exists last_analysis_date timestamp with time zone,
add column if not exists inbound_email_token text unique;

-- 2. Create ROLE_MODELS table
create table if not exists role_models (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  name text not null,
  content jsonb not null, -- Stores the RoleModelProfile
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create TARGET_JOBS table
create table if not exists target_jobs (
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

-- 4. Enable RLS
alter table role_models enable row level security;
alter table target_jobs enable row level security;

-- 5. Add Policies
-- Role Models
create policy "Users can manage own role models" on role_models for all using (auth.uid() = user_id);

-- Target Jobs
create policy "Users can manage own target jobs" on target_jobs for all using (auth.uid() = user_id);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_role_models_user ON role_models(user_id);
CREATE INDEX IF NOT EXISTS idx_target_jobs_user ON target_jobs(user_id);

-- 7. Create/Replace View for Usage Outliers (Matching the format expected by AdminDashboard)
-- We need to align the view with what AdminDashboard expects:
-- user_id, total_input_tokens, total_output_tokens, total_operations, last_active

-- Since daily_usage only has `token_count` (which is likely total), we might need to approximate or update the dashboard.
-- Let's update the dashboard to use the actual view columns, but first, let's make sure the view exists.

-- DROP VIEW first to allow column changes
drop view if exists usage_outliers;

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
  -- Explicitly cast/rename columns to match AdminService.ts expectations
  u.token_count as total_input_tokens, 
  u.token_count as total_output_tokens, 
  u.request_count as total_operations,
  u.date as last_active,
  round(ds.avg_tokens) as tier_average,
  round(u.token_count / nullif(ds.avg_tokens, 0), 1) as x_times_normal
from daily_usage u
join profiles p on u.user_id = p.id
join daily_stats ds on u.date = ds.date and p.subscription_tier = ds.subscription_tier
where u.token_count > (ds.avg_tokens * 3)
order by x_times_normal desc;
