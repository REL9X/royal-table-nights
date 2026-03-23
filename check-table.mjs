import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkTable() {
    const { data, error } = await supabase.from('broadcasts').select('count', { count: 'exact', head: true })
    if (error) {
        console.error('Broadcasts table error:', error)
    } else {
        console.log('Broadcasts table exists, count:', data)
    }
}

checkTable()
