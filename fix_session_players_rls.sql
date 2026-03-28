-- ==========================================
-- FIX: ALLOW PLAYERS TO UPDATE THEIR OWN SESSION DATA
-- ==========================================
-- Root Cause: Players couldn't rebuy, cashout, or bust themselves
-- because the only write policy on session_players was admin-only.
-- 
-- This adds a policy allowing authenticated players to UPDATE
-- their own rows in session_players (identified by player_id = auth.uid()).
-- Admin INSERT/DELETE policies remain unchanged.

-- Drop if exists to make this idempotent
DROP POLICY IF EXISTS "Players can update their own session data." ON public.session_players;

CREATE POLICY "Players can update their own session data."
  ON public.session_players
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

-- Verify: list all policies on session_players
-- SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'session_players';
