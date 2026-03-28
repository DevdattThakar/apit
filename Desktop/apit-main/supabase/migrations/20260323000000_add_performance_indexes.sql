-- Performance indexes for frequently queried columns
-- This migration adds indexes to improve query performance for common operations

-- ============================================
-- EMPLOYEES TABLE INDEXES
-- ============================================

-- Index for auth_user_id lookup during login
CREATE INDEX IF NOT EXISTS idx_employees_auth_user_id ON employees(auth_user_id);

-- Index for email lookup during login fallback
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- Index for department filtering
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);

-- Index for role-based filtering
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);

-- ============================================
-- PROJECTS TABLE INDEXES
-- ============================================

-- Index for status filtering (frequently used in project lists)
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- Index for department filtering (TL filtering)
CREATE INDEX IF NOT EXISTS idx_projects_department ON projects(department);

-- Index for team leader project lookup
CREATE INDEX IF NOT EXISTS idx_projects_team_leader_id ON projects(team_leader_id);

-- Index for created_at ordering
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- ============================================
-- REPORTS TABLE INDEXES
-- ============================================

-- Index for employee report lookups
CREATE INDEX IF NOT EXISTS idx_reports_employee_id ON reports(employee_id);

-- Index for project report aggregation
CREATE INDEX IF NOT EXISTS idx_reports_project_id ON reports(project_id);

-- Index for date range queries
CREATE INDEX IF NOT EXISTS idx_reports_date ON reports(date);

-- Index for created_at ordering
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Composite index for common query pattern (employee + date range)
CREATE INDEX IF NOT EXISTS idx_reports_employee_date ON reports(employee_id, date DESC);

-- ============================================
-- ANNOUNCEMENTS TABLE INDEXES
-- ============================================

-- Index for sender lookups
CREATE INDEX IF NOT EXISTS idx_announcements_sender_id ON announcements(sender_id);

-- Index for created_at ordering
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);
