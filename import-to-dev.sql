-- ============================================
-- COMPLETE DATA IMPORT FOR DEV DATABASE
-- ============================================
-- Copy this entire file and paste into:
-- https://supabase.com/dashboard/project/qmrrmrhwdiyubqokxvbt/sql/new
-- Then click RUN
-- ============================================

-- Step 1: Disable foreign key constraints temporarily
SET session_replication_role = replica;

-- The import will happen here - we need to combine this with your data file
-- Since the file is too large, let's create a wrapper script instead

