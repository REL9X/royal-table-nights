import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log('Fetching active season...')
    const { data: season, error: seasonError } = await supabase
        .from('seasons')
        .select('*')
        .eq('status', 'active')
        .single()

    if (seasonError || !season) {
        console.error('Season not found or error:', seasonError)
        return
    }
    console.log('Season found:', season.name, season.id)

    console.log('Testing events!inner query...')
    const { data: sPointsData, error: sPointsError } = await supabase
        .from('session_players')
        .select(`
            player_id, 
            points_earned, 
            events!inner(season_id, status)
        `)
        .eq('events.season_id', season.id)
        .eq('events.status', 'completed')

    if (sPointsError) {
        console.error('Error in session_players query:', sPointsError)
    } else {
        console.log(`Query success! Found ${sPointsData?.length || 0} records.`)
        // console.log(sPointsData?.slice(0, 2))
    }
}

test()
