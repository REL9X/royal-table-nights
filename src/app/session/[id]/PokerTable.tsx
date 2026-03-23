'use client'

import { Crown } from 'lucide-react'

interface SeatPlayer {
    id: string
    player_id: string
    profiles: { name: string; avatar_url: string | null } | null
    total_invested: number
    cash_out: number
    profit: number
    rebuys: number
    buy_ins: number
    is_eliminated: boolean
}

function getSeatPositions(count: number): { x: number; y: number }[] {
    const positions = []
    for (let i = 0; i < count; i++) {
        const angle = (Math.PI / 2) + (2 * Math.PI * i / count)
        const rx = 40
        const ry = 33
        const x = 50 + rx * Math.cos(angle)
        const y = 50 + ry * Math.sin(angle)
        positions.push({ x, y })
    }
    return positions
}

export default function PokerTable({ players, currentUserId }: { players: SeatPlayer[], currentUserId: string }) {
    const count = Math.min(players.length, 10)
    const seated = players.slice(0, count)
    const positions = getSeatPositions(count)

    const activePlayers = seated.filter(p => !p.is_eliminated).length

    return (
        <div className="relative mx-3 mb-4 rounded-2xl overflow-hidden" style={{
            background: 'linear-gradient(135deg, #0d1b2a 0%, #0b1622 50%, #0d1a1a 100%)',
            border: '1px solid rgba(16,185,129,0.25)',
            boxShadow: '0 0 40px rgba(16,185,129,0.08), inset 0 0 60px rgba(0,0,0,0.4)'
        }}>
            {/* Rainbow top border stripe — same as the hero card */}
            <div className="h-[3px] w-full" style={{
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ef4444, #6366f1)'
            }} />


            {/* Header bar */}
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
                    <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Live Table</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                    <span className="text-emerald-400">{activePlayers} <span className="text-[var(--foreground-subtle)]">active</span></span>
                    <span className="text-red-400">{seated.length - activePlayers} <span className="text-[var(--foreground-subtle)]">out</span></span>
                </div>
            </div>

            {/* Table oval */}
            <div className="relative mx-4 mb-4" style={{ paddingBottom: '78%' }}>
                <svg viewBox="0 0 100 78" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        {/* Outer glow rim — emerald gaming style */}
                        <linearGradient id="tableRim" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
                            <stop offset="25%" stopColor="#06b6d4" stopOpacity="0.9" />
                            <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
                            <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.9" />
                        </linearGradient>
                        <radialGradient id="tableFelt" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#0f2027" />
                            <stop offset="70%" stopColor="#0a1a20" />
                            <stop offset="100%" stopColor="#071014" />
                        </radialGradient>
                        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </radialGradient>
                        <filter id="rimGlow">
                            <feGaussianBlur stdDeviation="0.5" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>

                    {/* Outer rainbow glow rim */}
                    <ellipse cx="50" cy="39" rx="49" ry="37.5" fill="url(#tableRim)" filter="url(#rimGlow)" />
                    {/* Dark border gap */}
                    <ellipse cx="50" cy="39" rx="47.5" ry="36" fill="#071014" />
                    {/* Felt surface */}
                    <ellipse cx="50" cy="39" rx="46" ry="34.5" fill="url(#tableFelt)" />
                    {/* Center ambient glow */}
                    <ellipse cx="50" cy="39" rx="46" ry="34.5" fill="url(#centerGlow)" />

                    {/* Subtle inner ring */}
                    <ellipse cx="50" cy="39" rx="36" ry="27" fill="none" stroke="#10b981" strokeWidth="0.15" opacity="0.25" />
                    <ellipse cx="50" cy="39" rx="20" ry="15" fill="none" stroke="#10b981" strokeWidth="0.12" opacity="0.15" />

                    {/* Center circle — logo placed via HTML overlay below */}
                </svg>

                {/* App logo centered on the table */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 5 }}>
                    <div className="rounded-full flex items-center justify-center shadow-[0_0_28px_rgba(245,158,11,0.6)]"
                        style={{ width: 54, height: 54, background: 'linear-gradient(135deg, #f59e0b, #d97706)', marginTop: '3%' }}>
                        <Crown size={26} className="text-black" strokeWidth={2.5} />
                    </div>
                </div>

                {/* Player seats */}
                {seated.map((player, i) => {
                    const pos = positions[i]
                    const isMe = player.player_id === currentUserId
                    const isElim = player.is_eliminated
                    const profit = Number(player.profit)

                    return (
                        <div
                            key={player.id}
                            className="absolute flex flex-col items-center gap-0.5"
                            style={{
                                left: `${pos.x}%`,
                                top: `${pos.y}%`,
                                transform: 'translate(-50%, -50%)',
                                width: '58px',
                                zIndex: 10
                            }}
                        >
                            {/* Avatar */}
                            <div className={`rounded-full overflow-hidden flex items-center justify-center font-black text-[11px] border-2 transition-all shrink-0
                                ${isElim
                                    ? 'opacity-30 grayscale border-red-700/50'
                                    : isMe
                                        ? 'border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.7)]'
                                        : 'border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                                }`}
                                style={{ width: 34, height: 34, background: '#0a1520' }}
                            >
                                {player.profiles?.avatar_url
                                    ? <img src={player.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                    : <span className={
                                        isElim ? 'text-gray-700'
                                            : isMe ? 'text-amber-400'
                                                : 'text-emerald-400'
                                    }>
                                        {player.profiles?.name?.[0]?.toUpperCase() || '?'}
                                    </span>
                                }
                            </div>

                            {/* Name + profit */}
                            <div className={`px-1.5 py-px rounded-md text-center
                                ${isElim
                                    ? 'bg-red-950/60 border border-red-900/30'
                                    : isMe
                                        ? 'bg-amber-500/15 border border-amber-400/40'
                                        : 'bg-[#0a1a18]/90 border border-emerald-500/20'
                                }`}
                            >
                                <p className={`text-[7.5px] font-black truncate leading-tight
                                    ${isElim ? 'text-red-600/60' : isMe ? 'text-amber-300' : 'text-emerald-300'}`}
                                    style={{ maxWidth: 50 }}>
                                    {player.profiles?.name?.split(' ')[0] || '?'}
                                </p>
                                <p className={`text-[7px] font-mono font-bold leading-none
                                    ${isElim ? 'text-red-700/60' : profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isElim ? '☠' : `${profit > 0 ? '+' : ''}${profit}€`}
                                </p>
                            </div>

                            {/* Rebuy bubble */}
                            {player.rebuys > 0 && !isElim && (
                                <div className="absolute -top-0.5 -right-0.5 bg-violet-600 text-white text-[6px] font-black rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-[0_0_6px_rgba(139,92,246,0.8)]">
                                    {player.rebuys}
                                </div>
                            )}
                            {/* YOU badge */}
                            {isMe && !isElim && (
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-amber-400 text-black text-[6px] font-black px-1.5 rounded-sm leading-none py-px whitespace-nowrap shadow-[0_0_6px_rgba(251,191,36,0.6)]">
                                    YOU
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Bottom dot row */}
            <div className="flex justify-center gap-1 pb-3">
                {seated.map((p, i) => (
                    <div key={i} className={`rounded-full transition-all ${p.is_eliminated
                        ? 'w-1.5 h-1.5 bg-red-800/60'
                        : 'w-2 h-2 bg-emerald-500 shadow-[0_0_4px_#10b981]'
                        }`} />
                ))}
            </div>
        </div>
    )
}
