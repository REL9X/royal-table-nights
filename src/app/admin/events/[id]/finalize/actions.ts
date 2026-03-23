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

    // Fetch updated data to be safe, including the season rules AND event-level tournament rules
    const { data: finalPlayers } = await supabase
        .from('session_players')
        .select('*, events(buy_in_amount, season_id, pts_per_game, pts_per_euro_profit, pts_1st_place, pts_2nd_place, pts_3rd_place, seasons(pts_per_game, pts_per_euro_profit, pts_1st_place, pts_2nd_place, pts_3rd_place))')
        .eq('event_id', eventId)
        .order('profit', { ascending: false })

    if (finalPlayers) {
        for (let i = 0; i < finalPlayers.length; i++) {
            const p = finalPlayers[i]
            const placement = i + 1
            const pProfit = Number(p.profit)

            const pointRules = p.events?.seasons ?? p.events ?? {
                pts_per_game: 10,
                pts_per_euro_profit: 1,
                pts_1st_place: 10,
                pts_2nd_place: 5,
                pts_3rd_place: 0
            }

            let pointsEarned = pointRules.pts_per_game

            if (pProfit > 0) {
                pointsEarned += Math.round(pProfit * pointRules.pts_per_euro_profit)
            }

            if (placement === 1 && pProfit > 0) pointsEarned += pointRules.pts_1st_place
            if (placement === 2 && pProfit > 0) pointsEarned += pointRules.pts_2nd_place
            if (placement === 3 && pProfit > 0) pointsEarned += pointRules.pts_3rd_place

            await supabase
                .from('session_players')
                .update({ placement, points_earned: pointsEarned })
                .eq('id', p.id)
        }
    }

    await supabase
        .from('events')
        .update({
            status: 'completed',
            ended_at: new Date().toISOString()
        })
        .eq('id', eventId)

    // NOW recalculate stats — event is completed so it will be included
    if (finalPlayers) {
        for (const p of finalPlayers) {
            await recalculatePlayerStats(p.player_id)
        }
    }

    revalidatePath('/dashboard')
    revalidatePath('/leaderboard')
    revalidatePath('/admin')
    revalidatePath(`/history/${eventId}`)
    redirect('/dashboard')
}
