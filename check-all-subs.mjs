import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkAll() {
    const { data, error } = await supabase.from('push_subscriptions').select('*, profiles(name)')
    if (error) {
        console.error('Error:', error)
        return
    }
    console.log('All Push Subscriptions:', data)
}

checkAll()
