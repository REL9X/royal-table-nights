-- Simulation Script for Season 1 (3 Games)
DO $$
DECLARE
    season_id UUID := 'f308b481-b1fe-4473-9654-7e1e3b3c7778';
    admin_id UUID := '997a9a38-6778-4e45-94fb-9c98e145ad1e'; -- Berna
    berna_id UUID := '997a9a38-6778-4e45-94fb-9c98e145ad1e';
    event_id_var UUID;
    player_ids UUID[];
    curr_player_id UUID;
    i INT;
    j INT;
    buyin NUMERIC := 10;
    rebuy NUMERIC := 10;
    pot NUMERIC;
    invested NUMERIC;
    pProfit NUMERIC;
    pts INT;
    pts_pg INT := 30;
    pts_pep INT := 3;
    pts_1st INT := 20;
    pts_2nd INT := 10;
    pts_3rd INT := 5;
BEGIN
    -- Get some player IDs including Berna
    SELECT array_agg(id) INTO player_ids FROM (
        SELECT id FROM public.profiles WHERE is_approved = true AND id != berna_id ORDER BY random() LIMIT 7
    ) sub;
    player_ids := berna_id || player_ids;

    -- Simulate 3 Games
    FOR j IN 1..3 LOOP
        event_id_var := gen_random_uuid();
        
        INSERT INTO public.events (id, created_by, season_id, title, date, time, location, buy_in_amount, rebuy_amount, status, created_at)
        VALUES (
            event_id_var, admin_id, season_id,
            'Season 1 - Game ' || j, 
            CURRENT_DATE - (4 - j), 
            '20:00:00', 
            'The Poker Room', 
            buyin, 
            rebuy, 
            'completed',
            now()
        );

        pot := 0;
        -- Add players to the game
        FOR i IN 1..cardinality(player_ids) LOOP
            curr_player_id := player_ids[i];
            -- Random rebuys 0-2
            DECLARE
                num_rebuys INT := floor(random() * 3)::INT;
            BEGIN
                invested := buyin + (num_rebuys * rebuy);
                pot := pot + invested;
                
                -- Shuffle indices for placement later, but for now just insert
                INSERT INTO public.session_players (event_id, player_id, buy_ins, rebuys, total_invested, placement)
                VALUES (event_id_var, curr_player_id, 1, num_rebuys, invested, i);
            END;
        END LOOP;

        -- Shuffle placements randomly but ensure Berna places well in at least one
        -- (Actually just randomizing is fine, users usually like seeing results)
        -- We'll just use the initial order as placements for simplicity in this script logic
        
        -- Distribute Pot
        UPDATE public.session_players SET cash_out = ROUND(pot * 0.50, 2), profit = ROUND(pot * 0.50, 2) - total_invested WHERE event_id = event_id_var AND placement = 1;
        UPDATE public.session_players SET cash_out = ROUND(pot * 0.30, 2), profit = ROUND(pot * 0.30, 2) - total_invested WHERE event_id = event_id_var AND placement = 2;
        UPDATE public.session_players SET cash_out = ROUND(pot * 0.20, 2), profit = ROUND(pot * 0.20, 2) - total_invested WHERE event_id = event_id_var AND placement = 3;
        UPDATE public.session_players SET cash_out = 0, profit = 0 - total_invested WHERE event_id = event_id_var AND placement > 3;

        -- Calculate Points for Season 1
        FOR i IN 1..cardinality(player_ids) LOOP
            curr_player_id := player_ids[i];
            SELECT profit INTO pProfit FROM public.session_players WHERE event_id = event_id_var AND public.session_players.player_id = curr_player_id;
            
            pts := pts_pg; -- Participation
            IF pProfit > 0 THEN
                pts := pts + floor(pProfit * pts_pep)::INT; -- Profit points
            END IF;
            
            IF i = 1 THEN pts := pts + pts_1st; END IF;
            IF i = 2 THEN pts := pts + pts_2nd; END IF;
            IF i = 3 THEN pts := pts + pts_3rd; END IF;

            UPDATE public.session_players SET points_earned = pts WHERE event_id = event_id_var AND public.session_players.player_id = curr_player_id;
        END LOOP;
    END LOOP;

    -- Update Global Profiles
    UPDATE public.profiles p
    SET 
        total_sessions_played = sub.sessions,
        total_profit = sub.prof,
        total_invested = sub.inv,
        total_rebuys = sub.rebu,
        total_points = sub.pts
    FROM (
        SELECT 
            player_id,
            COUNT(*) as sessions,
            SUM(profit) as prof,
            SUM(total_invested) as inv,
            SUM(rebuys) as rebu,
            SUM(points_earned) as pts
        FROM public.session_players
        GROUP BY player_id
    ) sub
    WHERE p.id = sub.player_id;

END;
$$;
