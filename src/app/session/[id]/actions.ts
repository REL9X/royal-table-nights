'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getAdminOrSelf(playerId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not logged in', supabase: null }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'
    const isSelf = user.id === playerId

    if (!isAdmin && !isSelf) return { error: 'Unauthorized', supabase: null }

    return { supabase, isAdmin, userId: user.id }
}

const round2 = (n: number) => Math.round(n * 100) / 100

// Admin or Player Rebuy Action
export async function addRebuy(eventId: string, playerId: string) {
    const { supabase, error } = await getAdminOrSelf(playerId)
    if (error || !supabase) return { error }

    const { data: event } = await supabase.from('events').select('rebuy_amount').eq('id', eventId).single()
    if (!event) return { error: 'Event not found' }

    const { data: sp } = await supabase
        .from('session_players')
        .select('rebuys, total_invested, profit, is_eliminated')
        .eq('event_id', eventId).eq('player_id', playerId).single()

    if (!sp) return { error: 'Player not in session' }
    if (sp.is_eliminated) return { error: 'Player already eliminated' }

    const updateData: any = {
        rebuys: sp.rebuys + 1,
        total_invested: round2(Number(sp.total_invested) + Number(event.rebuy_amount)),
        profit: round2(Number(sp.profit) - Number(event.rebuy_amount))
    }

    if (sp.rebuys === 0) {
        updateData.first_rebuy_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
        .from('session_players')
        .update(updateData)
        .eq('event_id', eventId).eq('player_id', playerId)

    if (updateError) return { error: updateError.message }

    revalidatePath(`/session/${eventId}`)
    return { success: true }
}

// Cash out player — protected: can't cashout twice
export async function submitCashout(eventId: string, playerId: string, amount: number) {
    const { supabase, error } = await getAdminOrSelf(playerId)
    if (error || !supabase) return { error }

    const { data: sp } = await supabase
        .from('session_players')
        .select('total_invested, is_eliminated, cash_out')
        .eq('event_id', eventId).eq('player_id', playerId).single()

    if (!sp) return { error: 'Player not found' }

    // Prevent double cashout
    if (sp.is_eliminated || Number(sp.cash_out) > 0) {
        return { error: 'Player already cashed out' }
    }

    const profit = amount - Number(sp.total_invested)

    const { error: updateError } = await supabase
        .from('session_players')
        .update({
            cash_out: amount,
            profit,
            is_eliminated: true,
            eliminated_at: new Date().toISOString()
        })
        .eq('event_id', eventId).eq('player_id', playerId)

    if (updateError) return { error: updateError.message }

    revalidatePath(`/session/${eventId}`)
    return { success: true }
}

// Bust player (0 cashout)
export async function eliminatePlayer(eventId: string, playerId: string) {
    return submitCashout(eventId, playerId, 0)
}

// Undo a cashout — admin or player can reverse a mistaken cashout
export async function undoCashout(eventId: string, playerId: string) {
    const { supabase, error } = await getAdminOrSelf(playerId)
    if (error || !supabase) return { error }

    const { data: sp } = await supabase
        .from('session_players')
        .select('total_invested')
        .eq('event_id', eventId).eq('player_id', playerId).single()

    if (!sp) return { error: 'Player not found' }

    const { error: updateError } = await supabase
        .from('session_players')
        .update({
            cash_out: 0,
            profit: -Number(sp.total_invested),
            is_eliminated: false,
            eliminated_at: null
        })
        .eq('event_id', eventId).eq('player_id', playerId)

    if (updateError) return { error: updateError.message }

    revalidatePath(`/session/${eventId}`)
    return { success: true }
}

// Undo a rebuy — reverse the last rebuy
export async function undoRebuy(eventId: string, playerId: string) {
    const { supabase, error } = await getAdminOrSelf(playerId)
    if (error || !supabase) return { error }

    const { data: event } = await supabase.from('events').select('rebuy_amount').eq('id', eventId).single()
    if (!event) return { error: 'Event not found' }

    const { data: sp } = await supabase
        .from('session_players')
        .select('rebuys, total_invested, profit, is_eliminated')
        .eq('event_id', eventId).eq('player_id', playerId).single()

    if (!sp) return { error: 'Player not in session' }
    if (sp.rebuys <= 0) return { error: 'No rebuys to undo' }
    if (sp.is_eliminated) return { error: 'Player already eliminated' }

    const updateData: any = {
        rebuys: sp.rebuys - 1,
        total_invested: round2(Number(sp.total_invested) - Number(event.rebuy_amount)),
        profit: round2(Number(sp.profit) + Number(event.rebuy_amount))
    }

    // Clear first_rebuy_at if going back to 0 rebuys
    if (sp.rebuys - 1 === 0) {
        updateData.first_rebuy_at = null
    }

    const { error: updateError } = await supabase
        .from('session_players')
        .update(updateData)
        .eq('event_id', eventId).eq('player_id', playerId)

    if (updateError) return { error: updateError.message }

    revalidatePath(`/session/${eventId}`)
    return { success: true }
}

// Add a player mid-session (admin only)
export async function addPlayerToSession(eventId: string, playerId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Unauthorized' }

    // Check if event is active
    const { data: event } = await supabase.from('events').select('buy_in_amount, status').eq('id', eventId).single()
    if (!event || event.status !== 'active') return { error: 'Event not active' }

    // Check if player is already in session
    const { data: existing } = await supabase
        .from('session_players')
        .select('id').eq('event_id', eventId).eq('player_id', playerId).single()

    if (existing) return { error: 'Player already at the table' }

    const buyIn = Number(event.buy_in_amount)
    const { error: insertError } = await supabase.from('session_players').insert({
        event_id: eventId,
        player_id: playerId,
        buy_ins: 1,
        rebuys: 0,
        total_invested: buyIn,
        cash_out: 0,
        profit: -buyIn,
        is_eliminated: false
    })

    if (insertError) return { error: insertError.message }

    revalidatePath(`/session/${eventId}`)
    return { success: true }
}
