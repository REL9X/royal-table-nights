import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, User, Trophy, Calendar, Flame, RefreshCcw, Star, Activity } from 'lucide-react'
import Link from 'next/link'
import PlayerName from '@/components/PlayerName'
import { getPlayerRank, PLAYER_RANKS } from '@/lib/playerRanks'
import CollapsibleBattles from './CollapsibleBattles'
import AchievementBadges from '@/components/AchievementBadges'

export default async function PublicProfilePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const playerId = params.id
    const supabase = await createClient()

    // 1. Fetch the target player
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', playerId)
        .single()

    if (!profile) return <div className="p-10 text-[var(--foreground)] text-center">Player not found</div>

    // 2. Fetch all completed sessions for this player - Sorted "Latest First"
    const { data: sessions } = await supabase
        .from('session_players')
        .select('*, events!inner(*)')
        .eq('player_id', playerId)
        .eq('events.status', 'completed')
        .order('events(date)', { ascending: false })
        .order('created_at', { ascending: false })

    const currentRank = getPlayerRank(profile.total_points || 0)

    // 3. Fetch total completed events for attendance calculation
    const { count: totalEventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

    const attendanceRate = totalEventsCount && totalEventsCount > 0
        ? Math.round(((profile.total_sessions_played || 0) / totalEventsCount) * 100)
        : 0

    const seasonWinsCount = Array.isArray(profile.championship_wins) ? profile.championship_wins.length : 0
    const isChampion = seasonWinsCount > 0

    const stats = [
        { label: 'Total Points', value: profile.total_points || 0, color: 'text-amber-400', icon: Trophy },
        { label: 'Sessions Played', value: profile.total_sessions_played || 0, color: 'text-zinc-300', icon: Calendar },
        { label: 'Season Wins', value: seasonWinsCount, color: 'text-amber-500', icon: Star },
        { label: 'Attendance', value: `${attendanceRate}%`, color: 'text-emerald-400', icon: Activity },
        { label: 'Biggest Win', value: `+${profile.biggest_win || 0}€`, color: 'text-emerald-400', icon: Flame },
        { label: 'Total Rebuys', value: profile.total_rebuys || 0, color: 'text-violet-400', icon: RefreshCcw },
    ]

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-25" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
                <div className="absolute bottom-[5%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-xl mx-auto px-4 pt-6 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/leaderboard" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-wider">Player</h1>
                        <p className="text-[var(--foreground-muted)] text-xs font-medium">Public Records</p>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="relative mb-6 rounded-[2rem] border border-[var(--border)] overflow-hidden shadow-2xl" style={{ background: 'var(--background-card)' }}>
                    {/* Decorative subtle background gradient */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                    <div className="relative p-6 z-10">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black overflow-hidden shrink-0 border-2 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-gradient-to-br from-amber-500/10 to-amber-500/5">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-amber-500">
                                            {profile.name?.[0]?.toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <PlayerName
                                        user={profile}
                                        isChampion={isChampion}
                                        championshipWins={profile.championship_wins}
                                        className="text-3xl font-black block text-[var(--foreground)] tracking-tight italic"
                                        showBadges={true}
                                    />
                                </div>
                            </div>

                            <div className="shrink-0">
                                <Link href="/ranks" className="block bg-white/[0.03] border border-amber-500/10 rounded-[1.5rem] p-3 shadow-xl backdrop-blur-md relative group transition-all hover:border-amber-500/30 cursor-pointer">
                                    <div className="flex items-center gap-3 pr-2">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-900/40 border border-amber-500/20 flex items-center justify-center text-2xl shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform">
                                            <span className="relative z-10 drop-shadow-md">{currentRank.icon}</span>
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(245,158,11,0.1)_0%,_transparent_70%)]" />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1 opacity-70">Rank</span>
                                            <span className="text-sm font-black text-[var(--foreground)] uppercase leading-none mb-1 tracking-tighter italic">{currentRank.title}</span>
                                            <span className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-widest leading-none">{profile.total_points || 0} XP</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Points XP bar */}
                        <div className="mb-4 px-1">
                            <div className="h-2 rounded-full bg-black/40 border border-white/5 p-0.5 overflow-hidden">
                                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)] transition-all duration-1000"
                                    style={{
                                        width: (() => {
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

                        {/* Stat Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-[var(--background-raised)] border border-[var(--border)] p-3 rounded-2xl flex items-center gap-3">
                                    <div className={`p-2 rounded-xl bg-[var(--background)] ${stat.color} border border-[var(--border)]`}>
                                        <stat.icon size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-[var(--foreground-muted)] mb-0.5">{stat.label}</p>
                                        <p className={`font-mono text-lg font-black ${stat.color}`}>{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Achievements */}
                <AchievementBadges wins={profile.championship_wins} className="mb-6" />

                {/* Recent Battles - Collapsible Wrapper */}
                <CollapsibleBattles sessions={sessions || []} />
            </div>
        </div>
    )
}
