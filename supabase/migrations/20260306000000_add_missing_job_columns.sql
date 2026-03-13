-- Add missing columns to jobs table that are required by the application
-- These missing columns cause INSERT failures, preventing cloud sync

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS resume_id text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS cover_letter text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS cover_letter_critique jsonb;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS fit_score numeric;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS original_text text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_title text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS url text;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS canonical_role text;

-- Also expand the status check constraint to include 'analyzing'
-- Jobs can be inserted mid-analysis; the status gets updated when analysis completes
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE jobs ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('new', 'saved', 'applied', 'interview', 'offer', 'rejected', 'ghosted', 'feed', 'error', 'analyzing'));
