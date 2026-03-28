'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Crown, TrendingUp, Star, Target, Cpu, Flame, RefreshCcw, Trophy, Zap, ChevronLeft, Timer, Snail, Hourglass, Zap as FastIcon, ZapOff, Activity, ChevronDown, X, History } from 'lucide-react'
import PlayerName from '@/components/PlayerName'

export default function LeaderboardView({
    currentUserId,
    allTimeProfiles,
    seasons,
    activeSeason,
    displaySeason,
    seasonStandings,
    seasonAwardProfiles,
    hasAnySeason,
    seasonGamesPlayed,
    longestMatchAllTime,
    longestMatchSeason,
}: {
    currentUserId: string
    allTimeProfiles: any[]
    seasons: any[]
    activeSeason: any | null
    displaySeason: any | null
    seasonStandings: any[]
    seasonAwardProfiles: any[]
    hasAnySeason: boolean
    seasonGamesPlayed: number
    longestMatchAllTime?: any
    longestMatchSeason?: any
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [view, setView] = useState<'season' | 'alltime'>(hasAnySeason ? 'season' : 'alltime')
    const [isSelectorOpen, setIsSelectorOpen] = useState(false)

    const selectedSeasonId = displaySeason?.id || ''

    const medals = ['🥇', '🥈', '🥉']

    // Determine which list + which points field to display
    const isSeasonView = view === 'season'
    const displayList = isSeasonView ? seasonStandings : allTimeProfiles
    const maxPoints = displayList.reduce((m, p) => Math.max(m, isSeasonView ? (p.season_points || 0) : (p.total_points || 0)), 1)

    // Award cards — strict separation: season awards ONLY from season events, all-time from everything
    const hasSeasonData = seasonAwardProfiles.length > 0
    const awardSource = isSeasonView ? seasonAwardProfiles : allTimeProfiles
    const showAwards = !isSeasonView || hasSeasonData
    const getROI = (p: any) => p && Number(p.total_invested) > 0 ? (Number(p.total_profit) / Number(p.total_invested)) * 100 : 0
    const sorted = awardSource
    const biggestWin = [...sorted].sort((a, b) => Number(b.biggest_win) - Number(a.biggest_win))[0]
    const rebuyKing = [...sorted].sort((a, b) => (b.total_rebuys || 0) - (a.total_rebuys || 0))[0]
    const shark = [...sorted].sort((a, b) => getROI(b) - getROI(a))[0]

    // Timing awards from pre-aggregated props (which have .fastest_bust_min etc)
    const fastBustList = sorted.filter((p: any) => typeof p.fastest_bust_min === 'number' && p.fastest_bust_min !== Infinity)
    const fastBust = fastBustList.length > 0 ? fastBustList.sort((a: any, b: any) => a.fastest_bust_min - b.fastest_bust_min)[0] : null

    const fastRebuyList = sorted.filter((p: any) => typeof p.fastest_rebuy_min === 'number' && p.fastest_rebuy_min !== Infinity)
    const fastRebuy = fastRebuyList.length > 0 ? fastRebuyList.sort((a: any, b: any) => a.fastest_rebuy_min - b.fastest_rebuy_min)[0] : null

    const longestMatch = isSeasonView ? longestMatchSeason : longestMatchAllTime

    const formatDuration = (mins: number) => {
        if (!mins && mins !== 0) return '—'
        const totalSeconds = Math.floor(mins * 60)
        const h = Math.floor(totalSeconds / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        const s = totalSeconds % 60

        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const awardScopeLabel = isSeasonView ? 'Season Awards' : 'All-Time Awards'

    const trophyCards = [
        { label: 'Biggest Win 💰', player: biggestWin, value: biggestWin ? `+${biggestWin.biggest_win}€` : '—', color: 'from-emerald-600/30', border: 'border-emerald-500/30', text: 'text-emerald-400', icon: TrendingUp },
        { label: 'Longest Match ⏳', player: null, isEvent: true, title: longestMatch?.title, value: formatDuration(longestMatch?.durationMinutes), color: 'from-fuchsia-600/30', border: 'border-fuchsia-500/30', text: 'text-fuchsia-400', icon: Hourglass },
        { label: 'The Shark 🦈', player: shark, value: shark ? `Top ROI` : '—', color: 'from-sky-600/30', border: 'border-sky-500/30', text: 'text-sky-400', icon: Target },
        { label: 'Fastest Bust ⏱️', player: fastBust, value: fastBust ? formatDuration(fastBust.fastest_bust_min) : '—', color: 'from-red-600/30', border: 'border-red-500/30', text: 'text-red-400', icon: FastIcon },
        { label: 'Rebuy King 👑', player: rebuyKing, value: rebuyKing ? `${rebuyKing.total_rebuys || 0} rebuys` : '—', color: 'from-violet-600/30', border: 'border-violet-500/30', text: 'text-violet-400', icon: RefreshCcw },
        { label: 'Fastest Rebuy 🏎️', player: fastRebuy, value: fastRebuy ? formatDuration(fastRebuy.fastest_rebuy_min) : '—', color: 'from-orange-600/30', border: 'border-orange-500/30', text: 'text-orange-400', icon: Timer },
    ]

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-25" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
                <div className="absolute bottom-[5%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-6 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <Link href="/dashboard" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                        <ChevronLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="font-heading font-black text-4xl text-[var(--foreground)] uppercase tracking-tight leading-none">
                            {isSeasonView ? `Season ${displaySeason?.name || ''}` : 'Standings'}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="bg-amber-500 px-2 py-0.5 rounded-lg shadow-[0_2px_0_rgb(180,83,9)]">
                                <span className="text-[10px] font-black text-amber-950 uppercase tracking-widest">
                                    {isSeasonView ? `Game ${seasonGamesPlayed}/${displaySeason?.max_games}` : 'All-Time'}
                                </span>
                            </div>
                            <div className="bg-white/10 px-2 py-0.5 rounded-lg border border-white/5">
                                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{displayList.length} Players</span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Season / All-Time Tab Bar */}
                <div className="flex mb-5 bg-[var(--background-card)] border border-[var(--border)] rounded-xl p-0.5 gap-0.5">
                    <button
                        onClick={() => setView('season')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${view === 'season'
                            ? 'bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                            : 'text-[var(--foreground-subtle)] hover:text-[var(--foreground)]'
                            }`}
                    >
                        🏆 Season
                    </button>
                    <button
                        onClick={() => setView('alltime')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${view === 'alltime'
                            ? 'bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                            : 'text-[var(--foreground-subtle)] hover:text-[var(--foreground)]'
                            }`}
                    >
                        ⚡ All-Time
                    </button>
                </div>

                {/* Season Switcher - Scalable Overlay Approach */}
                {isSeasonView && seasons.length > 1 && (
                    <div className="mb-6">
                        <button
                            onClick={() => setIsSelectorOpen(true)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-[var(--background-card)] border border-[var(--border)] rounded-2xl hover:border-amber-500/50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                                    <Trophy size={16} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest leading-none mb-1">Switch Season</p>
                                    <p className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight">{displaySeason?.name}</p>
                                </div>
                            </div>
                            <ChevronDown size={18} className="text-[var(--foreground-muted)] group-hover:text-amber-500 transition-colors" />
                        </button>

                        {/* Dropdown Overlay */}
                        {isSelectorOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                                <div
                                    className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                                    onClick={() => setIsSelectorOpen(false)}
                                />
                                <div className="bg-[var(--background-card)] w-full max-w-sm rounded-[2rem] border border-[var(--border)] shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
                                    <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between bg-gradient-to-r from-amber-500/5 to-transparent">
                                        <div className="flex items-center gap-2">
                                            <History size={18} className="text-amber-500" />
                                            <h3 className="font-heading font-black text-sm uppercase tracking-widest text-[var(--foreground)]">Select Season</h3>
                                        </div>
                                        <button
                                            onClick={() => setIsSelectorOpen(false)}
                                            className="p-2 hover:bg-white/5 rounded-full text-[var(--foreground-muted)] transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                        {seasons.map((s, idx) => {
                                            const isActive = s.id === selectedSeasonId
                                            return (
                                                <button
                                                    key={s.id}
                                                    onClick={() => {
                                                        const params = new URLSearchParams(searchParams.toString())
                                                        params.set('season', s.id)
                                                        router.push(`/leaderboard?${params.toString()}`)
                                                        setIsSelectorOpen(false)
                                                    }}
                                                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive
                                                        ? 'bg-amber-500 text-black shadow-lg'
                                                        : 'hover:bg-[var(--background-raised)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${isActive ? 'bg-black/10 border-black/10' : 'bg-[var(--background-raised)] border-[var(--border)]'}`}>
                                                            {s.name[0]?.toUpperCase()}
                                                        </div>
                                                        <div className="text-left">
                                                            <p className={`font-black uppercase tracking-tight ${isActive ? 'text-black' : 'text-white'}`}>{s.name}</p>
                                                            <div className={`flex items-center gap-1.5 mt-0.5 text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-black/60' : 'text-[var(--foreground-subtle)]'}`}>
                                                                {s.status === 'active' ? (
                                                                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Battle</span>
                                                                ) : (
                                                                    <span>Finalized</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isActive && <div className="w-2 h-2 rounded-full bg-black shadow-[0_0_8px_rgba(0,0,0,0.5)]" />}
                                                </button>
                                            )
                                        })}
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Season empty state — no seasons created at all */}
                {isSeasonView && !hasAnySeason && (
                    <div className="mb-6 p-8 rounded-2xl border border-dashed border-amber-500/20 text-center" style={{ background: 'var(--background-card)' }}>
                        <Crown size={32} className="text-amber-500/30 mx-auto mb-3" />
                        <p className="font-black text-sm text-[var(--foreground)] mb-1">Season Coming Soon</p>
                        <p className="text-xs text-[var(--foreground-subtle)]">No seasons have been created yet. Check back soon!</p>
                    </div>
                )}



                {/* Rankings table */}
                <div className="rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl" style={{ background: 'var(--background-card)' }}>
                    <div className="px-4 py-3 border-b border-[var(--border)] flex text-[10px] font-heading font-black text-[var(--foreground-subtle)] uppercase tracking-widest">
                        <div className="w-10 text-center">Rank</div>
                        <div className="flex-1 ml-3">Player</div>
                        <div className="w-16 text-right text-amber-500">PTS</div>
                    </div>

                    {displayList.map((player, index) => {
                        const isMe = player.id === currentUserId
                        const points = isSeasonView ? (player.season_points || 0) : (player.total_points || 0)
                        const isFirst = index === 0

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
                                            <PlayerName
                                                user={player}
                                                isChampion={player.isChampion}
                                                isClickable={true}
                                                totalPoints={player.total_points}
                                                showRankIcon={true}
                                                championshipWins={player.championship_wins}
                                                className={`font-black text-sm truncate ${isFirst ? 'text-amber-500' : 'text-[var(--foreground)]'}`}
                                            />
                                            {isMe && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full font-black shrink-0">YOU</span>}
                                        </div>
                                    </div>
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

                {/* Trophy Cards */}
                <div className="mt-8 mb-6">
                    <h2 className="font-heading font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-3 flex items-center gap-2">
                        <Zap size={12} className="text-amber-500" /> {awardScopeLabel}
                    </h2>
                    {showAwards ? (
                        <div className="grid grid-cols-2 gap-3">
                            {trophyCards.map(({ label, player, isEvent, title, value, color, border, text, icon: Icon }) => (
                                <div key={label} className={`bg-gradient-to-br ${color} to-transparent border ${border} p-4 rounded-2xl relative overflow-hidden`}>
                                    <Icon className={`absolute top-2 right-2 opacity-20 ${text}`} size={36} />
                                    <p className={`text-[10px] uppercase font-heading font-black tracking-widest mb-1 ${text}`}>{label}</p>

                                    {isEvent ? (
                                        <>
                                            <p className="font-black text-sm text-[var(--foreground)] truncate block my-0.5">
                                                {title || 'Unknown Event'}
                                            </p>
                                            {displaySeason?.name && (
                                                <span className="text-zinc-500 text-sm font-normal">
                                                    (Season {displaySeason.name})
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <PlayerName
                                            user={player}
                                            isClickable={true}
                                            totalPoints={player?.total_points}
                                            showRankIcon={true}
                                            championshipWins={player?.championship_wins}
                                            className="font-black text-sm text-[var(--foreground)] truncate block"
                                        />
                                    )}

                                    <p className={`font-mono text-xs font-bold mt-0.5 ${text}`}>{value}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-5 rounded-2xl border border-dashed border-[var(--border)] text-center" style={{ background: 'var(--background-raised)' }}>
                            <Trophy size={24} className="text-amber-500/30 mx-auto mb-2" />
                            <p className="text-xs font-black text-[var(--foreground-muted)]">No season battles yet</p>
                            <p className="text-[10px] text-[var(--foreground-subtle)] mt-1">Awards will appear after the first season event is finalized.</p>
                        </div>
                    )}
                </div>

                {/* Rules & Rewards — only show when a real season is selected and it exists */}
                {isSeasonView && displaySeason && (
                    <div className="mt-8 space-y-4">
                        {/* Theme Note */}
                        {displaySeason.theme_note && (
                            <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <Star size={24} className="text-amber-500" />
                                </div>
                                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <Star size={12} className="text-amber-500" /> Season Note
                                </h3>
                                <p className="text-sm font-bold text-[var(--foreground)] leading-relaxed whitespace-pre-wrap italic">
                                    "{displaySeason.theme_note}"
                                </p>
                            </div>
                        )}

                        <div className="relative rounded-2xl p-[1px] overflow-hidden">
                            <div className="bg-[var(--background-card)] rounded-2xl border border-amber-900/20 p-1">
                                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2">
                                    <div className="px-4 py-2 flex items-center gap-2 shrink-0">
                                        <Crown size={14} className="text-amber-500" />
                                        <span className="font-black text-[10px] uppercase tracking-[0.1em] text-amber-500/80">Season {displaySeason.name} Rules</span>
                                    </div>
                                    <div className="flex flex-wrap sm:flex-nowrap justify-center gap-3 w-full sm:w-auto p-1 bg-[var(--background-raised)] rounded-2xl border border-[var(--border)]">
                                        <div className="px-3 py-2 flex flex-col items-center">
                                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Entry</span>
                                            <span className="text-xs font-black text-[var(--foreground)]">+{displaySeason.pts_per_game} XP</span>
                                        </div>
                                        <div className="w-px h-6 bg-white/5 self-center" />
                                        <div className="px-3 py-2 flex flex-col items-center">
                                            <span className="text-[8px] font-black text-sky-400 uppercase tracking-widest mb-0.5">Profit</span>
                                            <span className="text-xs font-black text-[var(--foreground)]">+{displaySeason.pts_per_euro_profit}x</span>
                                        </div>
                                        <div className="w-px h-6 bg-white/5 self-center" />
                                        <div className="px-3 py-2 flex flex-col items-center">
                                            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-0.5">Victory</span>
                                            <span className="text-xs font-black text-[var(--foreground)]">+{displaySeason.pts_1st_place}/+{displaySeason.pts_2nd_place}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* End of Season Standing Points Rewards */}
                                <div className="mt-1 mx-1 mb-1 p-3 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl">
                                    <p className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest mb-3 flex items-center gap-2 text-center justify-center">
                                        <Star size={10} /> End of Season Standing Points
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 rounded-lg shadow-[0_0_12px_rgba(245,158,11,0.4)] border border-amber-200/50 flex items-center justify-center relative overflow-hidden shrink-0">
                                                <Trophy size={20} className="text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] z-10" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-tight">1st Place</p>
                                                <p className="text-[9px] text-amber-500 font-bold uppercase">+{displaySeason.pts_season_1st} XP + Badge</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 border-l border-white/5 pl-4">
                                            <div className="w-10 h-10 rounded-lg bg-slate-500/20 border border-slate-400/20 flex items-center justify-center text-lg shrink-0">🥈</div>
                                            <div>
                                                <p className="text-[11px] font-black text-slate-300 uppercase tracking-tight">2nd Place</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase">+{displaySeason.pts_season_2nd} XP</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 border-l border-white/5 pl-4">
                                            <div className="w-10 h-10 rounded-lg bg-[#b45309]/20 border border-[#b45309]/30 flex items-center justify-center text-lg shrink-0">🥉</div>
                                            <div>
                                                <p className="text-[11px] font-black text-[#b45309] uppercase tracking-tight">3rd Place</p>
                                                <p className="text-[9px] text-[#b45309]/80 font-bold uppercase">+{displaySeason.pts_season_3rd} XP</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
