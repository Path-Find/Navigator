-- Add updated_at column to jobs table
-- Fixes "Could not find the 'updated_at' column of 'jobs' in the schema cache" error

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Update existing rows to have updated_at equal to date_added if it's null
UPDATE jobs SET updated_at = date_added WHERE updated_at IS NULL;
