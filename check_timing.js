const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkTimingData() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('--- Checking Events Timing ---');
    const { data: events } = await supabase.from('events').select('id, title, started_at, ended_at').eq('status', 'completed');
    console.table(events);

    console.log('--- Checking Session Players Timing (Sample) ---');
    const { data: sp } = await supabase.from('session_players').select('event_id, player_id, eliminated_at, first_rebuy_at').limit(10);
    console.table(sp);
}

checkTimingData();
