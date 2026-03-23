import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log('Attempting to update season status...')
    const { data: updatedSeason, error: updateError } = await supabase
        .from('seasons')
        .update({ status: 'completed' })
        .eq('id', '060d9f5d-bbbe-476c-bd20-8a0861f1d752')
        .select()

    console.log('Update Error:', updateError)
    console.log('Updated Data:', updatedSeason)
}

test()
