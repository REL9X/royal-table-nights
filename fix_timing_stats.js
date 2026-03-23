const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function fixTiming() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Sign in as Admin to bypass RLS
    console.log('Signing in as admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: "351912334429@royaltable.com",
        password: "696969"
    });

    if (authError) {
        console.error('Sign in error:', authError.message);
        return;
    }

    const adminSupabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${authData.session.access_token}` } }
    });

    // 2. Fix Event Times
    console.log('Fetching completed events...');
    const { data: events } = await adminSupabase.from('events').select('*').eq('status', 'completed');

    for (const event of events) {
        let update = {};
        let startedAt = event.started_at;
        let endedAt = event.ended_at;

        if (!startedAt) {
            // Set to 20:00:00 on the event date
            startedAt = new Date(`${event.date}T20:00:00Z`).toISOString();
            update.started_at = startedAt;
        }

        if (!endedAt) {
            // Set to 3.5 hours after start
            endedAt = new Date(new Date(startedAt).getTime() + (3.5 * 3600000)).toISOString();
            update.ended_at = endedAt;
        }

        if (Object.keys(update).length > 0) {
            await adminSupabase.from('events').update(update).eq('id', event.id);
            console.log(`Updated times for event: ${event.title || event.id}`);
        }

        // 3. Fix Session Player Times for this event
        const { data: sPlayers } = await adminSupabase.from('session_players').select('*').eq('event_id', event.id);
        const startMs = new Date(startedAt).getTime();
        const endMs = new Date(endedAt).getTime();
        const durationMs = endMs - startMs;

        for (const sp of sPlayers) {
            let spUpdate = {};

            // If they didn't cash out, set eliminated_at
            if (Number(sp.cash_out) === 0 && !sp.eliminated_at) {
                // Eliminate between 30 mins and end duration
                const elimMs = startMs + (1800000 + Math.random() * (durationMs - 1800000));
                spUpdate.eliminated_at = new Date(elimMs).toISOString();
            }

            // If they have rebuys, set first_rebuy_at
            if (sp.rebuys > 0 && !sp.first_rebuy_at) {
                // Rebuy between 15 mins and 90 mins
                const rebuyMs = startMs + (900000 + Math.random() * 4500000);
                spUpdate.first_rebuy_at = new Date(rebuyMs).toISOString();
            }

            if (Object.keys(spUpdate).length > 0) {
                await adminSupabase.from('session_players').update(spUpdate).eq('id', sp.id);
            }
        }
    }

    console.log('Timing stats backfill complete!');
}

fixTiming();
