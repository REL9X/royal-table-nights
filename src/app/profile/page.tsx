import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Target, Clock, Trophy, Zap, Star, ChevronLeft, Activity } from 'lucide-react'
import { ProfileForm } from './ProfileForm'
import PlayerName from '@/components/PlayerName'
import AchievementBadges from '@/components/AchievementBadges'
import { getPlayerRank, PLAYER_RANKS } from '@/lib/playerRanks'
import NotificationSettings from './NotificationSettings'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) return <div>Profile not found</div>

    // Fetch total completed events for attendance calculation
    const { count: totalEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

    const attendanceRate = totalEvents && totalEvents > 0
        ? Math.round(((profile.total_sessions_played || 0) / totalEvents) * 100)
        : 0

    const seasonWins = Array.isArray(profile.championship_wins) ? profile.championship_wins.length : 0

    const getROI = (p: any) => p.total_invested > 0 ? (Number(p.total_profit) / Number(p.total_invested)) * 100 : 0
    const profit = Number(profile.total_profit) || 0
    const points = profile.total_points || 0

    const statCards = [
        { label: 'Total Points', value: profile.total_points || 0, unit: 'pts', icon: Trophy, color: 'text-amber-500', bg: 'from-amber-500/20', border: 'border-amber-500/20' },
        { label: 'Games Played', value: profile.total_sessions_played || 0, unit: '', icon: Zap, color: 'text-sky-400', bg: 'from-sky-500/20', border: 'border-sky-500/20' },
        { label: 'Season Wins', value: seasonWins, unit: '', icon: Star, color: 'text-amber-400', bg: 'from-amber-400/20', border: 'border-amber-400/20' },
        { label: 'Attendance', value: attendanceRate, unit: '%', icon: Activity, color: 'text-emerald-400', bg: 'from-emerald-500/20', border: 'border-emerald-500/20' },
        { label: 'Biggest Win', value: `+${profile.biggest_win || 0}`, unit: '€', icon: Target, color: 'text-emerald-400', bg: 'from-emerald-800/20', border: 'border-emerald-900/30' },
        { label: 'Total Rebuys', value: profile.total_rebuys || 0, unit: '', icon: Clock, color: 'text-violet-400', bg: 'from-violet-500/20', border: 'border-violet-500/20' },
    ]

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-5%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-25" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
                <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-15" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-md mx-auto px-4 pt-6 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/dashboard" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                        <ChevronLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-wider">
                            <PlayerName user={profile} showBadges={true} />
                        </h1>
                        <p className="text-[var(--foreground-muted)] text-xs font-medium">Edit your profile & view career stats</p>
                    </div>
                </div>

                {/* Rank & Points Box */}
                <Link href="/ranks" className="block mb-5 bg-[var(--background-card)] border border-[var(--border)] rounded-2xl p-4 shadow-sm hover:border-amber-500/50 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[var(--background-raised)] border border-[var(--border)] flex items-center justify-center text-3xl shadow-inner pb-1 group-hover:scale-110 transition-transform">
                                {getPlayerRank(profile.total_points).icon}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest group-hover:text-amber-500 transition-colors">Current Rank</span>
                                <span className="text-lg font-black text-[var(--foreground)] tracking-wide">{getPlayerRank(profile.total_points).title}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest block group-hover:text-amber-500 transition-colors">Total XP</span>
                            <span className="text-xl font-black text-amber-500">{profile.total_points || 0}</span>
                        </div>
                    </div>

                    {/* Points XP bar */}
                    <div className="mt-2 px-1">
                        <div className="h-1.5 rounded-full bg-black/40 border border-white/5 p-0.5 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)] transition-all duration-1000"
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
                </Link>

                {/* Profile Form Card */}
                <div className="rounded-2xl border border-[var(--border)] overflow-hidden mb-5" style={{ background: 'var(--background-card)' }}>
                    <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #f59e0b, #0ea5e9)' }} />
                    <div className="p-5">
                        <ProfileForm initialName={profile.name} initialAvatarUrl={profile.avatar_url} />
                    </div>
                </div>

                {/* Achievements */}
                <AchievementBadges wins={profile.championship_wins} className="mb-6" />

                {/* Notification Settings */}
                <div className="mb-8">
                    <NotificationSettings 
                        initialPrefs={profile.notification_preferences || {
                            new_games: true,
                            season_results: true,
                            rank_ups: true,
                            reminders: true
                        }} 
                    />
                </div>

                {/* Stats */}
                <div>
                    <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-3 flex items-center gap-2">
                        <Trophy size={12} className="text-amber-500" /> Career Stats
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {statCards.map(({ label, value, unit, icon: Icon, color, bg, border }) => (
                            <div key={label} className={`rounded-2xl border ${border} p-4 relative overflow-hidden bg-gradient-to-br ${bg} to-transparent`}>
                                <Icon size={32} className={`absolute top-2 right-2 opacity-15 ${color}`} />
                                <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${color}`}>{label}</p>
                                <p className="font-black text-2xl text-[var(--foreground)]">
                                    {value}<span className="text-sm font-bold text-[var(--foreground-muted)] ml-0.5">{unit}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
