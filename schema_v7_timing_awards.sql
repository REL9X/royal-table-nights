-- V7 Migration: Timing Awards Schema Updates

-- 1. Add ended_at to events
DO $$
BEGIN
    ALTER TABLE public.events ADD COLUMN ended_at TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN duplicate_column THEN END;
$$;

-- 2. Add eliminated_at and first_rebuy_at to session_players
DO $$
BEGIN
    ALTER TABLE public.session_players ADD COLUMN eliminated_at TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN duplicate_column THEN END;
$$;

DO $$
BEGIN
    ALTER TABLE public.session_players ADD COLUMN first_rebuy_at TIMESTAMP WITH TIME ZONE;
EXCEPTION WHEN duplicate_column THEN END;
$$;
