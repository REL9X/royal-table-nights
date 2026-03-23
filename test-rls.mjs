import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log('Fetching policies from pg_policies via RPC (if available) or REST...')
    // We can't query pg_policies directly from typical anon key unless exposed via RPC or views.
    // Let's try to update a season and look at the exact response we get.
    console.log('Attempting to update season status with returning=*')
    const { data: updatedSeason, error: updateError, status, statusText } = await supabase
        .from('seasons')
        .update({ status: 'active' })
        .eq('id', '060d9f5d-bbbe-476c-bd20-8a0861f1d752')
        .select()

    console.log('Update Error:', updateError)
    console.log('Status:', status, statusText)
    console.log('Updated Data:', updatedSeason)
}

test()
