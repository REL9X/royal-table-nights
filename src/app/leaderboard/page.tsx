import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Crown, ArrowLeft, TrendingUp, TrendingDown, Target, Skull, Flame, RefreshCcw, Trophy, Zap, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import PlayerName from '@/components/PlayerName'

export default async function LeaderboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_approved', true)
        .order('total_points', { ascending: false })

    if (!profiles || profiles.length === 0) {
        return <div className="p-10 text-[var(--foreground)]">No players found</div>
    }

    const biggestWinPlayer = [...profiles].sort((a, b) => Number(b.biggest_win) - Number(a.biggest_win))[0]
    const biggestLossPlayer = [...profiles].sort((a, b) => Number(b.biggest_loss) - Number(a.biggest_loss))[0]
    const atmPlayer = [...profiles].sort((a, b) => Number(a.total_profit) - Number(b.total_profit))[0]
    const rebuyKing = [...profiles].sort((a, b) => (b.total_rebuys || 0) - (a.total_rebuys || 0))[0]
    const grinder = [...profiles].sort((a, b) => (b.total_sessions_played || 0) - (a.total_sessions_played || 0))[0]
    const getROI = (p: any) => p.total_invested > 0 ? (Number(p.total_profit) / Number(p.total_invested)) * 100 : 0
    const sharkPlayer = [...profiles].sort((a, b) => getROI(b) - getROI(a))[0]
    const maxPoints = profiles[0]?.total_points || 1

    const trophyCards = [
        { label: 'Biggest Win 💰', player: biggestWinPlayer, value: `+${biggestWinPlayer?.biggest_win}€`, color: 'from-emerald-600/30', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: TrendingUp },
        { label: 'Biggest Loss 💀', player: biggestLossPlayer, value: `-${biggestLossPlayer?.biggest_loss}€`, color: 'from-red-600/30', border: 'border-red-500/30', text: 'text-red-400', icon: TrendingDown },
        { label: 'Rebuy King 👑', player: rebuyKing, value: `${rebuyKing?.total_rebuys || 0} rebuys`, color: 'from-violet-600/30', border: 'border-violet-500/30', text: 'text-violet-400', icon: RefreshCcw },
        { label: 'The Shark 🦈', player: sharkPlayer, value: `${getROI(sharkPlayer).toFixed(1)}% ROI`, color: 'from-sky-600/30', border: 'border-sky-500/30', text: 'text-sky-400', icon: Target },
        { label: 'Grinder 🔥', player: grinder, value: `${grinder?.total_sessions_played || 0} games`, color: 'from-amber-600/30', border: 'border-amber-500/30', text: 'text-amber-400', icon: Flame },
        { label: 'The ATM 💸', player: atmPlayer, value: `${atmPlayer?.total_profit}€`, color: 'from-zinc-600/20', border: 'border-[var(--border)]', text: 'text-[var(--foreground-muted)]', icon: Skull },
    ]

    const medals = ['🥇', '🥈', '🥉']

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-25" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
                <div className="absolute bottom-[5%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-6 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                            <ChevronLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-wider">Rankings</h1>
                            <p className="text-[var(--foreground-muted)] text-xs font-medium">Season 1 · {profiles.length} Players</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 bg-[var(--background-card)] border border-[var(--border)] rounded-full p-1">
                        <button className="bg-amber-500 text-black text-xs font-black px-4 py-1.5 rounded-full">Season</button>
                        <button className="text-[var(--foreground-subtle)] text-xs font-bold px-4 py-1.5 hover:text-[var(--foreground)] transition-colors">All-Time</button>
                    </div>
                </div>

                {/* Trophy Cards */}
                <div className="mb-6">
                    <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-3 flex items-center gap-2">
                        <Zap size={12} className="text-amber-500" /> Special Awards
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {trophyCards.map(({ label, player, value, color, border, text, icon: Icon }) => (
                            <div key={label} className={`bg-gradient-to-br ${color} to-transparent border ${border} p-4 rounded-2xl relative overflow-hidden`}>
                                <Icon className={`absolute top-2 right-2 opacity-20 ${text}`} size={36} />
                                <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${text}`}>{label}</p>
                                <PlayerName user={player} isClickable={true} className="font-black text-sm text-[var(--foreground)] truncate block" />
                                <p className={`font-mono text-xs font-bold mt-0.5 ${text}`}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Points explainer */}
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl px-4 py-3 mb-4 flex items-center gap-3">
                    <Trophy size={16} className="text-amber-500 shrink-0" />
                    <p className="text-xs text-[var(--foreground-muted)]">
                        <strong className="text-amber-500">+10 pts</strong> per game · <strong className="text-amber-500">+1 pt</strong>/€ profit · <strong className="text-amber-500">+10/+5</strong> bonus for 1st/2nd place
                    </p>
                </div>

                {/* Rankings table */}
                <div className="rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl" style={{ background: 'var(--background-card)' }}>
                    <div className="px-4 py-3 border-b border-[var(--border)] flex text-[10px] font-black text-[var(--foreground-subtle)] uppercase tracking-wider">
                        <div className="w-10 text-center">Rank</div>
                        <div className="flex-1 ml-3">Player</div>
                        <div className="w-20 text-right">Profit</div>
                        <div className="w-16 text-right text-amber-500">PTS</div>
                    </div>

                    {profiles.map((player, index) => {
                        const isMe = player.id === user.id
                        const profit = Number(player.total_profit)
                        const points = player.total_points || 0
                        const isFirst = index === 0
                        const barW = Math.round((points / maxPoints) * 100)

                        return (
                            <div key={player.id} className={`px-4 py-3.5 flex items-center border-b border-[var(--border)] last:border-0 transition-colors ${isMe ? 'bg-amber-500/5 border-l-2 border-l-amber-500' : 'hover:bg-[var(--background-raised)]'} ${isFirst ? 'bg-amber-500/3' : ''}`}>
                                <div className="w-10 text-center shrink-0 text-base">
                                    {index < 3 ? medals[index] : <span className="text-sm font-black text-[var(--foreground-subtle)]">{index + 1}</span>}
                                </div>

                                <div className="flex-1 flex items-center gap-3 ml-3 min-w-0">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black overflow-hidden shrink-0 border ${isFirst ? 'border-amber-500/50' : 'border-[var(--border)]'}`}
                                        style={{ background: isFirst ? 'rgba(245,158,11,0.15)' : 'var(--background-raised)' }}>
                                        {player.avatar_url ? <img src={player.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className={isFirst ? 'text-amber-500' : 'text-[var(--foreground-muted)]'}>{player.name?.[0]?.toUpperCase()}</span>}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <PlayerName user={player} isClickable={true} className={`font-black text-sm truncate ${isFirst ? 'text-amber-500' : 'text-[var(--foreground)]'}`} />
                                            {isMe && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full font-black shrink-0">YOU</span>}
                                        </div>
                                        <div className="mt-0.5 h-1 rounded-full bg-[var(--border)] overflow-hidden w-full">
                                            <div className="h-full rounded-full" style={{ width: `${barW}%`, background: isFirst ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : index === 1 ? 'linear-gradient(90deg,#94a3b8,#cbd5e1)' : index === 2 ? '#b45309' : 'var(--border-strong)' }} />
                                        </div>
                                    </div>
                                </div>

                                <div className={`w-20 text-right font-mono font-black text-sm ${profit > 0 ? 'text-emerald-500' : profit < 0 ? 'text-red-500' : 'text-[var(--foreground-subtle)]'}`}>
                                    {profit > 0 ? '+' : ''}{profit.toFixed(0)}€
                                </div>
                                <div className="w-16 text-right">
                                    <span className={`inline-block font-black text-sm px-2 py-1 rounded-lg ${isFirst ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'text-[var(--foreground)] bg-[var(--background-raised)] border border-[var(--border)]'}`}>
                                        {points}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
