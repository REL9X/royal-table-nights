import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, User, Trophy, Calendar, TrendingUp, TrendingDown, Target, RefreshCcw, Flame } from 'lucide-react'
import Link from 'next/link'
import PlayerName from '@/components/PlayerName'

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

    // 2. Fetch all completed sessions for this player
    const { data: sessions } = await supabase
        .from('session_players')
        .select('*, events!inner(*)')
        .eq('player_id', playerId)
        .eq('events.status', 'completed')
        .order('events(date)', { ascending: false })

    const totalProfit = Number(profile.total_profit)
    const isProfitable = totalProfit > 0
    const isDinger = totalProfit < 0
    const roi = profile.total_invested > 0 ? (totalProfit / Number(profile.total_invested)) * 100 : 0

    const stats = [
        { label: 'Total Profit', value: `${totalProfit > 0 ? '+' : ''}${totalProfit.toFixed(1)}€`, color: isProfitable ? 'text-emerald-400' : isDinger ? 'text-red-400' : 'text-zinc-400', icon: isProfitable ? TrendingUp : TrendingDown },
        { label: 'Total Points', value: profile.total_points || 0, color: 'text-amber-400', icon: Trophy },
        { label: 'Sessions Played', value: profile.total_sessions_played || 0, color: 'text-zinc-300', icon: Calendar },
        { label: 'Win Rate (ROI)', value: `${roi.toFixed(1)}%`, color: 'text-sky-400', icon: Target },
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
                        <h1 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-wider">Combatant</h1>
                        <p className="text-[var(--foreground-muted)] text-xs font-medium">Public Records</p>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="relative mb-6 rounded-[2rem] border border-[var(--border)] overflow-hidden shadow-2xl" style={{ background: 'var(--background-card)' }}>
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <User size={120} />
                    </div>

                    <div className="relative p-6 z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black overflow-hidden shrink-0 border-2 border-amber-500/50"
                                style={{ background: 'rgba(245,158,11,0.15)' }}>
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-amber-500">
                                        {profile.name?.[0]?.toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <PlayerName user={profile} className="text-2xl font-black block text-[var(--foreground)]" />
                                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    {profile.role === 'admin' ? 'Game Master' : 'Player'}
                                </span>
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

                {/* Recent Battles */}
                <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-3 flex items-center gap-2">
                    <Flame size={12} className="text-amber-500" /> Recent Battles
                </h2>

                <div className="space-y-3">
                    {sessions && sessions.length > 0 ? (
                        sessions.slice(0, 10).map((session: any) => {
                            const eventProfit = Number(session.profit)
                            const isWin = eventProfit > 0
                            return (
                                <Link
                                    key={session.id}
                                    href={`/history/${session.event_id}`}
                                    className="bg-[var(--background-card)] hover:bg-[var(--background-raised)] border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between transition-colors shadow-lg group"
                                >
                                    <div>
                                        <p className="font-bold text-sm text-[var(--foreground)] group-hover:text-amber-500 transition-colors">{session.events.title}</p>
                                        <p className="text-xs text-[var(--foreground-subtle)] font-medium mt-0.5">
                                            {new Date(session.events.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-mono font-black text-sm ${isWin ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {isWin ? '+' : ''}{eventProfit.toFixed(0)}€
                                        </p>
                                        <p className="text-[10px] font-bold text-[var(--foreground-subtle)] mt-0.5 uppercase tracking-wider">
                                            Rank {session.placement || '-'}
                                        </p>
                                    </div>
                                </Link>
                            )
                        })
                    ) : (
                        <div className="text-center p-6 bg-[var(--background-card)] rounded-2xl border border-[var(--border)]">
                            <p className="text-sm font-bold text-[var(--foreground-muted)]">No battles fought yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
