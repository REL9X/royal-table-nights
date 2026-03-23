import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log('Fetching all seasons...')
    const { data: seasons, error: seasonError } = await supabase
        .from('seasons')
        .select('id, name, status')

    if (seasonError) {
        console.error('Seasons error:', seasonError)
    } else {
        console.log('Seasons:')
        console.table(seasons)
    }
}

test()
