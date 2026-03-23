-- Add total_points if it doesn't exist
DO $$
BEGIN
    ALTER TABLE public.profiles ADD COLUMN total_points INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN END;
$$;

-- Add championship_badges_count if it doesn't exist
DO $$
BEGIN
    ALTER TABLE public.profiles ADD COLUMN championship_badges_count INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN END;
$$;
