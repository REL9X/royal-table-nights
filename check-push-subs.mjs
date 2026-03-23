import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkSubs() {
    const { data, error } = await supabase.from('push_subscriptions').select('*, profiles(name)')
    if (error) {
        console.error('Error fetching subs:', error)
        return
    }
    console.log('Push Subscriptions:', JSON.stringify(data, null, 2))
}

checkSubs()
