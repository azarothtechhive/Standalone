-- Expand the enquiry workflow statuses so the CRM inbox can track the full
-- lead lifecycle (open, contacted, proposal sent) instead of only four states.
ALTER TABLE IF EXISTS staging.form_submissions
  DROP CONSTRAINT IF EXISTS form_submissions_status_check;

ALTER TABLE IF EXISTS staging.form_submissions
  ADD CONSTRAINT form_submissions_status_check
  CHECK (status IN (
    'NEW',
    'OPEN',
    'CONTACTED',
    'IN_PROGRESS',
    'QUALIFIED',
    'PROPOSAL',
    'CLOSED'
  ));
