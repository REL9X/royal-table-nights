'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approvePlayer(playerId: string) {
    const supabase = await createClient()

    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Admin access required' }
    }

    // Update target player to approved
    const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', playerId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

export async function rejectPlayer(playerId: string) {
    const supabase = await createClient()

    // Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { error: 'Admin access required' }
    }

    // For this version we will just leave them unapproved.
    return { success: true }
}

export async function addAllowedPhone(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authorized' }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Admin access required' }

    const rawPhone = formData.get('phone') as string
    const name = formData.get('name') as string

    if (!rawPhone || !name) return { error: 'Phone and Name are required' }

    // Normalize phone number to include +351
    let phone = rawPhone.replace(/\D/g, '')
    const fullPhone = `+351${phone.slice(-9)}`

    const { error } = await supabase
        .from('allowed_phones')
        .insert({
            phone: fullPhone,
            name: name,
            added_by: user.id
        })

    if (error) {
        if (error.code === '23505') {
            return { error: 'This phone number is already invited.' }
        }
        return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

export async function removeAllowedPhone(phone: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authorized' }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Admin access required' }

    const { error } = await supabase
        .from('allowed_phones')
        .delete()
        .eq('phone', phone)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

export async function sendBroadcast(title: string, message: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authorized' }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Admin access required' }

    const { error } = await supabase
        .from('broadcasts')
        .insert({
            title,
            message,
            created_by: user.id
        })

    if (error) return { error: error.message }

    return { success: true }
}
