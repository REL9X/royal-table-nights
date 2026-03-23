-- =========================================================================
--  ROYAL TABLE APP: Add custom points rules to events
-- =========================================================================

-- We are adding the same point columns that exist in the seasons table
-- directly to the events table. These will be used for "Off-Season Tournaments".

DO $$
BEGIN
    ALTER TABLE public.events ADD COLUMN pts_per_game INTEGER NOT NULL DEFAULT 10;
EXCEPTION WHEN duplicate_column THEN END;
$$;

DO $$
BEGIN
    ALTER TABLE public.events ADD COLUMN pts_per_euro_profit INTEGER NOT NULL DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN END;
$$;

DO $$
BEGIN
    ALTER TABLE public.events ADD COLUMN pts_1st_place INTEGER NOT NULL DEFAULT 10;
EXCEPTION WHEN duplicate_column THEN END;
$$;

DO $$
BEGIN
    ALTER TABLE public.events ADD COLUMN pts_2nd_place INTEGER NOT NULL DEFAULT 5;
EXCEPTION WHEN duplicate_column THEN END;
$$;

DO $$
BEGIN
    ALTER TABLE public.events ADD COLUMN pts_3rd_place INTEGER NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN END;
$$;
