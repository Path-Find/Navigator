-- Fix Security Advisor Warnings
-- Run this in Supabase SQL Editor

-- 1. Secure "check_user_exists" function
-- Found in AuthModal.tsx, takes email_input
create or replace function public.check_user_exists(email_input text)
returns boolean
language plpgsql
security definer
set search_path = public -- Fixes "Search Path Mutable" warning
as $$
begin
  return exists(
    select 1 from profiles 
    where email = email_input
  );
end;
$$;

-- 2. Secure "is_admin" function
-- This function was flagged by the Security Advisor. 
-- Assuming standard signature (no args) based on name.
-- If this fails, the function might have different arguments.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public -- Fixes "Search Path Mutable" warning
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and is_admin = true
  );
$$;
