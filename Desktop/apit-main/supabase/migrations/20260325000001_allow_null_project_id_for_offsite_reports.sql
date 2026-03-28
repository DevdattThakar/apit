-- Migration: Allow NULL project_id for off-site reports
-- Purpose: Fix the error "null value in column project_id violates not-null constraint"
-- when submitting off-site work reports
-- Date: 2026-03-25

-- Make project_id nullable to support off-site reports
ALTER TABLE reports ALTER COLUMN project_id DROP NOT NULL;

-- Add a CHECK constraint to ensure project_id is provided for regular (non-off-site) reports
-- This ensures data integrity: regular reports must have a project
ALTER TABLE reports ADD CONSTRAINT chk_regular_report_requires_project 
CHECK (is_off_site = TRUE OR project_id IS NOT NULL);

-- Comment for documentation
COMMENT ON CONSTRAINT chk_regular_report_requires_project ON reports 
IS 'Ensures regular (non-off-site) reports must have a project_id';
