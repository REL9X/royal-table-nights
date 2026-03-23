import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSeasonsCols() {
    const { data } = await supabase.from('seasons').select('*').limit(1)
    if (data?.[0]) {
        console.log('Seasons columns:', Object.keys(data[0]))
    }
}

checkSeasonsCols()
