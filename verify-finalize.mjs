import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function verify() {
    const { data, error } = await supabase.from('seasons').select('*').eq('name', 'Beta').single()
    console.log('Season name:', data?.name)
    console.log('Season status:', data?.status)

    if (data?.status !== 'completed') {
        console.log('Attempting forced update via anon key (might fail RLS)...')
        const { data: updateData, error: updateError } = await supabase
            .from('seasons')
            .update({ status: 'completed' })
            .eq('id', data.id)
            .select()

        if (updateError) console.error('Update Error:', updateError)
        console.log('Rows updated:', updateData?.length || 0)
    }
}

verify()
