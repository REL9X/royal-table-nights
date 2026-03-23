'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { recalculatePlayerStats } from '@/lib/recalculateStats'

// Helper to verify admin
async function requireAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return redirect('/dashboard')

    return { supabase, user }
}

export async function updateEventDetails(eventId: string, formData: FormData) {
    const { supabase } = await requireAdmin()

    const title = formData.get('title') as string
    const date = formData.get('date') as string
    const time = formData.get('time') as string
    const location = formData.get('location') as string
    const buy_in_amount = formData.get('buy_in_amount') as string
    const rebuy_amount = formData.get('rebuy_amount') as string
    const notes = formData.get('notes') as string
    const season_id = formData.get('season_id') as string

    // Tournament Point Rules
    const pts_per_game = parseInt(formData.get('pts_per_game') as string) || 10
    const pts_per_euro_profit = parseFloat(formData.get('pts_per_euro_profit') as string) || 1
    const pts_1st_place = parseInt(formData.get('pts_1st_place') as string) || 10
    const pts_2nd_place = parseInt(formData.get('pts_2nd_place') as string) || 5
    const pts_3rd_place = parseInt(formData.get('pts_3rd_place') as string) || 0

    // Validate if season was changed to a new one
    if (season_id) {
        // get current event to see if we are switching seasons
        const { data: currentEvent } = await supabase.from('events').select('season_id').eq('id', eventId).single()

        if (currentEvent && currentEvent.season_id !== season_id) {
            const { data: season } = await supabase.from('seasons').select('max_games').eq('id', season_id).single()
            const { count } = await supabase.from('events').select('*', { count: 'exact', head: true }).eq('season_id', season_id)

            if (season && count !== null && count >= season.max_games) {
                throw new Error(`Season max games reached (${season.max_games}). Cannot change event to this season.`)
            }
        }
    }

    const { error } = await supabase
        .from('events')
        .update({
            title,
            date,
            time,
            location,
            buy_in_amount,
            rebuy_amount,
            notes,
            season_id: season_id || null,
            pts_per_game,
            pts_per_euro_profit,
            pts_1st_place,
            pts_2nd_place,
            pts_3rd_place
        })
        .eq('id', eventId)

    if (error) throw new Error(error.message)
    revalidatePath(`/admin/events/${eventId}/edit`)
    revalidatePath('/admin')
}

export async function updateSessionPlayer(eventId: string, playerId: string, formData: FormData) {
    const { supabase } = await requireAdmin()

    const buy_ins = Number(formData.get('buy_ins'))
    const rebuys = Number(formData.get('rebuys'))
    const total_invested = Number(formData.get('total_invested'))
    const cash_out = Number(formData.get('cash_out'))
    const placement = Number(formData.get('placement'))
    const is_eliminated = formData.get('is_eliminated') === 'true'

    const profit = cash_out - total_invested

    // Points earned logic (same as finalize)
    let pointsEarned = 10
    if (profit > 0) pointsEarned += Math.floor(profit)
    if (placement === 1 && profit > 0) pointsEarned += 10
    if (placement === 2 && profit > 0) pointsEarned += 5

    const { error } = await supabase
        .from('session_players')
        .update({
            buy_ins,
            rebuys,
            total_invested,
            cash_out,
            profit,
            placement,
            points_earned: pointsEarned,
            is_eliminated
        })
        .eq('event_id', eventId)
        .eq('player_id', playerId)

    if (error) throw new Error(error.message)

    // Recalculate this player's lifetime stats!
    await recalculatePlayerStats(playerId)

    revalidatePath(`/admin/events/${eventId}/edit`)
    revalidatePath(`/history/${eventId}`)
    revalidatePath('/leaderboard')
}

export async function removePlayerFromSession(eventId: string, playerId: string) {
    const { supabase } = await requireAdmin()

    const { error } = await supabase
        .from('session_players')
        .delete()
        .eq('event_id', eventId)
        .eq('player_id', playerId)

    if (error) throw new Error(error.message)

    // Recalculate player stats since a session was deleted!
    await recalculatePlayerStats(playerId)

    revalidatePath(`/admin/events/${eventId}/edit`)
    revalidatePath(`/history/${eventId}`)
    revalidatePath('/leaderboard')
}

export async function deleteEvent(eventId: string) {
    const { supabase } = await requireAdmin()

    // 1. Get all players involved in this event
    const { data: sessionPlayers } = await supabase
        .from('session_players')
        .select('player_id')
        .eq('event_id', eventId)

    // 2. Delete the event (cascade will delete session_players and event_responses)
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

    if (error) throw new Error(error.message)

    // 3. Recalculate stats for EVERY player that was in this event
    if (sessionPlayers) {
        for (const sp of sessionPlayers) {
            await recalculatePlayerStats(sp.player_id)
        }
    }

    revalidatePath('/admin')
    revalidatePath('/history')
    revalidatePath('/leaderboard')
    redirect('/admin')
}
