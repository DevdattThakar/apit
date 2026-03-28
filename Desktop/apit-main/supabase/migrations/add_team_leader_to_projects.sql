

-- Add team_leader_id column to projects table
-- Run this in Supabase SQL Editor

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS team_leader_id TEXT REFERENCES public.employees(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_projects_team_leader ON public.projects(team_leader_id);

-- Create a function to reassign reports when team leader changes
CREATE OR REPLACE FUNCTION reassign_team_leader_reports(
  p_project_id TEXT,
  p_old_tl_id TEXT,
  p_new_tl_id TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update reports: reassign from old TL to new TL
  UPDATE public.reports 
  SET employee_id = p_new_tl_id
  WHERE project_id = p_project_id 
  AND employee_id = p_old_tl_id;
  
  -- Update announcements: reassign from old TL to new TL
  UPDATE public.announcements
  SET sender_id = p_new_tl_id
  WHERE sender_id = p_old_tl_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reassign_team_leader_reports(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reassign_team_leader_reports(TEXT, TEXT, TEXT) TO anon;
