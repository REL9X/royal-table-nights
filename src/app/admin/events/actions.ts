'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEvent(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const title = formData.get('title') as string || 'Royal Table Night'
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const location = formData.get('location') as string
    const buy_in_amount = Number(formData.get('buyInAmount')) || 0
    const rebuy_amount = Number(formData.get('rebuyAmount')) || 0
    const notes = formData.get('notes') as string

    const { error } = await supabase.from('events').insert({
        created_by: user.id,
        title,
        date,
        time,
        location,
        buy_in_amount,
        rebuy_amount,
        notes,
        status: 'upcoming'
    })

    if (error) {
        console.error('Error creating event:', error)
        return { error: error.message }
    }

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    redirect('/admin')
}

export async function startSession(eventId: string) {
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not logged in' }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Not authorized' }

    // Update event status to active
    const { error: eventUpdateError } = await supabase
        .from('events')
        .update({ status: 'active' })
        .eq('id', eventId)

    if (eventUpdateError) return { error: eventUpdateError.message }

    // Get all accepted players
    const { data: rsvps } = await supabase
        .from('event_responses')
        .select('player_id')
        .eq('event_id', eventId)
        .eq('status', 'accepted')

    // Create session_players records
    if (rsvps && rsvps.length > 0) {
        // Get event buy-in
        const { data: event } = await supabase.from('events').select('buy_in_amount').eq('id', eventId).single()
        const buyInAmount = event?.buy_in_amount || 0

        const sessionPlayersData = rsvps.map(r => ({
            event_id: eventId,
            player_id: r.player_id,
            buy_ins: 1, // Start with 1 buy in
            rebuys: 0,
            total_invested: buyInAmount,
            cash_out: 0,
            profit: -buyInAmount, // Initial profit is negative (down the buy-in amount)
        }))

        await supabase.from('session_players').insert(sessionPlayersData)
    }

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    redirect(`/session/${eventId}`)
}
