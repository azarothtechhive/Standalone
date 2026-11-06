ALTER TABLE IF EXISTS staging.form_submissions
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'NEW',
  ADD COLUMN IF NOT EXISTS follow_up_note TEXT,
  ADD COLUMN IF NOT EXISTS assigned_to TEXT,
  ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ;

DO $$
BEGIN
  IF to_regclass('staging.form_submissions') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1
       FROM pg_constraint
       WHERE conname = 'form_submissions_status_check'
         AND conrelid = 'staging.form_submissions'::regclass
     ) THEN
    ALTER TABLE staging.form_submissions
      ADD CONSTRAINT form_submissions_status_check
      CHECK (status IN ('NEW', 'IN_PROGRESS', 'QUALIFIED', 'CLOSED'));
  END IF;
END
$$;
