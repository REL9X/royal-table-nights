import { createClient } from '@/lib/supabase/server'

/**
 * Fully recalculates a player's lifetime statistics (profit, sessions, points, etc.)
 * by aggregating their entire history in the `session_players` table.
 * Ensure this is only called from secure server contexts.
 * 
 * @param playerId The UUID of the player to recalculate
 */
export async function recalculatePlayerStats(playerId: string) {
    const supabase = await createClient()

    // 1. Fetch ALL completed sessions for this player, including event details for validation
    const { data: allSessions, error } = await supabase
        .from('session_players')
        .select('*, events(status)')
        .eq('player_id', playerId)

    if (error) {
        console.error(`Error fetching sessions for player ${playerId}:`, error)
        return false
    }

    // Only count sessions where the event is actually completed
    const completedSessions = allSessions?.filter(s => s.events?.status === 'completed') || []

    // 2. Aggregate the stats from scratch
    let total_sessions_played = completedSessions.length
    let total_profit = 0
    let total_invested = 0
    let biggest_win = 0
    let biggest_loss = 0
    let total_rebuys = 0
    let total_points = 0

    for (const session of completedSessions) {
        const profit = Number(session.profit)
        const invested = Number(session.total_invested)

        total_profit += profit
        total_invested += invested
        total_rebuys += session.rebuys

        // Accumulate points directly from the session record (generated on finalize/edit)
        total_points += (session.points_earned || 0)

        // Biggest Win
        if (profit > biggest_win) {
            biggest_win = profit
        }

        // Biggest Loss (stored as a positive number representing the max negative dip)
        if (profit < 0 && Math.abs(profit) > biggest_loss) {
            biggest_loss = Math.abs(profit)
        }
    }

    // 3. Add Season Bonuses from championship_wins
    const { data: profile } = await supabase
        .from('profiles')
        .select('championship_wins')
        .eq('id', playerId)
        .single()

    const championshipWins = Array.isArray(profile?.championship_wins) ? profile.championship_wins : []

    if (championshipWins.length > 0) {
        const seasonIds = championshipWins.map((w: any) => w.seasonId)
        const { data: seasonRules } = await supabase
            .from('seasons')
            .select('id, pts_season_1st')
            .in('id', seasonIds)

        const seasonPoints = seasonRules?.reduce((sum: number, s: any) => sum + (Number(s.pts_season_1st) || 0), 0) || 0
        total_points += seasonPoints
    }

    // 4. Update the global profiles table with the perfectly clean recalculated data
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            total_sessions_played,
            total_profit,
            total_invested,
            biggest_win,
            biggest_loss,
            total_rebuys,
            total_points
        })
        .eq('id', playerId)

    if (updateError) {
        console.error(`Error updating stats for player ${playerId}:`, updateError)
        return false
    }

    return true
}
