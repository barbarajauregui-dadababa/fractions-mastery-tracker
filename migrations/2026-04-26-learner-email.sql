-- Migration: add email column to learners table.
-- Used by the welcome email feature so learners (or their guides)
-- can return to /learner/<id> via a link in their inbox.
-- Run this in the Supabase SQL editor. Safe to re-run.

ALTER TABLE learners ADD COLUMN IF NOT EXISTS email TEXT;

-- Index for the future "resume by email" feature (Option 3).
CREATE INDEX IF NOT EXISTS idx_learners_email ON learners(email) WHERE email IS NOT NULL;
