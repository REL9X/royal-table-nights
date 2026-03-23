'use client'

import { Crown, Trophy, ChevronRight, Star, Users, Target, Zap, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import ConfirmActionForm from '@/components/ConfirmActionForm'
import { finishSeason } from '@/app/admin/seasons/actions'
import PlayerName from '@/components/PlayerName'

export default function SeasonCard({
    activeSeason,
    profile,
    seasonGamesPlayed,
    seasonWinner,
    profileCount,
    attendanceRate,
    topThree = [],
    avgPot = 0,
    avgDuration = 0,
    avgRebuys = 0
}: {
    activeSeason: any
    profile: any
    seasonGamesPlayed: number
    seasonWinner: any
    profileCount: number
    attendanceRate: number
    topThree?: any[]
    avgPot?: number
    avgDuration?: number
    avgRebuys?: number
}) {
    const isCompleted = activeSeason.status === 'completed'
    const progressPercent = Math.min(100, Math.round((seasonGamesPlayed / (activeSeason.max_games || 1)) * 100))

    return (
        <div className="mb-5">

            <div className="transition-all duration-300">
                <div className="block relative group">
                    <div className="rounded-[2.5rem] overflow-hidden bg-[var(--background-card)] border-2 border-[var(--border)] group-hover:border-amber-500/50 transition-all duration-300 shadow-2xl">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16" />

                        <div className="p-5 relative">
                            {isCompleted ? (
                                <div className="relative z-10 p-1">
                                    <style>{`
                                        @keyframes border-shimmer {
                                            0% { background-position: 0% 50%; }
                                            50% { background-position: 100% 50%; }
                                            100% { background-position: 0% 50%; }
                                        }
                                        .golden-shimmer-border {
                                            background: linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b, #fbbf24, #f59e0b);
                                            background-size: 300% 300%;
                                            animation: border-shimmer 4s ease infinite;
                                        }
                                    `}</style>

                                    {/* Compact Header */}
                                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-[var(--border)]">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg border-b-2 border-amber-800 shadow-lg">
                                                <Trophy size={14} className="text-black" />
                                            </div>
                                            <h3 className="text-xl font-black text-[var(--foreground)] italic uppercase tracking-tighter leading-none">
                                                SEASON {activeSeason.name}
                                            </h3>
                                        </div>
                                        <span className="text-sm font-black text-amber-500 uppercase tracking-[0.2em] italic drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]">CHAMPION</span>
                                    </div>

                                    {/* Compact Winner Spotlight */}
                                    <div className="flex items-center gap-5 mb-4 px-1">
                                        <Link href={`/player/${seasonWinner?.id}`} className="relative shrink-0 block group/pfp transition-transform hover:scale-110 duration-500">
                                            <div className="absolute -inset-2 bg-amber-500/10 blur-xl rounded-full" />
                                            <div className="golden-shimmer-border p-[3.5px] rounded-3xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                                                <div className="relative w-20 h-20 rounded-[1.2rem] overflow-hidden bg-[var(--background-raised)]">
                                                    {seasonWinner?.avatar_url ? (
                                                        <img src={seasonWinner.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-400 to-amber-600">
                                                            <span className="text-3xl font-black text-black italic">
                                                                {seasonWinner?.name?.[0].toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-600 text-black px-1.5 py-0.5 rounded-lg border-2 border-amber-900 shadow-[0_4px_12px_rgba(0,0,0,0.6)] transform rotate-12 flex items-center justify-center min-w-[30px] z-10">
                                                <span className="text-[10px] font-black italic tracking-tighter drop-shadow-sm">#1</span>
                                            </div>
                                        </Link>

                                        <div className="flex-1 min-w-0">
                                            <Link href={`/player/${seasonWinner?.id}`} className="block hover:opacity-80 transition-opacity">
                                                <h4 className="text-3xl font-black text-[var(--foreground)] italic uppercase tracking-tighter drop-shadow-[0_4px_0_rgba(180,83,9,0.8)] truncate leading-none mb-3">
                                                    <PlayerName
                                                        user={seasonWinner}
                                                        isChampion={true}
                                                        championshipWins={seasonWinner?.championship_wins}
                                                        showBadges={true}
                                                    />
                                                </h4>
                                            </Link>
                                            <div className="flex gap-2">
                                                <div className="bg-[var(--background-raised)] px-2 py-1.5 rounded-xl border border-[var(--border)] flex flex-col items-center flex-1">
                                                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest leading-tight">Points</span>
                                                    <span className="text-sm font-black text-[var(--foreground)]">{seasonWinner?.seasonStats?.points || 0}</span>
                                                </div>
                                                <div className="bg-[var(--background-raised)] px-2 py-1.5 rounded-xl border border-[var(--border)] flex flex-col items-center flex-1">
                                                    <span className="text-[8px] font-black text-sky-400 uppercase tracking-widest leading-tight">Games</span>
                                                    <span className="text-sm font-black text-[var(--foreground)]">{seasonWinner?.seasonStats?.games || 0}</span>
                                                </div>
                                                <div className="bg-[var(--background-raised)] px-2 py-1.5 rounded-xl border border-[var(--border)] flex flex-col items-center min-w-[60px]">
                                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest leading-tight">Avg</span>
                                                    <span className="text-sm font-black text-[var(--foreground)]">
                                                        {(seasonWinner?.seasonStats?.points / (seasonWinner?.seasonStats?.games || 1)).toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center pt-1">
                                        <div className="bg-[var(--background-raised)] px-6 py-2 rounded-2xl border border-[var(--border)] backdrop-blur-sm group-hover:border-emerald-500/30 transition-all flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.2em]">THE NEXT SEASON BEGINS SOON</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative z-10">
                                    {/* Main Card Link to Leaderboard */}
                                    <Link
                                        href={`/leaderboard?season=${activeSeason.id}`}
                                        className="absolute inset-x-0 -inset-y-4 z-0 cursor-pointer"
                                        aria-label={`View Season ${activeSeason.name} Rankings`}
                                    />
                                    {/* Pulse Styles */}
                                    <style>{`
                                        @keyframes pulse-live {
                                            0% { transform: scale(1); opacity: 1; }
                                            50% { transform: scale(1.2); opacity: 0.5; }
                                            100% { transform: scale(1); opacity: 1; }
                                        }
                                        .live-pulse {
                                            animation: pulse-live 2s infinite ease-in-out;
                                        }
                                    `}</style>

                                    {/* Header Row */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-inner">
                                                <Trophy size={22} className="text-amber-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter leading-none mb-1">
                                                    SEASON {activeSeason.name}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] live-pulse" />
                                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">LIVE SEASON</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-[var(--background-raised)] px-3 py-1.5 rounded-xl border border-[var(--border)] flex flex-col items-end">
                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Progress</span>
                                            <span className="text-xs font-black text-[var(--foreground)] italic">{seasonGamesPlayed} / {activeSeason.max_games} GAMES</span>
                                        </div>
                                    </div>

                                    {/* Tactical Progress Bar */}
                                    <div className="mb-3">
                                        <div className="h-3 rounded-full bg-[var(--background-raised)] border border-[var(--border)] p-0.5 overflow-hidden shadow-inner uppercase font-black text-[6px]">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all duration-1000"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Season Theme / Note */}
                                    {activeSeason.theme_note && (
                                        <div className="mb-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                                <Star size={24} className="text-amber-500" />
                                            </div>
                                            <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                <Star size={8} /> Season Note
                                            </p>
                                            <p className="text-[11px] font-bold text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                                                {activeSeason.theme_note}
                                            </p>
                                        </div>
                                    )}

                                    {/* Top 3 Contenders Grid */}
                                    <div className="mb-4 grid grid-cols-1 gap-1">
                                        <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest px-1">Top Contenders</p>
                                        <div className="bg-[var(--background-raised)] rounded-2xl border border-[var(--border)] p-2.5 flex items-center justify-between">
                                            <div className="flex -space-x-2.5">
                                                {topThree.slice(0, 3).map((p, i) => (
                                                    <Link
                                                        key={p.id}
                                                        href={`/player/${p.id}`}
                                                        className="relative group/contender z-10 active:scale-95 transition-transform"
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl border-2 overflow-hidden shadow-lg transition-transform group-hover/contender:-translate-y-1 ${i === 0 ? 'border-amber-500' : i === 1 ? 'border-zinc-400' : 'border-amber-700'}`}>
                                                            {p.avatar_url ? (
                                                                <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className={`w-full h-full flex items-center justify-center font-black italic text-black ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-zinc-400' : 'bg-amber-700'}`}>
                                                                    {p.name?.[0].toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {i === 0 && <Star size={10} className="absolute -top-1.5 -right-1.5 text-amber-500 fill-amber-500 drop-shadow-md" />}
                                                    </Link>
                                                ))}
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-1">
                                                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block leading-none mb-1">Season Prizes</span>
                                                <div className="flex gap-2">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[7px] font-black text-amber-500 uppercase leading-none mb-0.5">1st</span>
                                                        <span className="text-[10px] font-black text-[var(--foreground)] italic">+{activeSeason?.pts_season_1st || 0}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center border-l border-[var(--border)] pl-2">
                                                        <span className="text-[7px] font-black text-zinc-400 uppercase leading-none mb-0.5">2nd</span>
                                                        <span className="text-[10px] font-black text-[var(--foreground)] italic">+{activeSeason?.pts_season_2nd || 0}</span>
                                                    </div>
                                                    <div className="flex flex-col items-center border-l border-[var(--border)] pl-2">
                                                        <span className="text-[7px] font-black text-amber-700 uppercase leading-none mb-0.5">3rd</span>
                                                        <span className="text-[10px] font-black text-[var(--foreground)] italic">+{activeSeason?.pts_season_3rd || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Average Stats Grid */}
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="bg-[var(--background-raised)] p-1.5 rounded-2xl border border-[var(--border)] flex flex-col items-center">
                                            <div className="p-1 px-2 mb-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                                                <Zap size={12} />
                                            </div>
                                            <span className="text-[7px] font-black text-[var(--foreground-muted)] uppercase tracking-widest leading-none mb-1">Avg Pot</span>
                                            <span className="text-xs font-black text-emerald-400">{avgPot}€</span>
                                        </div>
                                        <div className="bg-[var(--background-raised)] p-1.5 rounded-2xl border border-[var(--border)] flex flex-col items-center">
                                            <div className="p-1 px-2 mb-1.5 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/20">
                                                <Clock size={12} />
                                            </div>
                                            <span className="text-[7px] font-black text-[var(--foreground-muted)] uppercase tracking-widest leading-none mb-1">Avg Time</span>
                                            <span className="text-xs font-black text-sky-400">{avgDuration}m</span>
                                        </div>
                                        <div className="bg-[var(--background-raised)] p-1.5 rounded-2xl border border-[var(--border)] flex flex-col items-center">
                                            <div className="p-1 px-2 mb-1.5 bg-violet-500/10 rounded-lg text-violet-400 border border-violet-500/20">
                                                <TrendingUp size={12} />
                                            </div>
                                            <span className="text-[7px] font-black text-[var(--foreground-muted)] uppercase tracking-widest leading-none mb-1">Avg Rebuys</span>
                                            <span className="text-xs font-black text-violet-400">{avgRebuys}</span>
                                        </div>
                                    </div>

                                    {/* Footer Participation */}
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-1.5">
                                            <Users size={12} className="text-amber-500" />
                                            <span className="text-[9px] font-bold text-[var(--foreground)] opacity-70 uppercase tracking-widest">
                                                {profileCount} <span className="opacity-60">Players Participating</span>
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Target size={12} className="text-emerald-500" />
                                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                                                {attendanceRate}% <span className="text-emerald-500/40">Attendance</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
