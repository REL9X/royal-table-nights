const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function simulate() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Sign in as Admin
    console.log('Signing in as admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: "351912334429@royaltable.com",
        password: "696969"
    });

    if (authError) {
        console.error('Sign in error:', authError.message);
        return;
    }
    console.log('Sign in success!');

    const adminSupabase = createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${authData.session.access_token}`
            }
        }
    });

    // 2. Identify Season 1
    const seasonId = 'f308b481-b1fe-4473-9654-7e1e3b3c7778';
    const bernaId = '997a9a38-6778-4e45-94fb-9c98e145ad1e';

    const { data: season } = await adminSupabase.from('seasons').select('*').eq('id', seasonId).single();
    if (!season) {
        console.error('Season 1 not found');
        return;
    }

    // 3. Get players
    const { data: profiles } = await adminSupabase.from('profiles').select('id, name').eq('is_approved', true);
    const otherPlayers = profiles.filter(p => p.id !== bernaId).sort(() => 0.5 - Math.random()).slice(0, 7);
    const players = [profiles.find(p => p.id === bernaId), ...otherPlayers];

    console.log(`Simulating 3 games for season: ${season.name}`);

    for (let j = 1; j <= 3; j++) {
        console.log(`--- Game ${j} ---`);
        const eventId = crypto.randomUUID();

        await adminSupabase.from('events').insert({
            id: eventId,
            created_by: bernaId,
            season_id: seasonId,
            title: `Season 1 - Game ${j}`,
            date: new Date(Date.now() - (4 - j) * 86400000).toISOString().split('T')[0],
            time: '20:00:00',
            location: 'The Poker Room',
            buy_in_amount: 10,
            rebuy_amount: 10,
            status: 'completed'
        });

        // Add players with random rebuys
        const sessionPlayers = [];
        let pot = 0;

        // Randomize player order for placement
        const gamePlayers = [...players].sort(() => 0.5 - Math.random());

        for (let i = 0; i < gamePlayers.length; i++) {
            const p = gamePlayers[i];
            const rebuys = Math.floor(Math.random() * 3);
            const invested = 10 + (rebuys * 10);
            pot += invested;

            sessionPlayers.push({
                event_id: eventId,
                player_id: p.id,
                buy_ins: 1,
                rebuys: rebuys,
                total_invested: invested,
                placement: i + 1,
                cash_out: 0,
                profit: 0,
                points_earned: 0
            });
        }

        // Distribute pot
        sessionPlayers[0].cash_out = Math.round(pot * 0.50);
        sessionPlayers[1].cash_out = Math.round(pot * 0.30);
        sessionPlayers[2].cash_out = Math.round(pot * 0.20);

        // Calculate profit and points
        for (const sp of sessionPlayers) {
            sp.profit = sp.cash_out - sp.total_invested;

            let pts = season.pts_per_game || 30;
            if (sp.profit > 0) {
                pts += Math.floor(sp.profit * (season.pts_per_euro_profit || 3));
            }
            if (sp.placement === 1) pts += (season.pts_1st_place || 20);
            else if (sp.placement === 2) pts += (season.pts_2nd_place || 10);
            else if (sp.placement === 3) pts += (season.pts_3rd_place || 5);

            sp.points_earned = pts;
        }

        const { error: insError } = await adminSupabase.from('session_players').insert(sessionPlayers);
        if (insError) console.error('Error inserting session players:', insError);
        else console.log(`Game ${j} simulated with ${sessionPlayers.length} players. Pot: ${pot}€`);
    }

    // 4. Update Profile Totals
    console.log('Updating profile totals...');
    const { data: allStats } = await adminSupabase.from('session_players').select('player_id, points_earned, profit, total_invested, rebuys');

    const aggregates = {};
    allStats.forEach(s => {
        if (!aggregates[s.player_id]) {
            aggregates[s.player_id] = { sessions: 0, profit: 0, invested: 0, rebuys: 0, points: 0 };
        }
        aggregates[s.player_id].sessions += 1;
        aggregates[s.player_id].profit += Number(s.profit);
        aggregates[s.player_id].invested += Number(s.total_invested);
        aggregates[s.player_id].rebuys += s.rebuys;
        aggregates[s.player_id].points += s.points_earned;
    });

    for (const [pid, stats] of Object.entries(aggregates)) {
        await adminSupabase.from('profiles').update({
            total_sessions_played: stats.sessions,
            total_profit: stats.profit,
            total_invested: stats.invested,
            total_rebuys: stats.rebuys,
            total_points: stats.points
        }).eq('id', pid);
    }
    console.log('Update complete!');
}

simulate();
