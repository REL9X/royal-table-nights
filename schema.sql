-- ==========================================
-- ROYAL TABLE NIGHTS - SUPABASE SQL SCHEMA
-- ==========================================

-- Enable the uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
-- Stores player information and aggregated stats
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  total_sessions_played INTEGER DEFAULT 0,
  total_profit NUMERIC DEFAULT 0,
  total_invested NUMERIC DEFAULT 0,
  biggest_win NUMERIC DEFAULT 0,
  biggest_loss NUMERIC DEFAULT 0,
  total_rebuys INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile (approvals)."
  ON public.profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- 2. EVENTS/SESSIONS TABLE
-- Represents a poker night
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT DEFAULT 'Royal Table Night',
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT,
  buy_in_amount NUMERIC NOT NULL,
  rebuy_amount NUMERIC NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  started_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone."
  ON public.events FOR SELECT USING (true);

CREATE POLICY "Only admins can insert events."
  ON public.events FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update events."
  ON public.events FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can delete events."
  ON public.events FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- 3. EVENT RESPONSES TABLE
-- Stores player RSVPs for upcoming events
CREATE TABLE public.event_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, player_id)
);

ALTER TABLE public.event_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event responses are viewable by everyone."
  ON public.event_responses FOR SELECT USING (true);

CREATE POLICY "Users can insert/update their own responses."
  ON public.event_responses FOR INSERT WITH CHECK (auth.uid() = player_id);
  
CREATE POLICY "Users can update their own responses."
  ON public.event_responses FOR UPDATE USING (auth.uid() = player_id);

CREATE POLICY "Admins can update any response."
  ON public.event_responses FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- 4. SESSION PLAYERS TABLE
-- Tracks live session data for each player (buy-ins, rebuys, cashouts)
CREATE TABLE public.session_players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  buy_ins INTEGER DEFAULT 0,
  rebuys INTEGER DEFAULT 0,
  total_invested NUMERIC DEFAULT 0,
  cash_out NUMERIC DEFAULT 0,
  profit NUMERIC DEFAULT 0,
  is_eliminated BOOLEAN DEFAULT false,
  placement INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, player_id)
);

ALTER TABLE public.session_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Session players are viewable by everyone."
  ON public.session_players FOR SELECT USING (true);

CREATE POLICY "Only admins can manage session players."
  ON public.session_players FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- 5. FUNCTION: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    -- Make the first user an admin automatically, otherwise player
    CASE 
      WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'admin'
      ELSE 'player'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create storage bucket for avatars if needed
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
