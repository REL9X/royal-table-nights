import React from 'react'
import Link from 'next/link'
import { Trophy, FlaskConical } from 'lucide-react'
import { getPlayerRank } from '@/lib/playerRanks'

interface PlayerNameProps {
    user: {
        id?: string
        name?: string
        role?: string
        is_test_account?: boolean
    } | null | undefined
    totalPoints?: number | null
    className?: string
    isClickable?: boolean
    showRankIcon?: boolean
    showRankTitle?: boolean
    isChampion?: boolean
    championshipWins?: any[] | null
    showBadges?: boolean
}

export default function PlayerName({
    user,
    totalPoints,
    className = "",
    isClickable = false,
    showRankIcon = false,
    showRankTitle = false,
    isChampion = false,
    championshipWins = [],
    showBadges = false
}: PlayerNameProps) {
    if (!user || (!user.name && user.name !== '')) {
        return <span className={className}>-</span>
    }

    const { id, name, role, is_test_account } = user

    // Remove "GM " prefix if the user manually added it, so we don't duplicate it.
    let baseName = name
    if (baseName?.startsWith('GM ')) {
        baseName = baseName.substring(3).trim()
    }

    const testBadge = is_test_account ? (
        <span className="ml-1.5 bg-sky-500/20 text-sky-400 text-[8px] px-1 py-[1px] rounded uppercase tracking-widest border border-sky-500/20 inline-flex items-center gap-0.5 align-middle">
            <FlaskConical size={8} /> TEST
        </span>
    ) : null;

    const rank = getPlayerRank(totalPoints)

    const titleElement = showRankTitle && totalPoints !== undefined ? (
        <span className="text-xs text-[var(--foreground-muted)] ml-1 font-normal opacity-70">
            ({rank.title})
        </span>
    ) : null;

    const iconElement = showRankIcon && totalPoints !== undefined ? (
        <span className="mr-1" title={rank.title}>{rank.icon}</span>
    ) : null;

    // Render individual season badges if available, otherwise fallback to the generic champion badge
    const winsToRender = showBadges ? (Array.isArray(championshipWins) && championshipWins.length > 0
        ? championshipWins
        : (isChampion ? [{ seasonName: 'Season Champion' }] : [])) : [];

    const championBadges = winsToRender.map((win, idx) => {
        const sMatch = win.seasonName?.match(/Season\s+(?:#)?(\d+)/i);
        const shortName = sMatch ? `S${sMatch[1]}` : '🏆';

        return (
            <div key={idx} className="inline-flex items-center justify-center min-w-[1.25rem] h-5 ml-1 px-1 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 rounded-md shadow-[0_0_8px_rgba(245,158,11,0.4)] border border-amber-200/30"
                title={win.seasonName || "Season Champion"}>
                {sMatch ? (
                    <span className="text-[9px] font-black text-white italic drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">{shortName}</span>
                ) : (
                    <Trophy size={11} className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                )}
            </div>
        );
    });

    const content = role === 'admin' ? (
        <span className="inline-flex items-center">
            {iconElement}
            <span className="text-sky-400 font-semibold mr-1">GM</span> {baseName}
            {testBadge}
            {championBadges}
            {titleElement}
        </span>
    ) : (
        <span className="inline-flex items-center">
            {iconElement}
            {baseName}
            {testBadge}
            {championBadges}
            {titleElement}
        </span>
    )

    if (isClickable && id) {
        return (
            <Link href={`/player/${id}`} className={`hover:underline cursor-pointer inline-flex items-center ${className}`}>
                {content}
            </Link>
        )
    }

    return <span className={`inline-flex items-center ${className}`}>{content}</span>
}
