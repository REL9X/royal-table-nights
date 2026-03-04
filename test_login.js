const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
    console.log("Testing Login...")
    const { data, error } = await supabase.auth.signInWithPassword({
        email: "gmberna@royaltable.com",
        password: "berna1",
    })

    if (error) {
        console.error("Login Failed:", error.message)
    } else {
        console.log("Login Succeeded! User ID:", data.user.id)
    }
}

testLogin()
