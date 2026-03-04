'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { recalculatePlayerStats } from '@/lib/recalculateStats'

export async function finalizeSession(eventId: string) {
    const supabase = await createClient()

    // Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return redirect('/dashboard')

    // Get all session players
    const { data: sessionPlayers } = await supabase
        .from('session_players')
        .select('*')
        .eq('event_id', eventId)

    if (!sessionPlayers) return { error: 'No players found' }

    const totalPot = sessionPlayers.reduce((sum, p) => sum + Number(p.total_invested), 0)
    const totalCashOut = sessionPlayers.reduce((sum, p) => sum + Number(p.cash_out), 0)
    const diff = totalPot - totalCashOut

    // If there's a difference, distribute it among winners
    if (diff !== 0) {
        const winners = sessionPlayers.filter(p => Number(p.profit) > 0)

        if (winners.length > 0) {
            const rounding = diff / winners.length

            for (const winner of winners) {
                const newCashOut = Number(winner.cash_out) + rounding
                const newProfit = Number(winner.profit) + rounding

                await supabase
                    .from('session_players')
                    .update({
                        cash_out: newCashOut,
                        profit: newProfit
                    })
                    .eq('id', winner.id)

                // Also update local array if needed for the next steps
                winner.cash_out = newCashOut
                winner.profit = newProfit
            }
        }
    }

    // Calculate placements (1st = highest profit)
    // Fetch updated data to be safe
    const { data: finalPlayers } = await supabase
        .from('session_players')
        .select('*, events(buy_in_amount)')
        .eq('event_id', eventId)
        .order('profit', { ascending: false })

    if (finalPlayers) {
        for (let i = 0; i < finalPlayers.length; i++) {
            const p = finalPlayers[i]
            const placement = i + 1

            const pProfit = Number(p.profit)
            const pInvested = Number(p.total_invested)

            // --- POINTS CALCULATION (V2 Gamification) ---
            // 1. Base participation points
            let pointsEarned = 10

            // 2. Performance points (+1 point for every Euro of profit above 0)
            if (pProfit > 0) {
                pointsEarned += Math.floor(pProfit)
            }

            // 3. Placement Bonus
            if (placement === 1 && pProfit > 0) pointsEarned += 10
            if (placement === 2 && pProfit > 0) pointsEarned += 5

            // Update placement and points in session_players
            await supabase
                .from('session_players')
                .update({
                    placement: placement,
                    points_earned: pointsEarned
                })
                .eq('id', p.id)

            // Recalculate Player's Global Profile Stats from scratch for perfect accuracy
            await recalculatePlayerStats(p.player_id)
        }
    }

    // Update event status to completed
    await supabase
        .from('events')
        .update({ status: 'completed' })
        .eq('id', eventId)

    revalidatePath('/dashboard')
    revalidatePath('/admin')
    revalidatePath(`/history/${eventId}`) // we will create a history view
    redirect('/dashboard') // redirect to dashboard or history page
}
