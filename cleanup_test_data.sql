-- ========================================================
-- ROYAL TABLE NIGHTS - TEST DATA CLEANUP SCRIPT
-- ========================================================
-- Instructions: Run this in the Supabase SQL Editor to 
-- delete all test events, clear all statistics, and delete 
-- all users EXCEPT for the specific Admin user.

DO $$
DECLARE
    admin_id UUID;
BEGIN
    -- 1. Identify the Admin you want to keep
    -- Assuming there's only one admin, or you specifically want one admin to survive.
    -- If you want to keep a specific player, you can change the WHERE clause.
    SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;

    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'No Admin profile found to protect!';
    END IF;

    -- 2. Delete ALL events (Because of ON DELETE CASCADE, this will also delete 
    -- all rows in session_players and event_responses for these events).
    DELETE FROM public.events;

    -- 3. Delete all users EXCEPT the protected admin
    -- The public.profiles table has ON DELETE CASCADE from auth.users,
    -- so if we delete from auth.users, their profile is automatically gone.
    DELETE FROM auth.users WHERE id != admin_id;

    -- 4. Reset the Admin's lifetime statistics back to zero
    UPDATE public.profiles 
    SET 
        total_sessions_played = 0,
        total_profit = 0,
        total_invested = 0,
        biggest_win = 0,
        biggest_loss = 0,
        total_rebuys = 0,
        total_points = 0
    WHERE id = admin_id;

    RAISE NOTICE 'Cleanup complete! Only Admin ID % remains, and all stats are reset.', admin_id;

END;
$$;
