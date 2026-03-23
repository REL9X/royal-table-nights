'use client'

import { useState } from 'react'
import { Flame, ChevronDown, ChevronUp, Swords } from 'lucide-react'
import Link from 'next/link'

interface Session {
    id: string
    event_id: string
    profit: number | string
    placement: number | null
    events: {
        title: string
        date: string
    }
}

export default function CollapsibleBattles({ sessions }: { sessions: Session[] }) {
    const [isExpanded, setIsExpanded] = useState(false)

    if (!sessions || sessions.length === 0) {
        return (
            <div className="text-center p-6 bg-[var(--background-card)] rounded-2xl border border-[var(--border)]">
                <p className="text-sm font-bold text-[var(--foreground-muted)]">No battles fought yet.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 px-4 bg-[var(--background-card)] border border-[var(--border)] rounded-2xl hover:bg-[var(--background-raised)] transition-all group shadow-sm shrink-0"
            >
                <div className="flex items-center gap-2">
                    <Flame size={14} className={isExpanded ? "text-amber-500" : "text-[var(--foreground-muted)]"} />
                    <span className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] group-hover:text-[var(--foreground)] transition-colors">
                        {isExpanded ? 'Hide Battles' : 'Show Recent Battles'}
                    </span>
                    <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-500/20">
                        {sessions.length}
                    </span>
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-amber-500" /> : <ChevronDown size={16} className="text-[var(--foreground-muted)]" />}
            </button>

            {isExpanded && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {sessions.map((session) => {
                        return (
                            <Link
                                key={session.id}
                                href={`/history/${session.event_id}`}
                                className="bg-[var(--background-card)] hover:bg-[var(--background-raised)] border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between transition-colors shadow-lg group relative overflow-hidden"
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500/50 to-transparent" />
                                <div>
                                    <p className="font-bold text-sm text-[var(--foreground)] group-hover:text-amber-500 transition-colors uppercase tracking-tight">{session.events.title}</p>
                                    <p className="text-[10px] text-[var(--foreground-subtle)] font-medium mt-0.5 uppercase tracking-widest">
                                        {new Date(session.events.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono font-black text-sm text-[var(--foreground)]">
                                        Rank {session.placement || '-'}
                                    </p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
