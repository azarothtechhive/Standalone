-- Migration 006: Email notifications tracking table
-- Creates a dedicated table for tracking email delivery status and retries

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'staging' AND table_name = 'email_notifications'
  ) THEN
    CREATE TABLE staging.email_notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      submission_id UUID NOT NULL REFERENCES staging.form_submissions(id) ON DELETE CASCADE,
      notification_type TEXT NOT NULL CHECK (notification_type IN ('COMPANY_NOTIFICATION', 'CUSTOMER_ACKNOWLEDGEMENT')),
      recipient_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'RETRY')),
      provider_message_id TEXT,
      error_message TEXT,
      attempts INT NOT NULL DEFAULT 0,
      last_attempt_at TIMESTAMPTZ,
      sent_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_email_notifications_submission_id ON staging.email_notifications(submission_id, created_at DESC);
    CREATE INDEX idx_email_notifications_status ON staging.email_notifications(status, created_at DESC);
    CREATE INDEX idx_email_notifications_type ON staging.email_notifications(notification_type, submission_id);
  END IF;
END
$$;