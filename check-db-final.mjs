import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
    console.log('--- Checking Seasons table ---')
    const { data: seasons, error: sError } = await supabase.from('seasons').select('*')
    console.log('Seasons count:', seasons?.length, 'Error:', sError?.message)
    console.log('Seasons status:', seasons?.map(s => ({ name: s.name, status: s.status })))

    console.log('\n--- Checking Profile Columns ---')
    const { data: profile, error: pError } = await supabase.from('profiles').select('*').limit(1)
    if (profile?.[0]) {
        console.log('Profile columns:', Object.keys(profile[0]))
    } else {
        console.log('No profiles found or error:', pError?.message)
    }
}

check()
