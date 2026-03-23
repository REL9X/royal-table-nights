const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkSeasons() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: seasons, error } = await supabase.from('seasons').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching seasons:', error);
        return;
    }
    console.log('Current Seasons:', JSON.stringify(seasons, null, 2));

    const { data: profiles } = await supabase.from('profiles').select('id, name').eq('is_approved', true);
    console.log('Approved Profiles:', JSON.stringify(profiles, null, 2));
}

checkSeasons();
