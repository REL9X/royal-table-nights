const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupAdmin() {
    console.log("Setting up Admin account...")

    // Using a slightly different email just to avoid the locked one
    const email = "gmberna@royaltable.com"
    const password = "berna1"
    const name = "GM Berna"

    // 1. Sign up the user
    console.log("Signing up user: ", email)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: name,
            }
        }
    })

    if (authError) {
        console.error("Error signing up:", authError.message)
        return;
    }

    if (authData.user) {
        console.log("User signed up successfully. ID:", authData.user.id)
        // Need to wait slightly for the trigger to fire
        console.log("Waiting for profile creation trigger...")
        await new Promise(resolve => setTimeout(resolve, 3000))
        await makeAdmin(authData.user.id, name)
    }
}

async function makeAdmin(userId, name) {
    console.log("Making user an admin:", userId)
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            role: 'admin',
            is_approved: true,
            name: name
        })
        .eq('id', userId)

    if (updateError) {
        console.error("Error updating profile to admin:", updateError.message)
    } else {
        console.log("✅ Successfully created and upgraded GM Berna to Admin!")
        console.log("You can now login with:")
        console.log("Email: gmberna@royaltable.com")
        console.log("Password: berna1")
    }
}

setupAdmin()
