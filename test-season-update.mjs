import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function testUpdate() {
    // 1. Get the Beta season
    const { data: seasons } = await supabase.from('seasons').select('*').eq('name', 'Beta').single()
    if (!seasons) return console.log('Beta season not found')

    console.log('Current status:', seasons.status)
    console.log('Attempting update to completed...')

    // We need to be authenticated as admin for this to work via RLS
    // But since I am running this via node with env vars, I might not have a session.
    // Wait, if I don't have a session, the policy USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin') will fail.

    // Let's check if we can update it directly. 
    // If it fails, then RLS is definitely the one blocking it in the app too.
    const { data, error, count } = await supabase
        .from('seasons')
        .update({ status: 'completed' })
        .eq('id', seasons.id)
        .select()

    if (error) {
        console.error('Update Error:', error)
    } else {
        console.log('Update Success! Rows updated:', data?.length)
        console.log('New status in DB:', data?.[0]?.status)
    }
}

testUpdate()
