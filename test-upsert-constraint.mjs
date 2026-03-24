import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role to bypass RLS

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function test() {
    console.log("Trying upsert...")
    const { data, error } = await supabase.from('push_subscriptions').upsert({
        user_id: '123e4567-e89b-12d3-a456-426614174000', // dummy uuid
        endpoint: 'https://updates.push.services.mozilla.com/test',
        p256dh: 'test',
        auth: 'test'
    }, { onConflict: 'user_id,endpoint' })
    
    console.log('Upsert result:', error ? error.message : 'Success', error || data)
}

test()
