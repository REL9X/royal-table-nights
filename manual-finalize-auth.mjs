import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function finalizeAsAdmin() {
    const email = "351912334429@royaltable.com"
    const pin = "696969"

    console.log('Signing in as admin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pin
    })

    if (authError) return console.error('Sign in error:', authError.message)
    console.log('Sign in success!')

    const adminSupabase = createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${authData.session.access_token}`
            }
        }
    })

    // 1. Get Beta season
    const { data: season } = await adminSupabase.from('seasons').select('*').eq('name', 'Beta').single()
    if (!season) return console.log('Beta season not found')

    // 2. Mark as completed
    console.log('Updating status to completed...')
    const { data: updateData, error: updateError } = await adminSupabase
        .from('seasons')
        .update({ status: 'completed' })
        .eq('id', season.id)
        .select()

    if (updateError) console.error('Update Error:', updateError)
    else console.log('Update Success! Rows updated:', updateData?.length)
}

finalizeAsAdmin()
