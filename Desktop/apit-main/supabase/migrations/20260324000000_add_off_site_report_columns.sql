-- Migration: Add off-site work report columns to reports table
-- Purpose: Support off-site/ad-hoc work reports that don't link to a project
-- Date: 2026-03-24

-- Add off-site report columns
ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS is_off_site BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS off_site_work_type TEXT,
  ADD COLUMN IF NOT EXISTS off_site_location TEXT,
  ADD COLUMN IF NOT EXISTS off_site_purpose TEXT;

-- Add comment for documentation
COMMENT ON COLUMN reports.is_off_site IS 'Whether this report is for off-site/ad-hoc work (not linked to a project)';
COMMENT ON COLUMN reports.off_site_work_type IS 'Type of off-site work (Material Purchase, Site Survey, Client Meeting, etc.)';
COMMENT ON COLUMN reports.off_site_location IS 'Location/name of the site where off-site work was performed';
COMMENT ON COLUMN reports.off_site_purpose IS 'Purpose or objective of the off-site work';

-- Create index for faster filtering of off-site reports
CREATE INDEX IF NOT EXISTS idx_reports_is_off_site ON reports(is_off_site) WHERE is_off_site = TRUE;

-- Sample work types reference:
-- Material Purchase, Site Survey, Client Meeting, Support Work, Training, 
-- Govt. Office, Warehouse, Equipment Inspection, Other
