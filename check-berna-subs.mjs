import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkData() {
    const { data: profs } = await supabase.from('profiles').select('id, name').eq('name', 'Berna')
    console.log('Berna Profiles:', profs)
    
    if (profs && profs.length > 0) {
        const bernaId = profs[0].id
        const { data: subs } = await supabase.from('push_subscriptions').select('*').eq('user_id', bernaId)
        console.log('Berna Subscriptions:', subs)
    }
}

checkData()
