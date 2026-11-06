ALTER TABLE IF EXISTS staging.form_submissions
  ADD COLUMN IF NOT EXISTS rfq_details JSONB NOT NULL DEFAULT '{}'::jsonb;
