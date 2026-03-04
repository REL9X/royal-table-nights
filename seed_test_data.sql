-- ========================================================
-- ROYAL TABLE NIGHTS - TEST DATA SEED SCRIPT
-- ========================================================
-- Instructions: Copy and paste this script directly into 
-- your Supabase SQL Editor and hit "Run". 
-- It will generate 10 mock players and 6 historical sessions
-- with accurate pot distribution and profile statistics.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    new_user_id UUID;
    i INT;
    event_id_var UUID;
    j INT;
    pot NUMERIC;
    buyin NUMERIC := 10;
    rebuy NUMERIC := 10;
    num_players INT;
    selected_players UUID[];
    player_id UUID;
    invested NUMERIC;
    c_out NUMERIC;
    admin_id UUID;
    pts INT;
    pProfit NUMERIC;
BEGIN
    -- Verify an Admin exists to be the creator
    SELECT id INTO admin_id FROM public.profiles WHERE role='admin' LIMIT 1;
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'No Admin profile found! Please create an admin account first through the app.';
    END IF;

    -- 1. Create 10 mock users
    DECLARE
        first_names text[] := ARRAY['Alex', 'Sarah', 'Mike', 'Emma', 'David', 'Laura', 'Chris', 'Anna', 'Tom', 'Jessica'];
        current_name text;
    BEGIN
        FOR i IN 1..10 LOOP
            new_user_id := gen_random_uuid();
            current_name := first_names[i];
            
            -- Insert into auth.users (Minimal fields)
            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', 
                LOWER(current_name) || '_' || floor(random() * 1000) || '@royaltable.com', crypt('123456', gen_salt('bf')), now(),
                jsonb_build_object('full_name', current_name, 'phone', '+3519000' || LPAD(floor(random() * 99999)::text, 5, '0')),
                now(), now()
            );
            -- Note: The trigger handle_new_user() automatically creates the public.profile
            
            -- Automatically approve the mock user so they show up on the Leaderboard
            UPDATE public.profiles SET is_approved = true WHERE id = new_user_id;
        END LOOP;
    END;

    -- 2. Create 6 completed events
    FOR j IN 1..6 LOOP
        event_id_var := gen_random_uuid();
        
        -- Insert Event Record
        INSERT INTO public.events (id, created_by, title, date, time, location, buy_in_amount, rebuy_amount, status, created_at)
        VALUES (
            event_id_var, admin_id,
            'Mock Event ' || j, 
            CURRENT_DATE - (7 * j), 
            '21:00:00', 
            'Kasino ' || j, 
            buyin, 
            rebuy, 
            'completed',
            now()
        );

        -- Decide number of players (between 6 and 10)
        num_players := 6 + floor(random() * 5)::INT;
        
        -- Select random players
        SELECT array_agg(id) INTO selected_players FROM (
            SELECT id FROM public.profiles ORDER BY random() LIMIT num_players
        ) sub;

        pot := 0;

        -- For each selected player, setup base investment
        FOR i IN 1..num_players LOOP
            DECLARE 
                curr_player_id UUID := selected_players[i];
                num_rebuys INT := floor(random() * 4)::INT; -- Max 3 rebuys (0, 1, 2, or 3)
                num_buyins INT := 1;
            BEGIN
                invested := (num_buyins * buyin) + (num_rebuys * rebuy);
                pot := pot + invested;
                
                -- The array index i gives us placing (e.g., 1 is 1st place)
                INSERT INTO public.session_players (event_id, player_id, buy_ins, rebuys, total_invested, placement)
                VALUES (event_id_var, curr_player_id, num_buyins, num_rebuys, invested, i);
            END;
        END LOOP;

        -- Distribute the pot and calculate profit
        UPDATE public.session_players SET cash_out = ROUND(pot * 0.60, 2), profit = ROUND(pot * 0.60, 2) - total_invested WHERE event_id = event_id_var AND placement = 1;
        UPDATE public.session_players SET cash_out = ROUND(pot * 0.30, 2), profit = ROUND(pot * 0.30, 2) - total_invested WHERE event_id = event_id_var AND placement = 2;
        UPDATE public.session_players SET cash_out = ROUND(pot * 0.10, 2), profit = ROUND(pot * 0.10, 2) - total_invested WHERE event_id = event_id_var AND placement = 3;
        UPDATE public.session_players SET cash_out = 0, profit = 0 - total_invested WHERE event_id = event_id_var AND placement > 3;

        -- Calculate V2 Gamification Points
        FOR i IN 1..num_players LOOP
            DECLARE
                curr_player_id UUID := selected_players[i];
            BEGIN
                SELECT profit INTO pProfit FROM public.session_players WHERE event_id = event_id_var AND public.session_players.player_id = curr_player_id;

                pts := 10; -- Base points
                IF pProfit > 0 THEN
                    pts := pts + floor(pProfit)::INT;
                END IF;
                IF i = 1 AND pProfit > 0 THEN pts := pts + 10; END IF;
                IF i = 2 AND pProfit > 0 THEN pts := pts + 5; END IF;

                UPDATE public.session_players SET points_earned = pts WHERE event_id = event_id_var AND public.session_players.player_id = curr_player_id;
            END;
        END LOOP;

    END LOOP;

    -- 3. Recalculate Profiles
    UPDATE public.profiles p
    SET 
        total_sessions_played = sub.sessions,
        total_profit = sub.prof,
        total_invested = sub.inv,
        biggest_win = sub.b_win,
        biggest_loss = sub.b_loss,
        total_rebuys = sub.rebu,
        total_points = sub.pts
    FROM (
        SELECT 
            public.session_players.player_id,
            COUNT(*) as sessions,
            COALESCE(SUM(profit), 0) as prof,
            COALESCE(SUM(total_invested), 0) as inv,
            COALESCE(SUM(rebuys), 0) as rebu,
            COALESCE(MAX(CASE WHEN profit > 0 THEN profit ELSE 0 END), 0) as b_win,
            COALESCE(MAX(CASE WHEN profit < 0 THEN ABS(profit) ELSE 0 END), 0) as b_loss,
            COALESCE(SUM(points_earned), 0) as pts
        FROM public.session_players
        GROUP BY public.session_players.player_id
    ) sub
    WHERE p.id = sub.player_id;

END;
$$;
