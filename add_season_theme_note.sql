-- Add theme_note to seasons table
ALTER TABLE public.seasons ADD COLUMN IF NOT EXISTS theme_note TEXT;
