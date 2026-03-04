const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSignup() {
    console.log("Testing Signup to see exact error...")
    const { data, error } = await supabase.auth.signUp({
        email: "bernardodurancouto@gmail.com",
        password: "berna1",
    })

    if (error) {
        console.error("Signup Failed:", error.message)
    } else {
        console.log("Signup Succeeded!", data)
    }
}

testSignup()
