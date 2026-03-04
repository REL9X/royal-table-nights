const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupAdmin() {
    console.log("Setting up Admin account with preferred PIN...")

    const phone = "+35191234429"
    const pin = "696969"
    const name = "GM Berna"

    // We use the dummy email format created for the Phone+PIN login hack
    const email = "35191234429@royaltable.com"

    // 1. Sign up the user
    console.log("Signing up user: ", phone)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: pin,
        options: {
            data: {
                full_name: name,
                phone: phone
            }
        }
    })

    if (authError) {
        if (authError.message.includes("User already registered")) {
            console.log("User already exists! Attempting to force update their password to the new PIN.")
            // Unfortunately we can't force update the password with just the Anon Key easily without login.
            // We will instruct the user to login with their old password and change it, or just use the new one if deleted.
            console.log("If you need to change the password, you must delete the user from Supabase Auth manually first.")
            return
        } else {
            console.error("Error signing up:", authError.message)
            return;
        }
    }

    if (authData.user) {
        console.log("User signed up successfully. ID:", authData.user.id)

        console.log("Waiting for profile creation trigger...")
        await new Promise(resolve => setTimeout(resolve, 3000))

        console.log("Making sure user is an admin...")
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                role: 'admin',
                is_approved: true,
                name: name,
                phone: phone
            })
            .eq('id', authData.user.id)

        if (updateError) {
            console.error("Error updating profile to admin:", updateError.message)
        } else {
            console.log("✅ Successfully created GM Berna!")
            console.log("You can now login on your phone with:")
            console.log(`Phone: ${phone}`)
            console.log(`PIN: ${pin}`)
        }
    }
}

setupAdmin()
