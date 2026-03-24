import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LeaderboardView from './LeaderboardView'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
export default async function LeaderboardPage(props: { searchParams: Promise<{ season?: string }> }) {
    const searchParams = await props.searchParams
    const selectedSeasonId = searchParams.season

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch all approved profiles (for All-Time leaderboard)
    const { data: rawProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_approved', true)
        .order('total_points', { ascending: false })

    const safeProfiles = rawProfiles || []

    // Initialize all-time timing agg objects
    const allTimeAgg: Record<string, any> = {}
    safeProfiles.forEach(p => {
        allTimeAgg[p.id] = { fastest_bust_min: Infinity, fastest_rebuy_min: Infinity }
    })

    // Fetch all session players from ALL completed events to find all-time speed records
    const { data: allSessions } = await supabase
        .from('session_players')
        .select('player_id, cash_out, eliminated_at, first_rebuy_at, events!inner(status, started_at)')
        .eq('events.status', 'completed')

    allSessions?.forEach((sp: any) => {
        const pid = sp.player_id
        if (!allTimeAgg[pid]) return

        const startMs = sp.events?.started_at ? new Date(sp.events.started_at).getTime() : null
        if (startMs) {
            // Fastest Bust (cash_out = 0)
            if (Number(sp.cash_out) === 0 && sp.eliminated_at) {
                const diffMins = (new Date(sp.eliminated_at).getTime() - startMs) / 60000
                if (diffMins > 0 && diffMins < allTimeAgg[pid].fastest_bust_min) allTimeAgg[pid].fastest_bust_min = diffMins
            }
            // Fastest Rebuy
            if (sp.first_rebuy_at) {
                const diffMins = (new Date(sp.first_rebuy_at).getTime() - startMs) / 60000
                if (diffMins > 0 && diffMins < allTimeAgg[pid].fastest_rebuy_min) allTimeAgg[pid].fastest_rebuy_min = diffMins
            }
        }
    })

    const profiles = safeProfiles.map(p => ({ ...p, ...allTimeAgg[p.id] }))


    // Fetch all seasons, most recent first
    const { data: seasons } = await supabase
        .from('seasons')
        .select('*')
        .order('created_at', { ascending: false })

    const hasAnySeason = (seasons?.length || 0) > 0

    // Determine the current display season
    const activeSeason = seasons?.find(s => s.status === 'active') || null
    const displaySeason = selectedSeasonId
        ? seasons?.find(s => s.id === selectedSeasonId) || seasons?.[0] || null
        : activeSeason || seasons?.[0] || null

    // ── PERFORMANCE OPTIMIZATION: USE PRE-CALCULATED CHAMPION DATA ──
    const profilesWithChampion = profiles.map(p => ({
        ...p,
        isChampion: (p.championship_badges_count || 0) > 0 || (Array.isArray(p.championship_wins) && p.championship_wins.length > 0)
    }))

    // Keep track of champion IDs for other parts of the page
    const championIds = new Set(profilesWithChampion.filter(p => p.isChampion).map(p => p.id))

    // Compute season standings + awards for the displaySeason
    let seasonStandings: any[] = []
    let seasonAwardProfiles: any[] = []

    let seasonGamesPlayed = 0
    if (displaySeason) {
        const { count: sCount } = await supabase
            .from('events')
            .select('id', { count: 'exact', head: true })
            .eq('season_id', displaySeason.id)
            .eq('status', 'completed')
        seasonGamesPlayed = sCount || 0

        // --- Standings ---
        const { data: sessionData } = await supabase
            .from('session_players')
            .select('player_id, points_earned, events!inner(season_id, status)')
            .eq('events.season_id', displaySeason.id)
            .eq('events.status', 'completed')

        const pointsByPlayer: Record<string, number> = {}
        sessionData?.forEach((sp: any) => {
            const pid = sp.player_id
            pointsByPlayer[pid] = (pointsByPlayer[pid] || 0) + (sp.points_earned || 0)
        })

        seasonStandings = profiles
            .map(p => ({ ...p, season_points: pointsByPlayer[p.id] || 0 }))
            .filter(p => p.season_points > 0)
            .sort((a, b) => b.season_points - a.season_points)

        if (seasonStandings.length === 0) {
            // Season exists but no events played yet — show everyone at 0
            seasonStandings = profiles.map(p => ({ ...p, season_points: 0 }))
        }

        // --- Awards ---
        const { data: seasonSessions } = await supabase
            .from('session_players')
            .select('player_id, profit, total_invested, rebuys, cash_out, eliminated_at, first_rebuy_at, events!inner(season_id, status, started_at)')
            .eq('events.season_id', displaySeason.id)
            .eq('events.status', 'completed')

        const agg: Record<string, any> = {}
        seasonSessions?.forEach((sp: any) => {
            const pid = sp.player_id
            if (!agg[pid]) {
                agg[pid] = {
                    player_id: pid, total_profit: 0, total_invested: 0, biggest_win: 0, biggest_loss: 0,
                    total_rebuys: 0, total_sessions_played: 0,
                    fastest_bust_min: Infinity, fastest_rebuy_min: Infinity
                }
            }
            const profit = Math.round(Number(sp.profit) * 100) / 100
            const invested = Math.round(Number(sp.total_invested) * 100) / 100
            agg[pid].total_profit = Math.round((agg[pid].total_profit + profit) * 100) / 100
            agg[pid].total_invested = Math.round((agg[pid].total_invested + invested) * 100) / 100
            agg[pid].total_rebuys += sp.rebuys || 0
            agg[pid].total_sessions_played += 1
            if (profit > agg[pid].biggest_win) agg[pid].biggest_win = profit
            if (profit < 0 && Math.abs(profit) > agg[pid].biggest_loss) agg[pid].biggest_loss = Math.abs(profit)

            // Timing diffs
            const startMs = sp.events?.started_at ? new Date(sp.events.started_at).getTime() : null
            if (startMs) {
                // Fastest Bust (cash_out = 0)
                if (Number(sp.cash_out) === 0 && sp.eliminated_at) {
                    const diffMins = (new Date(sp.eliminated_at).getTime() - startMs) / 60000
                    if (diffMins > 0 && diffMins < agg[pid].fastest_bust_min) agg[pid].fastest_bust_min = diffMins
                }
                // Fastest Rebuy
                if (sp.first_rebuy_at) {
                    const diffMins = (new Date(sp.first_rebuy_at).getTime() - startMs) / 60000
                    if (diffMins > 0 && diffMins < agg[pid].fastest_rebuy_min) agg[pid].fastest_rebuy_min = diffMins
                }
            }
        })

        seasonAwardProfiles = profiles
            .filter(p => agg[p.id])
            .map(p => ({ ...p, ...agg[p.id] }))
    }

    // --- Timing Awards calculations ---
    // Get all events that have a start and end time
    const { data: timingEvents } = await supabase
        .from('events')
        .select('id, title, date, started_at, ended_at, season_id')
        .not('started_at', 'is', null)
        .not('ended_at', 'is', null)

    let longestMatchAllTime = null
    let longestMatchSeason = null

    if (timingEvents && timingEvents.length > 0) {
        // Calculate duration for all events
        const eventsWithDuration = timingEvents.map(e => ({
            ...e,
            durationMs: new Date(e.ended_at!).getTime() - new Date(e.started_at!).getTime(),
            durationMinutes: Math.round((new Date(e.ended_at!).getTime() - new Date(e.started_at!).getTime()) / 60000)
        }))

        // Match sorting
        const sortedEventsAllTimeDesc = [...eventsWithDuration].sort((a, b) => b.durationMs - a.durationMs)

        longestMatchAllTime = sortedEventsAllTimeDesc[0]

        // Season specific match sorting
        if (displaySeason) {
            const seasonEvents = eventsWithDuration.filter(e => e.season_id === displaySeason.id)
            if (seasonEvents.length > 0) {
                const sortedSeasonEventsDesc = [...seasonEvents].sort((a, b) => b.durationMs - a.durationMs)

                longestMatchSeason = sortedSeasonEventsDesc[0]
            }
        }
    }


    return (
        <LeaderboardView
            currentUserId={user.id}
            allTimeProfiles={profilesWithChampion}
            seasons={seasons || []}
            activeSeason={activeSeason}
            displaySeason={displaySeason}
            seasonStandings={seasonStandings.map(p => ({ ...p, isChampion: championIds.has(p.id) }))}
            seasonAwardProfiles={seasonAwardProfiles.map(p => ({ ...p, isChampion: championIds.has(p.id) }))}
            hasAnySeason={hasAnySeason}
            seasonGamesPlayed={seasonGamesPlayed}
            longestMatchAllTime={longestMatchAllTime}
            longestMatchSeason={longestMatchSeason}
        />
    )
}
