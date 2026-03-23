import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    console.log('--- Checking Profiles ---')
    const { data: profiles } = await supabase
        .from('profiles')
        .select('name, total_points, championship_badges_count')
        .order('total_points', { ascending: false })

    console.table(profiles)
}

check()
