import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkBroadcasts() {
    const { data, error } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false }).limit(5)
    if (error) {
        console.error('Error:', error)
        return
    }
    console.log('Recent Broadcasts:', data)
}

checkBroadcasts()
