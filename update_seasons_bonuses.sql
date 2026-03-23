-- Add End-of-Season Bonus configurations to seasons table
DO $$
BEGIN
    ALTER TABLE public.seasons ADD COLUMN pts_season_1st INTEGER NOT NULL DEFAULT 500;
EXCEPTION WHEN duplicate_column THEN END;
$$;

DO $$
BEGIN
    ALTER TABLE public.seasons ADD COLUMN pts_season_2nd INTEGER NOT NULL DEFAULT 250;
EXCEPTION WHEN duplicate_column THEN END;
$$;

DO $$
BEGIN
    ALTER TABLE public.seasons ADD COLUMN pts_season_3rd INTEGER NOT NULL DEFAULT 100;
EXCEPTION WHEN duplicate_column THEN END;
$$;

DO $$
BEGIN
    ALTER TABLE public.seasons ADD COLUMN pts_season_4th INTEGER NOT NULL DEFAULT 50;
EXCEPTION WHEN duplicate_column THEN END;
$$;

DO $$
BEGIN
    ALTER TABLE public.seasons ADD COLUMN pts_season_5th INTEGER NOT NULL DEFAULT 50;
EXCEPTION WHEN duplicate_column THEN END;
$$;

DO $$
BEGIN
    ALTER TABLE public.seasons ADD COLUMN pts_season_participation INTEGER NOT NULL DEFAULT 10;
EXCEPTION WHEN duplicate_column THEN END;
$$;
