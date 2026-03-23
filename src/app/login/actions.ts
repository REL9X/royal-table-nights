'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// In a free application where we don't want to pay Twilio for real SMS verification,
// we will just use standard Email/Password authentication in the background, but 
// we will USE their Phone Number + a PIN as the credentials.
// For example: 
// email: +351900000000@royaltable.com
// password: their 6 digit pin

export async function loginWithPin(formData: FormData) {
    const supabase = await createClient()

    const rawPhone = formData.get('phone') as string
    const pin = formData.get('pin') as string

    if (!rawPhone || !pin) {
        return { error: 'Phone and PIN are required' }
    }

    // Append +351 to the start of whatever 9 digits they typed
    const digits = rawPhone.replace(/\D/g, '')
    const phone = `+351${digits.slice(-9)}`

    // Format phone number into a dummy email for Supabase Auth
    const structuredEmail = `${phone.replace(/\D/g, '')}@royaltable.com`

    const { error } = await supabase.auth.signInWithPassword({
        email: structuredEmail,
        password: pin, // Using their PIN as the password
    })

    if (error) {
        console.error("Login Error:", error.message)
        return { error: 'Invalid Phone Number or PIN.' }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signupWithPin(formData: FormData) {
    const supabase = await createClient()

    const rawPhone = formData.get('phone') as string
    const pin = formData.get('pin') as string
    const name = formData.get('name') as string

    if (!rawPhone || !pin || !name) {
        return { error: 'All fields are required' }
    }

    if (name.trim().length > 12) {
        return { error: 'Name must be 12 characters or less.' }
    }

    const digits = rawPhone.replace(/\D/g, '')
    const phone = `+351${digits.slice(-9)}`

    // --- ENFORCE INVITE SYSTEM ---
    const { data: allowedPhone } = await supabase
        .from('allowed_phones')
        .select('phone')
        .eq('phone', phone)
        .single()

    if (!allowedPhone) {
        return { error: 'Invite needed: Your phone number is not listed. Ask GM Berna for access!' }
    }

    const structuredEmail = `${phone.replace(/\D/g, '')}@royaltable.com`

    const { error } = await supabase.auth.signUp({
        email: structuredEmail,
        password: pin,
        options: {
            data: {
                full_name: name,
                // We also store the raw phone number in metadata so it gets migrated to the profiles table
                phone: phone
            }
        }
    })

    if (error) {
        console.error("Signup Error:", error.message)
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
