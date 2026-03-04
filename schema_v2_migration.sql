-- ==========================================
-- V2 MIGRATION: SEASONS & POINTS
-- ==========================================

-- 1. Create Seasons Table
CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL, -- e.g. "Winter 2026"
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'seasons' AND policyname = 'Seasons are viewable by everyone.'
    ) THEN
        CREATE POLICY "Seasons are viewable by everyone."
          ON public.seasons FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'seasons' AND policyname = 'Only admins can manage seasons.'
    ) THEN
        CREATE POLICY "Only admins can manage seasons."
          ON public.seasons FOR ALL USING (
            EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
          );
    END IF;
END
$$;

-- Insert a default 'Season 1' to attach current events to.
INSERT INTO public.seasons (name, status) VALUES ('Season 1', 'active');

-- 2. Modify Events Table to link to Seasons
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES public.seasons(id);

-- Link existing events to the default season
UPDATE public.events 
SET season_id = (SELECT id FROM public.seasons LIMIT 1)
WHERE season_id IS NULL;

-- 3. Modify Session Players to track points
ALTER TABLE public.session_players
ADD COLUMN IF NOT EXISTS points_earned INTEGER DEFAULT 0;

-- 4. Modify Profiles to track Phone Numbers and Total Points
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;

-- Create an All-Time Leaderboard view or let frontend aggregate.
-- For gamification, points will be updated recursively upon finalize session.

-- 5. FUNCTION: auto-create profile on signup (Update to handle phone)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, name, avatar_url, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'phone', -- Capture phone number from our custom signup metadata
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone', new.email),
    new.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'admin'
      ELSE 'player'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
