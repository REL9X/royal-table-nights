import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Crown, LogOut, CheckCircle, Calendar, MapPin, DollarSign, Download, Spade, Heart, Club, Diamond, Trophy, Zap, Star, Shield, ChevronRight, Settings, Activity, Target } from 'lucide-react'
import { submitRsvp } from './actions'
import { finishSeason } from '@/app/admin/seasons/actions'
import { startSession } from '@/app/admin/events/actions'
import Link from 'next/link'
import PlayerName from '@/components/PlayerName'
import ThemeToggle from '@/components/ThemeToggle'
import ConfirmActionForm from '@/components/ConfirmActionForm'
import SeasonCard from './SeasonCard'
import { getPlayerRank, PLAYER_RANKS } from '@/lib/playerRanks'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import RsvpButton from './RsvpButton'
import RankUpNotifier from './RankUpNotifier'
import EventRealtimeNotifier from './EventRealtimeNotifier'
import fs from 'fs'

const log = (msg: string) => {
    try {
        fs.appendFileSync('c:/Users/berna/.gemini/antigravity/scratch/royal-table-nights/dash_debug.log', `[${new Date().toISOString()}] ${msg}\n`)
    } catch (e) { }
}

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
    log('--- Dashboard Start ---')
    const supabase = await createClient()
    log('Supabase client created')

    const { data: { user } } = await supabase.auth.getUser()
    log(`User fetch: ${user?.id || 'no user'}`)
    if (!user) redirect('/login')

    try {
        log('Fetching profile...')
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        log(`Profile fetched: ${profile?.name || 'none'}`)

        if (!profile) return <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8 flex items-center justify-center font-black uppercase tracking-widest text-sm italic">Profile not found...</div>

        if (!profile.is_approved && profile.role !== 'admin') {
            log('User not approved, rendering approval screen')
            // ... (rest remains same)
        }

        log('Starting parallel fetch...')
        // Fetch core data in parallel
        const [
            { data: allSeasons },
            { data: allProfilesForRank },
            { data: profiles }
        ] = await Promise.all([
            supabase.from('seasons').select('*').order('created_at', { ascending: false }),
            supabase.from('profiles').select('id, total_points').order('total_points', { ascending: false }),
            supabase.from('profiles').select('id, name, avatar_url, role').eq('is_approved', true)
        ])
        log(`Parallel fetch done. Seasons: ${allSeasons?.length}, Profiles: ${profiles?.length}`)

        const activeSeason = allSeasons?.find(s => s.status === 'active') || allSeasons?.[0] || null
        log(`Active season: ${activeSeason?.name}`)

        const myRank = (allProfilesForRank?.findIndex(p => p.id === user.id) ?? -1) + 1
        const completedSeasons = allSeasons?.filter(s => s.status === 'completed') || []

        // Helper to get season rankings for any season
        const getSeasonRankings = async (seasonId: string) => {
            log(`Fetching rankings for ${seasonId}...`)
            const { data: sPointsData } = await supabase
                .from('session_players')
                .select('player_id, points_earned, events!inner(season_id, status)')
                .eq('events.season_id', seasonId)
                .eq('events.status', 'completed')
            log(`Rankings for ${seasonId} fetched. Rows: ${sPointsData?.length}`)

            const sMap: Record<string, { points: number, games: number }> = {}
            sPointsData?.forEach((sp: any) => {
                if (!sMap[sp.player_id]) sMap[sp.player_id] = { points: 0, games: 0 }
                sMap[sp.player_id].points += (sp.points_earned || 0)
                sMap[sp.player_id].games += 1
            })
            return Object.entries(sMap).sort((a, b) => b[1].points - a[1].points)
        }

        log('Calculating champions...')
        // Champions calculation
        const champions: string[] = []
        if (completedSeasons.length > 0) {
            const allRankings = await Promise.all(completedSeasons.map(s => getSeasonRankings(s.id)))
            allRankings.forEach(rankings => {
                if (rankings[0]) champions.push(rankings[0][0])
            })
        }
        const isSeasonChampion = champions.includes(user.id)
        log(`Champions calc done. Count: ${champions.length}`)

        // Determine winner for current season if completed
        let seasonWinner = null
        if (activeSeason?.status === 'completed') {
            const rankings = await getSeasonRankings(activeSeason.id)
            if (rankings[0]) {
                const winnerProfile = profiles?.find(p => p.id === rankings[0][0])
                if (winnerProfile) {
                    seasonWinner = {
                        ...winnerProfile,
                        seasonStats: rankings[0][1] // { points, games }
                    }
                }
            }
        }

        // Standings calculation
        let leaderboardPlayers: any[] = []
        let maxPoints = 1
        let leaderboardTitle = "All-Time Standings"
        let mySeasonRank: number | null = null

        if (activeSeason) {
            leaderboardTitle = `${activeSeason.name} Standings`
            const { data: seasonPointsData } = await supabase
                .from('session_players')
                .select('player_id, points_earned, events!inner(season_id, status)')
                .eq('events.season_id', activeSeason.id)
                .eq('events.status', 'completed')

            const pointsMap: Record<string, number> = {}
            seasonPointsData?.forEach((sp: any) => {
                pointsMap[sp.player_id] = (pointsMap[sp.player_id] || 0) + (sp.points_earned || 0)
            })

            const seasonalStandings = (profiles || [])
                .map(p => ({
                    ...p,
                    display_points: pointsMap[p.id] || 0,
                    isChampion: champions.includes(p.id)
                }))
                .sort((a, b) => b.display_points - a.display_points)

            leaderboardPlayers = seasonalStandings.slice(0, 3)
            maxPoints = Math.max(...(Object.values(pointsMap) as number[]).map(v => Number(v)), 1)

            const sIdx = seasonalStandings.findIndex(p => p.id === user.id)
            if (sIdx !== -1) mySeasonRank = sIdx + 1
        } else {
            leaderboardPlayers = (profiles || [])
                .sort((a, b) => {
                    const pA = allProfilesForRank?.find(p => p.id === a.id)?.total_points || 0
                    const pB = allProfilesForRank?.find(p => p.id === b.id)?.total_points || 0
                    return pB - pA
                })
                .slice(0, 3)
                .map(p => ({
                    ...p,
                    display_points: allProfilesForRank?.find(pr => pr.id === p.id)?.total_points || 0,
                    isChampion: champions.includes(p.id)
                }))
            maxPoints = leaderboardPlayers[0]?.display_points || 1
        }

        // Metrics for the Season Card
        let seasonGamesPlayed = 0
        let avgAttendance = 0
        let attendanceRate = 0
        let avgPot = 0
        let avgDuration = 0
        let avgRebuys = 0
        const profileCount = profiles?.length || 1

        if (activeSeason) {
            const { data: sEvents, count: sCount } = await supabase
                .from('events')
                .select('id, started_at, ended_at, session_players(player_id, rebuys, total_invested)', { count: 'exact' })
                .eq('season_id', activeSeason.id)
                .eq('status', 'completed')

            seasonGamesPlayed = sCount || 0
            if (seasonGamesPlayed > 0) {
                const totalAttendance = sEvents?.reduce((sum, e) => sum + (Array.isArray(e.session_players) ? e.session_players.length : 0), 0) || 0
                avgAttendance = totalAttendance / seasonGamesPlayed
                attendanceRate = Math.round((avgAttendance / (profileCount || 1)) * 100)

                // Pot, Duration, Rebuys
                let totalPot = 0
                let totalDurationMs = 0
                let totalRebuys = 0
                let eventsWithDuration = 0

                sEvents?.forEach(e => {
                    const sps = Array.isArray(e.session_players) ? e.session_players : []
                    totalPot += sps.reduce((sum, sp) => sum + (sp.total_invested || 0), 0)
                    totalRebuys += sps.reduce((sum, sp) => sum + (sp.rebuys || 0), 0)

                    if (e.started_at && e.ended_at) {
                        totalDurationMs += new Date(e.ended_at).getTime() - new Date(e.started_at).getTime()
                        eventsWithDuration++
                    }
                })

                avgPot = Math.round(totalPot / seasonGamesPlayed)
                avgRebuys = Number((totalRebuys / seasonGamesPlayed).toFixed(1))
                if (eventsWithDuration > 0) {
                    avgDuration = Math.round(totalDurationMs / eventsWithDuration / (1000 * 60)) // average minutes
                }
            }
        }

        const { data: recentSessions } = await supabase
            .from('session_players')
            .select('placement, profit, events!inner(date, status)')
            .eq('player_id', user.id)
            .eq('events.status', 'completed')
            .order('events(date)', { ascending: false })
            .limit(5)

        const recentForm = (recentSessions || []).map((s: any) => {
            if (s.placement === 1) return '🥇'
            if (s.placement === 2) return '🥈'
            if (s.placement === 3) return '🥉'
            if (Number(s.profit) > 0) return '💵'
            return '💀'
        }).reverse()


        return (
            <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden"
                style={{ background: 'var(--background)' }}>

                {/* Animated background blobs */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-30"
                        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
                    <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-20"
                        style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
                    <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-15"
                        style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />
                </div>

                <div className="max-w-md mx-auto relative z-10 px-4 pt-6">
                    <RealtimeRefresher table="events" />
                    <RealtimeRefresher table="profiles" filter={`id=eq.${user.id}`} />
                    <RankUpNotifier 
                        currentPoints={profile.total_points || 0} 
                        enabled={profile.notification_preferences?.rank_ups ?? true}
                    />
                    <EventRealtimeNotifier preferences={profile.notification_preferences} />

                    {/* ── TOP NAV ── */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.5)]">
                                <Crown size={18} className="text-black" />
                            </div>
                            <span className="font-black text-lg tracking-wider text-[var(--foreground)] uppercase">Royal Table</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <Link href="/settings" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-amber-500 transition-colors">
                                <Settings size={16} />
                            </Link>
                            {profile.role === 'admin' && (
                                <Link href="/admin" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-amber-500 hover:bg-amber-500/10 transition-colors">
                                    <Shield size={16} />
                                </Link>
                            )}
                            <form action={async () => { 'use server'; const s = await createClient(); await s.auth.signOut(); redirect('/login') }}>
                                <button type="submit" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                                    <LogOut size={16} />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ── PLAYER CARD ── */}
                    <Link href="/profile" className="block mb-5 group">
                        <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/30 group-hover:border-amber-500/60 transition-all shadow-[0_4px_32px_rgba(0,0,0,0.3)]"
                            style={{ background: 'var(--background-card)' }}>
                            {/* Gold shimmer top bar */}
                            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #f59e0b, #0ea5e9, #f59e0b, #7c3aed)', backgroundSize: '200% 100%' }} />

                            <div className="p-5">
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className="w-20 h-20 rounded-2xl border-3 border-amber-500/50 overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.3)] bg-[var(--background-raised)] flex items-center justify-center"
                                            style={{ borderWidth: 3 }}>
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl font-black text-amber-500">{profile.name?.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        {/* All-time Rank badge */}
                                        {myRank > 0 && (
                                            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.6)] border-2 border-[var(--background-card)]">
                                                <span className="text-[10px] font-black text-black">#{myRank}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Name + stats */}
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-xl font-black text-[var(--foreground)] truncate mb-2 flex items-center gap-2">
                                            <PlayerName
                                                user={profile}
                                                totalPoints={profile.total_points}
                                                showRankIcon={true}
                                                isClickable={false}
                                                isChampion={isSeasonChampion || (profile.championship_badges_count || 0) > 0}
                                                championshipWins={profile.championship_wins}
                                                showBadges={true}
                                            />
                                        </h1>
                                        <div className="flex gap-1.5">
                                            <div className="flex flex-col items-center justify-center bg-gradient-to-b from-amber-400 to-amber-600 px-2.5 py-1 rounded-lg shadow-[0_3px_0_rgb(180,83,9)] border border-amber-300/30">
                                                <span className="text-[6px] font-black text-amber-900 uppercase tracking-widest leading-none mb-0.5">Season</span>
                                                <span className="text-[10px] font-black text-white leading-none">#{mySeasonRank || '—'}</span>
                                            </div>
                                            <div className="flex flex-col items-center justify-center bg-gradient-to-b from-slate-400 to-slate-600 px-2.5 py-1 rounded-lg shadow-[0_3px_0_rgb(71,85,105)] border border-slate-300/30">
                                                <span className="text-[6px] font-black text-slate-900 uppercase tracking-widest leading-none mb-0.5">Global</span>
                                                <span className="text-[10px] font-black text-white leading-none">#{myRank || '—'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Points XP bar */}
                                <div className="mt-5">
                                    <div className="flex justify-between items-end mb-1 px-1">
                                        <span className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest flex items-center gap-1.5">
                                            <span className="text-sm">{getPlayerRank(profile.total_points).icon}</span>
                                            {getPlayerRank(profile.total_points).title}
                                        </span>
                                        <span className="text-sm font-black text-amber-500">{profile.total_points || 0} XP</span>
                                    </div>
                                    <div className="h-4 rounded-full bg-[var(--background-raised)] border border-[var(--border)] p-0.5 overflow-hidden">
                                        <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all duration-1000"
                                            style={{
                                                width: (() => {
                                                    const currentRank = getPlayerRank(profile.total_points);
                                                    const currentIdx = PLAYER_RANKS.findIndex(r => r.minPoints === currentRank.minPoints);
                                                    const nextRank = currentIdx > 0 ? PLAYER_RANKS[currentIdx - 1] : null;

                                                    if (!nextRank) return '100%';
                                                    const range = nextRank.minPoints - currentRank.minPoints;
                                                    const progress = (profile.total_points || 0) - currentRank.minPoints;
                                                    return `${Math.min(100, Math.max(0, Math.round((progress / range) * 100)))}%`;
                                                })()
                                            }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* ── CURRENT SEASON SECTION ── */}
                    {activeSeason && (
                        <SeasonCard
                            activeSeason={activeSeason}
                            profile={profile}
                            seasonGamesPlayed={seasonGamesPlayed}
                            seasonWinner={seasonWinner}
                            profileCount={profileCount}
                            attendanceRate={attendanceRate}
                            topThree={leaderboardPlayers}
                            avgPot={avgPot}
                            avgDuration={avgDuration}
                            avgRebuys={avgRebuys}
                        />
                    )}


                    {/* ── NEXT EVENT ── */}
                    <div className="mb-5">
                        <EventsList userId={user.id} userRole={profile.role} />
                    </div>

                    {/* ── QUICK LINKS ── */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        {[
                            { href: '/leaderboard', icon: Trophy, label: 'Leaderboard', color: 'from-amber-500/20 to-amber-700/10', border: 'border-amber-500/20', iconColor: 'text-amber-500' },
                            { href: '/history', icon: Star, label: 'History', color: 'from-sky-500/20 to-sky-700/10', border: 'border-sky-500/20', iconColor: 'text-sky-400' },
                            { href: '/profile', icon: Shield, label: 'Profile', color: 'from-slate-500/20 to-slate-700/10', border: 'border-slate-500/20', iconColor: 'text-slate-400' },
                        ].map(({ href, icon: Icon, label, color, border, iconColor }) => (
                            <Link key={href} href={href} className={`flex flex-col items-center gap-2.5 py-5 px-2 rounded-2xl border bg-gradient-to-b ${color} ${border} hover:scale-105 transition-all active:scale-95`}>
                                <Icon size={26} className={iconColor} />
                                <span className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-wide text-center leading-tight">{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Card suits decoration */}
                <div className="flex justify-center gap-5 text-[var(--foreground-subtle)] mb-4 opacity-40">
                    <Spade size={14} /><Heart size={14} className="text-red-500/60" /><Club size={14} /><Diamond size={14} className="text-red-500/60" />
                </div>
            </div>
        )
    } catch (error) {
        console.error('Dashboard Error:', error)
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 text-center">
                <div className="max-w-xs">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <Activity className="text-red-500 w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tight mb-2">Technical Fault</h2>
                    <p className="text-[var(--foreground-muted)] text-sm mb-6">Something tripped at the table. We&apos;re looking into it.</p>
                    <Link href="/dashboard" className="inline-block px-6 py-3 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[var(--background-raised)] transition-all">
                        Try Again
                    </Link>
                </div>
            </div>
        )
    }
}

async function EventsList({ userId, userRole }: { userId: string, userRole?: string }) {
    log('EventsList Start')
    const supabase = await createClient()
    log('EventsList: Client created')
    const { data: events } = await supabase
        .from('events')
        .select(`*, event_responses (*), seasons (name, max_games)`)
        .in('status', ['upcoming', 'active'])
        .order('date', { ascending: true })
    log(`EventsList: Events fetched. Count: ${events?.length}`)

    // To determine the game number (e.g., 2/10), we need to count all events 
    // in that season that happened before or at the same time as this one.
    // We'll fetch all event counts for the seasons involved.
    const seasonIds = Array.from(new Set(events?.filter(e => e.season_id).map(e => e.season_id) || []))

    const seasonEventCounts: Record<string, number> = {}
    if (seasonIds.length > 0) {
        // Fetch all events for the relevant seasons in one go
        const { data: allSeasonEvents } = await supabase
            .from('events')
            .select('id, season_id')
            .in('season_id', seasonIds)
            .order('date', { ascending: true })
            .order('created_at', { ascending: true })

        if (allSeasonEvents) {
            // Group by season and count
            const counts: Record<string, number> = {}
            allSeasonEvents.forEach(se => {
                if (!se.season_id) return
                counts[se.season_id] = (counts[se.season_id] || 0) + 1
                seasonEventCounts[se.id] = counts[se.season_id]
            })
        }
    }

    const EmptyState = () => (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-4 text-center bg-[var(--background-card)]/50 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em] flex items-center gap-1.5 leading-none">
                    <Zap size={12} className="text-emerald-500" /> Next Event
                </h3>
                {userRole === 'admin' && (
                    <Link href="/admin/events/new" className="text-emerald-500 text-[10px] font-black flex items-center gap-1 uppercase tracking-widest hover:opacity-80 transition-all leading-none">
                        + New <ChevronRight size={10} />
                    </Link>
                )}
            </div>
            <div className="flex flex-col items-center gap-1 py-1">
                <p className="text-[var(--foreground-subtle)] text-[10px] font-black uppercase tracking-widest opacity-60">No battles scheduled</p>
                <Link href="/history" className="text-[9px] font-bold text-amber-500/80 hover:text-amber-500 transition-colors uppercase tracking-tight">View Past Games →</Link>
            </div>
        </div>
    )

    if (!events || events.length === 0) return <EmptyState />

    return (
        <div className="flex flex-col gap-3">
            <div className="px-1 flex justify-between items-center mb-1">
                <h3 className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <Zap size={12} className="text-emerald-500" /> Next Event
                </h3>
                {userRole === 'admin' && (
                    <Link href="/admin/events/new" className="text-emerald-500 text-[10px] font-black flex items-center gap-1 uppercase tracking-widest hover:opacity-80 transition-all">
                        + New <ChevronRight size={10} />
                    </Link>
                )}
            </div>
            {events.map((event) => {
                const myResponse = event.event_responses?.find((r: { player_id: string }) => r.player_id === userId)
                const isAttending = myResponse?.status === 'accepted'
                const isActive = event.status === 'active'

                return (
                    <div key={event.id} className={`relative rounded-2xl overflow-hidden border-2 transition-all ${isActive ? 'border-emerald-500/50 shadow-[0_0_24px_rgba(16,185,129,0.15)]' : isAttending ? 'border-amber-500/30 shadow-[0_0_16px_rgba(245,158,11,0.1)]' : 'border-[var(--border)]'}`}
                        style={{ background: 'var(--background-card)' }}>

                        {/* Active session glow bar */}
                        {isActive && <div className="h-1 w-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
                        {!isActive && isAttending && <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#f59e0b,#fbbf24)' }} />}

                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-black text-base text-[var(--foreground)] pr-2 leading-tight">{event.title}</h3>
                                    <div className="mt-1 flex items-center gap-2">
                                        {event.season_id ? (
                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                                {event.seasons?.name} — Game {seasonEventCounts[event.id] || '?'}/{event.seasons?.max_games || 10}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-wider bg-sky-400/10 px-2 py-0.5 rounded-md border border-sky-400/20">
                                                Off-Season Tournament
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {isActive ? (
                                    <span className="shrink-0 text-[10px] font-black bg-emerald-500 text-black px-2 py-1 rounded-full uppercase tracking-wider animate-pulse mt-1">● LIVE</span>
                                ) : isAttending ? (
                                    <span className="shrink-0 text-[10px] font-black bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2 py-1 rounded-full uppercase tracking-wider mt-1">✓ In</span>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs text-[var(--foreground-muted)] mb-4">
                                <span className="flex items-center gap-1.5"><Calendar size={11} className="text-amber-500" />{new Date(event.date).toLocaleDateString()} · {event.time}</span>
                                {event.location && <span className="flex items-center gap-1.5"><MapPin size={11} />{event.location}</span>}
                                <span className="flex items-center gap-1.5"><DollarSign size={11} className="text-emerald-500" /><strong className="text-emerald-500">{event.buy_in_amount}€</strong> buy-in</span>
                            </div>

                            <div className="flex gap-2">
                                {isActive ? (
                                    <Link href={`/session/${event.id}`} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-black text-sm text-center flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_16_rgba(16,185,129,0.4)]">
                                        <Crown size={15} /> Enter Table
                                    </Link>
                                ) : (
                                    <>
                                        {userRole === 'admin' && event.status === 'upcoming' && (
                                            <form action={async () => { 'use server'; await startSession(event.id) }} className="flex-1">
                                                <button type="submit" className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-black text-sm text-center flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_16px_rgba(16,185,129,0.3)] border border-emerald-400/20">
                                                    <Zap size={15} /> Go Live
                                                </button>
                                            </form>
                                        )}
                                        <RsvpButton 
                                            eventId={event.id}
                                            eventTitle={event.title}
                                            eventDate={event.date}
                                            isAttending={isAttending}
                                        />
                                    </>
                                )}
                                <Link href={`/api/calendar?id=${event.id}`} className="px-3 py-2.5 bg-[var(--background-raised)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors flex items-center justify-center">
                                    <Download size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
