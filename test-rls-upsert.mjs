import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
    console.log("Authenticating as berna...")
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'bernamrp11@gmail.com',
        // I don't have the password. Let me just check the RLS policy by trying to insert and observing the exact error.
        password: 'wrongpassword' 
    })
    
    // We can't authenticate without the password.
    // Let me just test an unauthenticated insert. It should fail with an RLS error.
    console.log("Trying unauthenticated upsert...")
    const { data, error } = await supabase.from('push_subscriptions').upsert({
        user_id: '123e4567-e89b-12d3-a456-426614174000', // dummy uuid
        endpoint: 'https://updates.push.services.mozilla.com/test',
        p256dh: 'test',
        auth: 'test'
    }, { onConflict: 'user_id,endpoint' })
    
    console.log('Upsert result:', error ? error.message : 'Success (wait, unauthenticated success?)')
}

test()
