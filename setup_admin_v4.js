const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupAdmin() {
    console.log("Fixing Admin account phone number...")

    // The user originally gave 8 digits (91234429), but in the screenshot typed 9 digits (912334429).
    // The frontend requires 9 digits. We will provision the correct 9-digit one.
    const phone = "+351912334429"
    const pin = "696969"
    const name = "GM Berna"

    const email = "351912334429@royaltable.com"

    // 1. Add to allowed_phones first
    console.log("Allowing phone number...")
    await supabase.from('allowed_phones').insert({ phone: phone, name: name })

    // 2. Sign up the user
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
        console.error("Error signing up:", authError.message)
        if (authError.message.includes("already registered")) {
            console.log("User might already exist, moving to profile update step...");
        } else {
            return;
        }
    }

    // Wait for trigger
    console.log("Waiting for profile creation trigger...")
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 3. Find the user ID using the email (if authData.user is null due to existing user)
    // We can't fetch auth users easily without service role key, so if we failed, we just try to update profile by phone

    console.log("Making sure user is an admin...")
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            role: 'admin',
            is_approved: true,
            name: name
        })
        .eq('phone', phone)

    if (updateError) {
        console.error("Error updating profile to admin:", updateError.message)
    } else {
        console.log("✅ Successfully created GM Berna with the correct 9-digit number!")
        console.log(`Phone: ${phone}`)
        console.log(`PIN: ${pin}`)
    }
}

setupAdmin()
