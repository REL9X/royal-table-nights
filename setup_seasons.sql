-- =========================================================================
--  ROYAL TABLE APP: Season Management System
-- =========================================================================

-- 1. Create the base `seasons` table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.seasons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely add the points columns (in case the table already existed without them)
DO $$
BEGIN
    ALTER TABLE public.seasons ADD COLUMN pts_per_game INTEGER NOT NULL DEFAULT 10;
EXCEPTION WHEN duplicate_column THEN END;
$$;

DO $$
BEGIN
    ALTER TABLE public.seasons ADD COLUMN pts_per_euro_profit INTEGER NOT NULL DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN END;
$$;

DO $$
BEGIN
    ALTER TABLE public.seasons ADD COLUMN pts_1st_place INTEGER NOT NULL DEFAULT 10;
EXCEPTION WHEN duplicate_column THEN END;
$$;

DO $$
BEGIN
    ALTER TABLE public.seasons ADD COLUMN pts_2nd_place INTEGER NOT NULL DEFAULT 5;
EXCEPTION WHEN duplicate_column THEN END;
$$;

DO $$
BEGIN
    ALTER TABLE public.seasons ADD COLUMN pts_3rd_place INTEGER NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN END;
$$;

-- Enable RLS for seasons
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

-- Allow public read access to seasons
DROP POLICY IF EXISTS "Seasons are viewable by everyone." ON public.seasons;
CREATE POLICY "Seasons are viewable by everyone." 
ON public.seasons FOR SELECT 
USING (true);

-- Create a trigger to automatically update the `updated_at` column
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_seasons_updated ON public.seasons;
CREATE TRIGGER on_seasons_updated
  BEFORE UPDATE ON public.seasons
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();


-- 2. Add `season_id` to the `events` table
DO $$
BEGIN
    ALTER TABLE public.events ADD COLUMN season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN END;
$$;

-- 3. Backfill existing data to preserve history
-- Create the initial "Beta Season" to hold all current/past games
DO $$
DECLARE
    beta_season_id UUID;
BEGIN
    -- Check if it already exists to avoid duplicates if run multiple times
    IF NOT EXISTS (SELECT 1 FROM public.seasons WHERE name = 'Beta Season') THEN
        INSERT INTO public.seasons (
            name, 
            status, 
            pts_per_game, 
            pts_per_euro_profit, 
            pts_1st_place, 
            pts_2nd_place, 
            pts_3rd_place
        ) VALUES (
            'Beta Season', 
            'active', 
            10, 
            1, 
            10, 
            5, 
            0
        ) RETURNING id INTO beta_season_id;
        
        -- Link all existing events to this new Beta Season
        UPDATE public.events SET season_id = beta_season_id WHERE season_id IS NULL;
    END IF;
END $$;
