'use client'

import { Trophy, Star } from 'lucide-react'

interface Achievement {
    seasonId?: string
    seasonName?: string
    rank?: number
    awardedAt?: string
}

interface AchievementBadgesProps {
    wins?: Achievement[] | null
    className?: string
}

export default function AchievementBadges({ wins = [], className = "" }: AchievementBadgesProps) {
    if (!wins || wins.length === 0) return null

    return (
        <div className={`space-y-3 ${className}`}>
            <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] flex items-center gap-2">
                <Star size={12} className="text-amber-500" /> Achievements
            </h2>

            <div className="grid gap-2">
                {wins.map((win, idx) => {
                    const sMatch = win.seasonName?.match(/Season\s+(?:#)?(\d+)/i);
                    const seasonNumber = sMatch ? sMatch[1] : null;

                    return (
                        <div
                            key={idx}
                            className="relative group overflow-hidden bg-[var(--background-card)] border border-amber-500/20 rounded-2xl p-3 flex items-center gap-4 transition-all hover:bg-amber-500/5 hover:border-amber-500/40"
                        >
                            {/* Decorative background flare */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-12 -mt-12 transition-opacity group-hover:opacity-30" />

                            <div className="relative shrink-0 w-12 h-12 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 rounded-xl shadow-[0_4px_12px_rgba(245,158,11,0.3)] border border-amber-200/30 flex items-center justify-center overflow-hidden">
                                <Trophy size={24} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-10" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                {seasonNumber && (
                                    <span className="absolute -bottom-1 -right-1 bg-black/80 text-white text-[10px] font-black px-1.5 py-0.5 rounded-tl-lg border-t border-l border-amber-500/30">
                                        S{seasonNumber}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-black text-white italic uppercase tracking-tighter leading-none mb-1">
                                    {win.seasonName || 'Season Champion'}
                                </p>
                                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none">
                                    {win.rank === 1 ? '1st Place Winner' : 'Championship Winner'}
                                </p>
                                {win.awardedAt && (
                                    <p className="text-[9px] text-[var(--foreground-muted)] font-medium mt-1">
                                        Awarded {new Date(win.awardedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
