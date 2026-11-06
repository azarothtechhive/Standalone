-- Migration 004: Email notification tracking for form submissions
-- Adds email status tracking columns to form_submissions for reliable transactional notifications

DO $$
BEGIN
  -- Add reference_id column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'form_submissions' AND column_name = 'reference_id'
  ) THEN
    ALTER TABLE form_submissions 
      ADD COLUMN reference_id TEXT UNIQUE;
  END IF;

  -- Add company email status columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'form_submissions' AND column_name = 'company_email_status'
  ) THEN
    ALTER TABLE form_submissions 
      ADD COLUMN company_email_status TEXT NOT NULL DEFAULT 'pending'
      CHECK (company_email_status IN ('pending','sent','failed','skipped'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'form_submissions' AND column_name = 'customer_email_status'
  ) THEN
    ALTER TABLE form_submissions 
      ADD COLUMN customer_email_status TEXT NOT NULL DEFAULT 'pending'
      CHECK (customer_email_status IN ('pending','sent','failed','skipped'));
  END IF;

  -- Attempt timestamps
  ALTER TABLE form_submissions
    ADD COLUMN IF NOT EXISTS company_email_last_attempt_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS customer_email_last_attempt_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS company_email_sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS customer_email_sent_at TIMESTAMPTZ;

  -- Failure reasons
  ALTER TABLE form_submissions
    ADD COLUMN IF NOT EXISTS company_email_failure_reason TEXT,
    ADD COLUMN IF NOT EXISTS customer_email_failure_reason TEXT;

  -- Attempt counters
  ALTER TABLE form_submissions
    ADD COLUMN IF NOT EXISTS company_email_attempt_count INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS customer_email_attempt_count INT NOT NULL DEFAULT 0;

  -- Index for admin filtering
  CREATE INDEX IF NOT EXISTS idx_form_submissions_company_email_status 
    ON form_submissions(company_email_status, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_form_submissions_customer_email_status 
    ON form_submissions(customer_email_status, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_form_submissions_reference_id 
    ON form_submissions(reference_id);
END
$$;
