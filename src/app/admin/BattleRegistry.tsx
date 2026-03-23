'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Shield, Play, Swords, ChevronRight } from 'lucide-react'

interface SeasonGroup {
    seasonId: string | null
    seasonName: string
    events: React.ReactNode[]
    count: number
}

interface BattleRegistryProps {
    seasonGroups: SeasonGroup[]
    offSeasonEvents: { id: string; node: React.ReactNode }[]
    offSeasonCount: number
}

export default function BattleRegistry({ seasonGroups, offSeasonEvents, offSeasonCount }: BattleRegistryProps) {
    // Track which seasons are expanded. Default: all collapsed
    const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set())
    const [offSeasonExpanded, setOffSeasonExpanded] = useState(false)

    const toggleSeason = (id: string | null) => {
        const key = id ?? 'null'
        setExpandedSeasons(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    return (
        <div className="space-y-3">
            {/* ── SEASON CAMPAIGNS ── */}
            <div>
                <p className="text-[9px] font-black text-sky-600 dark:text-sky-400/60 uppercase tracking-[0.4em] mb-3 px-1 flex items-center gap-2">
                    <Shield size={10} /> Season Campaigns
                    <span className="bg-sky-500/10 px-2 py-0.5 rounded text-[8px] border border-sky-500/20 text-sky-600 dark:text-sky-400">
                        {seasonGroups.reduce((a, s) => a + s.count, 0)}
                    </span>
                </p>

                {seasonGroups.length === 0 ? (
                    <div className="p-8 rounded-[2rem] border-2 border-dashed border-[var(--border)] text-center text-[10px] text-[var(--foreground-muted)] opacity-40 uppercase tracking-[0.3em] font-black italic">
                        No campaigns recorded.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {seasonGroups.map(season => {
                            const key = season.seasonId ?? 'null'
                            const isOpen = expandedSeasons.has(key)
                            return (
                                <div key={key} className="rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm bg-[var(--background-card)]">
                                    {/* Season header button */}
                                    <button
                                        onClick={() => toggleSeason(season.seasonId)}
                                        className="w-full flex items-center justify-between px-4 py-3.5 bg-[var(--background-raised)]/20 hover:bg-[var(--background-raised)]/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                                <Swords size={14} className="text-amber-500" />
                                            </div>
                                             <div className="text-left">
                                                <p className="font-black text-sm text-[var(--foreground)] uppercase tracking-tight italic leading-none group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                                                    {season.seasonName}
                                                </p>
                                                <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mt-0.5">
                                                    {season.count} {season.count === 1 ? 'game' : 'games'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-amber-500/10 text-amber-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-500/20">
                                                {season.count}
                                            </span>
                                            {isOpen
                                                ? <ChevronUp size={14} className="text-[var(--foreground-muted)]" />
                                                : <ChevronDown size={14} className="text-[var(--foreground-muted)]" />
                                            }
                                        </div>
                                    </button>

                                    {/* Games list */}
                                    {isOpen && (
                                        <div className="border-t border-[var(--border)] bg-[var(--background-raised)]/30 divide-y divide-[var(--border)]/50 animate-in fade-in slide-in-from-top-1 duration-200">
                                            {season.events}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* ── SIDE SKIRMISHES (Off-season) ── */}
            <div className="pt-2">
                <button
                    onClick={() => setOffSeasonExpanded(!offSeasonExpanded)}
                    className="w-full flex justify-between items-center text-[9px] font-black text-amber-500/60 uppercase tracking-[0.4em] mb-3 px-1 hover:text-amber-500/80 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <Play size={10} /> Side Skirmishes
                        <span className="bg-amber-500/10 px-2 py-0.5 rounded text-[8px] border border-amber-500/20">{offSeasonCount}</span>
                    </span>
                    {offSeasonExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {offSeasonExpanded && (
                    <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--background-card)] divide-y divide-[var(--border)] animate-in fade-in slide-in-from-top-1 duration-200 shadow-sm">
                        {offSeasonCount === 0 ? (
                            <div className="p-8 text-center text-[10px] text-[var(--foreground-muted)] opacity-30 uppercase tracking-[0.3em] font-black italic">
                                No side-ops detected.
                            </div>
                        ) : (
                            offSeasonEvents.map(e => (
                                <div key={e.id}>{e.node}</div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
