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
    const season_id = formData.get('season_id') as string

    // Tournament Point Rules (only apply if season_id is empty)
    const pts_per_game = parseInt(formData.get('pts_per_game') as string) || 10
    const pts_per_euro_profit = parseFloat(formData.get('pts_per_euro_profit') as string) || 1
    const pts_1st_place = parseInt(formData.get('pts_1st_place') as string) || 10
    const pts_2nd_place = parseInt(formData.get('pts_2nd_place') as string) || 5
    const pts_3rd_place = parseInt(formData.get('pts_3rd_place') as string) || 0

    // Validate max games if a season is selected
    if (season_id) {
        const { data: season } = await supabase.from('seasons').select('max_games').eq('id', season_id).single()
        const { count } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('season_id', season_id)

        if (season && count !== null && count >= season.max_games) {
            return { error: `Season max games reached (${season.max_games}). Cannot add more.` } // In a real app we'd bubble this to UI
        }
    }

    const { error } = await supabase.from('events').insert({
        created_by: user.id,
        title,
        date,
        time,
        location,
        buy_in_amount,
        rebuy_amount,
        notes,
        season_id: season_id || null,
        status: 'upcoming',
        pts_per_game,
        pts_per_euro_profit,
        pts_1st_place,
        pts_2nd_place,
        pts_3rd_place
    })

    if (error) {
        console.error('Error creating event:', error)
        return { error: error.message }
    }

    // Send push notification to all devices
    const { sendPushPayload } = await import('@/lib/push')
    await sendPushPayload(
        'New Royal Table Event! 🃏',
        `${title} has been scheduled for ${date} at ${time}. Confirm your seat now!`
    )

    revalidatePath('/admin')
    revalidatePath('/dashboard')
    redirect('/admin')
}

export async function startSession(formData: FormData) {
    const eventId = formData.get('eventId') as string
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not logged in' }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Not authorized' }

    // Update event status to active
    const { error: eventUpdateError } = await supabase
        .from('events')
        .update({
            status: 'active',
            started_at: new Date().toISOString()
        })
        .eq('id', eventId)

    if (eventUpdateError) return { error: eventUpdateError.message }

    // Get all accepted players
    const { data: rsvps } = await supabase
        .from('event_responses')
        .select('player_id')
        .eq('event_id', eventId)
        .eq('status', 'accepted')

    // Enforce 14-player limit
    if (rsvps && rsvps.length > 14) {
        return { error: 'Event has more than 14 accepted players. Please remove players before starting the session.' }
    }

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
