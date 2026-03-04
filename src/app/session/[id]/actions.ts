'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Admin or Player Rebuy Action
export async function addRebuy(eventId: string, playerId: string) {
    const supabase = await createClient()

    // Get event rebuy amount
    const { data: event } = await supabase.from('events').select('rebuy_amount').eq('id', eventId).single()
    if (!event) return { error: 'Event not found' }

    // Get player session
    const { data: sessionPlayer } = await supabase
        .from('session_players')
        .select('rebuys, total_invested, profit')
        .eq('event_id', eventId)
        .eq('player_id', playerId)
        .single()

    if (!sessionPlayer) return { error: 'Player not in session' }

    // Admin and self-authorization allowed (assuming honesty/admin approval in real life)
    // Optionally, only admin or the player themselves can trigger this

    const newRebuys = sessionPlayer.rebuys + 1
    const newInvested = Number(sessionPlayer.total_invested) + Number(event.rebuy_amount)
    const newProfit = Number(sessionPlayer.profit) - Number(event.rebuy_amount)

    const { error } = await supabase
        .from('session_players')
        .update({
            rebuys: newRebuys,
            total_invested: newInvested,
            profit: newProfit
        })
        .eq('event_id', eventId)
        .eq('player_id', playerId)

    if (error) return { error: error.message }

    revalidatePath(`/session/${eventId}`)
    return { success: true }
}

export async function submitCashout(eventId: string, playerId: string, amount: number) {
    const supabase = await createClient()

    const { data: sessionPlayer } = await supabase
        .from('session_players')
        .select('total_invested, profit')
        .eq('event_id', eventId)
        .eq('player_id', playerId)
        .single()

    if (!sessionPlayer) return { error: 'Player not found' }

    const profit = amount - Number(sessionPlayer.total_invested)

    const { error } = await supabase
        .from('session_players')
        .update({
            cash_out: amount,
            profit: profit,
            is_eliminated: amount === 0
        })
        .eq('event_id', eventId)
        .eq('player_id', playerId)

    if (error) return { error: error.message }

    revalidatePath(`/session/${eventId}`)
    return { success: true }
}

export async function eliminatePlayer(eventId: string, playerId: string) {
    const supabase = await createClient()

    // For zero cashout immediately eliminates
    return submitCashout(eventId, playerId, 0)
}
