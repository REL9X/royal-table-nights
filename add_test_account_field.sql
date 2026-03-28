-- ==========================================
-- FEATURE: IS_TEST_ACCOUNT
-- ==========================================
-- Add a column to identify test accounts that should be hidden from 
-- global leaderboards and stats but stay visible to admins.
-- This keeps the production data clean from testing without deleting the records.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_test_account BOOLEAN DEFAULT false;

-- Verify
-- SELECT id, name, is_test_account FROM public.profiles LIMIT 5;
