import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkVolume() {
    try {
        const { count: seasons } = await supabase.from('seasons').select('*', { count: 'exact', head: true })
        const { count: events } = await supabase.from('events').select('*', { count: 'exact', head: true })
        const { count: players } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
        const { count: responses } = await supabase.from('event_responses').select('*', { count: 'exact', head: true })
        const { count: sessionPlayers } = await supabase.from('session_players').select('*', { count: 'exact', head: true })

        console.log('--- RECAP ---')
        console.log('Seasons:', seasons)
        console.log('Events:', events)
        console.log('Players:', players)
        console.log('Event Responses:', responses)
        console.log('Session Players:', sessionPlayers)

    } catch (e) {
        console.error(e)
    }
}

checkVolume()
