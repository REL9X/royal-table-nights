import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testUpsert() {
    console.log('Testing UPSERT to push_subscriptions...')
    
    // We need a valid user session to test RLS "auth.uid() = user_id"
    // Since I don't have a session, this will likely fail with "New row violates row-level security policy"
    // OR it will just not find any policy that matches (since auth.uid() is null).
    
    const { data, error } = await supabase.from('push_subscriptions').upsert({
        user_id: '15e53fd9-b8fa-4c4e-a6ad-c883c2ecc50f', // Berna's ID
        endpoint: 'https://test.endpoint/123',
        p256dh: 'test-p256dh',
        auth: 'test-auth'
    })
    
    if (error) {
        console.error('UPSERT Error:', error)
    } else {
        console.log('UPSERT Success (unexpected without auth):', data)
    }
}

testUpsert()
