// Import Supabase client
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials!")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupAdmin() {
    console.log("Setting up Admin account...")

    const email = "bernardodurancouto@gmail.com"
    const password = "berna1"
    const name = "GM Berna"

    // 1. Sign up the user
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
        if (authError.message.includes("User already registered")) {
            console.log("User already exists, attempting to log in to get user ID...")
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            })
            if (loginError) {
                console.error("Error logging in:", loginError.message)
                return;
            }
            await makeAdmin(loginData.user.id, name)
        } else {
            console.error("Error signing up:", authError.message)
            return;
        }
    } else if (authData.user) {
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
        console.log("Email: bernardodurancouto@gmail.com")
        console.log("Password: berna1 (Supabase requires at least 6 characters)")
    }
}

setupAdmin()
