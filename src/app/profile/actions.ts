'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authorized' }

    const name = formData.get('name') as string
    const file = formData.get('avatar') as File | null

    if (!name || name.trim() === '') return { error: 'Name is required' }
    if (name.trim().length > 12) return { error: 'Name must be 12 characters or less.' }

    let avatarUrl = undefined;

    // Process the file upload if the user selected one
    if (file && file.size > 0 && file.name) {

        // Ensure size limit (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return { error: 'Image exceeds 5MB limit.' }
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file)

        if (uploadError) return { error: `Failed to upload image: ${uploadError.message}` }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        avatarUrl = publicUrl
    }

    const updates: any = { name }
    if (avatarUrl) updates.avatar_url = avatarUrl

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    revalidatePath('/profile')
    revalidatePath('/leaderboard')
    return { success: true }
}
