-- V5 Migration: Architecture Constraints

-- 1. Add max_games to seasons (Default 10)
DO $$
BEGIN
    ALTER TABLE public.seasons ADD COLUMN max_games INTEGER NOT NULL DEFAULT 10;
EXCEPTION WHEN duplicate_column THEN END;
$$;

-- 2. Add Name Length Constraint to Profiles (Max 12)
-- Note: We must first handle any existing users who have > 12 characters. 
-- In a real prod environment we'd carefully truncate or ask them to change it.
-- For now, we will just silently truncate any existing names that are too long so the constraint can apply.
UPDATE public.profiles SET name = SUBSTRING(name FOR 12) WHERE length(name) > 12;

-- Drop existing constraint if it exists so we can recreate it cleanly
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS name_length_check;

-- Add the CHECK constraint
ALTER TABLE public.profiles ADD CONSTRAINT name_length_check CHECK (length(name) <= 12);
