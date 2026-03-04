'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitRsvp(eventId: string, status: 'accepted' | 'declined') {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not logged in' }

    // Upsert the response using conflict resolution on unique constraint (event_id, player_id)
    const { error } = await supabase
        .from('event_responses')
        .upsert({
            event_id: eventId,
            player_id: user.id,
            status
        }, { onConflict: 'event_id,player_id' })

    if (error) {
        console.error('RSVP error:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
