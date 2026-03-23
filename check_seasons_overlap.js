const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkSeasonData() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    console.log('--- Seasons ---');
    const { data: seasons } = await supabase.from('seasons').select('*');
    console.table(seasons);

    for (const season of seasons) {
        console.log(`--- Events for Season: ${season.name} (${season.id}) ---`);
        const { data: events } = await supabase.from('events').select('id, title, status').eq('season_id', season.id);
        console.table(events);

        if (events && events.length > 0) {
            const eventIds = events.map(e => e.id);
            const { data: spCount } = await supabase
                .from('session_players')
                .select('id', { count: 'exact', head: true })
                .in('event_id', eventIds);
            console.log(`Total session_player records for this season: ${spCount}`);
        }
    }
}

checkSeasonData();
