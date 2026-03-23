import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkTable() {
    const { count, error } = await supabase.from('broadcasts').select('*', { count: 'exact', head: true })
    if (error) {
        console.error('Broadcasts table error:', JSON.stringify(error, null, 2))
    } else {
        console.log('Broadcasts table exists, count:', count)
    }
}

checkTable()
