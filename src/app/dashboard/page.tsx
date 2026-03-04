import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Crown, LogOut, CheckCircle, Calendar, MapPin, DollarSign, Download, Spade, Heart, Club, Diamond, Trophy, Zap, Star, Shield, ChevronRight, Settings } from 'lucide-react'
import { submitRsvp } from './actions'
import Link from 'next/link'
import PlayerName from '@/components/PlayerName'
import ThemeToggle from '@/components/ThemeToggle'

export default async function Dashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) return <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8 flex items-center justify-center">Loading...</div>

    if (!profile.is_approved && profile.role !== 'admin') {
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col justify-center items-center p-6 text-center">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border-4 border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.2)]">
                    <Crown className="text-amber-500 w-12 h-12" />
                </div>
                <h1 className="text-3xl font-black text-[var(--foreground)] mb-2 uppercase tracking-wider">Awaiting Entry</h1>
                <p className="text-[var(--foreground-muted)] max-w-xs mb-8 text-sm">
                    Hey <span className="text-amber-500 font-bold">{profile.name}</span>! The GM needs to approve your seat before you can join the table.
                </p>
                <form action={async () => { 'use server'; const s = await createClient(); await s.auth.signOut(); redirect('/login') }}>
                    <button type="submit" className="text-[var(--foreground-subtle)] hover:text-[var(--foreground)] transition-colors flex items-center gap-2 text-sm font-medium">
                        <LogOut size={16} /> Sign Out
                    </button>
                </form>
            </div>
        )
    }

    // Fetch leaderboard and profile stats
    const { data: allPlayers } = await supabase.from('profiles').select('id, name, role, total_points, total_profit, sessions_played').eq('is_approved', true).order('total_points', { ascending: false })
    const myRank = (allPlayers?.findIndex(p => p.id === user.id) ?? -1) + 1
    const topPlayers = allPlayers?.slice(0, 3) || []
    const maxPoints = allPlayers?.[0]?.total_points || 1

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden"
            style={{ background: 'var(--background)' }}>

            {/* Animated background blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-30"
                    style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
                <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-20"
                    style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
                <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-15"
                    style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-md mx-auto relative z-10 px-4 pt-6">

                {/* ── TOP NAV ── */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.5)]">
                            <Crown size={18} className="text-black" />
                        </div>
                        <span className="font-black text-lg tracking-wider text-[var(--foreground)] uppercase">Royal Table</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        {profile.role === 'admin' && (
                            <Link href="/admin" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-amber-500 hover:bg-amber-500/10 transition-colors">
                                <Settings size={16} />
                            </Link>
                        )}
                        <form action={async () => { 'use server'; const s = await createClient(); await s.auth.signOut(); redirect('/login') }}>
                            <button type="submit" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                                <LogOut size={16} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* ── PLAYER CARD ── */}
                <Link href="/profile" className="block mb-5 group">
                    <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/30 group-hover:border-amber-500/60 transition-all shadow-[0_4px_32px_rgba(0,0,0,0.4)]"
                        style={{ background: 'linear-gradient(135deg, var(--background-card) 0%, var(--background-raised) 100%)' }}>
                        {/* Gold shimmer top bar */}
                        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #f59e0b, #0ea5e9, #f59e0b, #7c3aed)', backgroundSize: '200% 100%' }} />

                        <div className="p-5">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <div className="w-20 h-20 rounded-2xl border-3 border-amber-500/50 overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.3)] bg-[var(--background-raised)] flex items-center justify-center"
                                        style={{ borderWidth: 3 }}>
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-3xl font-black text-amber-500">{profile.name?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    {/* Rank badge */}
                                    {myRank > 0 && (
                                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.6)] border-2 border-[var(--background-card)]">
                                            <span className="text-[10px] font-black text-black">#{myRank}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Name + stats */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h1 className="text-xl font-black text-[var(--foreground)] truncate">
                                            <PlayerName user={profile} isClickable={true} />
                                        </h1>
                                        {profile.role === 'admin' && (
                                            <span className="shrink-0 text-[10px] font-black bg-amber-500 text-black px-2 py-0.5 rounded-full uppercase tracking-wider">GM</span>
                                        )}
                                    </div>

                                    {/* Points XP bar */}
                                    <div className="mb-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Season Points</span>
                                            <span className="text-[11px] font-black text-amber-500">{profile.total_points || 0} PTS</span>
                                        </div>
                                        <div className="h-2.5 rounded-full bg-[var(--border)] overflow-hidden">
                                            <div className="h-full rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-all duration-500"
                                                style={{
                                                    width: `${Math.min(100, Math.round(((profile.total_points || 0) / maxPoints) * 100))}%`,
                                                    background: 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                                }} />
                                        </div>
                                    </div>

                                    {/* Quick stats row */}
                                    <div className="flex gap-3 text-[11px]">
                                        <span className="flex items-center gap-1 text-[var(--foreground-muted)]">
                                            <Zap size={11} className="text-amber-500" />
                                            <span className="font-bold">{profile.sessions_played || 0}</span> played
                                        </span>
                                        <span className="flex items-center gap-1">
                                            {Number(profile.total_profit || 0) >= 0 ? (
                                                <span className="text-emerald-500 font-bold flex items-center gap-0.5"><Star size={11} />+{profile.total_profit || 0}€</span>
                                            ) : (
                                                <span className="text-red-500 font-bold">{profile.total_profit || 0}€</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* ── TOP 3 PODIUM ── */}
                {topPlayers.length > 0 && (
                    <div className="mb-5">
                        <div className="flex justify-between items-center mb-3 px-1">
                            <h2 className="font-black text-sm uppercase tracking-widest text-[var(--foreground-muted)] flex items-center gap-2">
                                <Trophy size={14} className="text-amber-500" /> Leaderboard
                            </h2>
                            <Link href="/leaderboard" className="text-amber-500 text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                All Standings <ChevronRight size={12} />
                            </Link>
                        </div>

                        <div className="rounded-2xl border border-[var(--border)] overflow-hidden" style={{ background: 'var(--background-card)' }}>
                            {topPlayers.map((player, i) => {
                                const isMe = player.id === user.id
                                const medals = ['🥇', '🥈', '🥉']
                                const barW = Math.round(((player.total_points || 0) / maxPoints) * 100)
                                return (
                                    <div key={player.id} className={`flex items-center gap-3 px-4 py-3 ${i < topPlayers.length - 1 ? 'border-b border-[var(--border)]' : ''} ${isMe ? 'bg-amber-500/5' : ''}`}>
                                        <span className="text-lg w-7 text-center shrink-0">{medals[i]}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-sm font-black truncate ${isMe ? 'text-amber-500' : 'text-[var(--foreground)]'}`}>
                                                    {player.name}{isMe ? ' (You)' : ''}
                                                </span>
                                                <span className="text-xs font-black text-[var(--foreground-muted)] shrink-0 ml-2">{player.total_points || 0} pts</span>
                                            </div>
                                            <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                                                <div className="h-full rounded-full"
                                                    style={{
                                                        width: `${barW}%`,
                                                        background: i === 0 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : i === 1 ? 'linear-gradient(90deg,#94a3b8,#cbd5e1)' : 'linear-gradient(90deg,#b45309,#d97706)'
                                                    }} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* ── NEXT EVENT ── */}
                <div className="mb-5">
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h2 className="font-black text-sm uppercase tracking-widest text-[var(--foreground-muted)] flex items-center gap-2">
                            <Zap size={14} className="text-emerald-500" /> Next Event
                        </h2>
                        {profile.role === 'admin' && (
                            <Link href="/admin/events/new" className="text-emerald-500 text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                + New <ChevronRight size={12} />
                            </Link>
                        )}
                    </div>
                    <EventsList userId={user.id} />
                </div>

                {/* ── QUICK LINKS ── */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                        { href: '/leaderboard', icon: Trophy, label: 'Ranks', color: 'from-amber-500/20 to-amber-700/10', border: 'border-amber-500/20', iconColor: 'text-amber-500' },
                        { href: '/history', icon: Star, label: 'History', color: 'from-sky-500/20 to-sky-700/10', border: 'border-sky-500/20', iconColor: 'text-sky-400' },
                        { href: '/profile', icon: Shield, label: 'Profile', color: 'from-violet-500/20 to-violet-700/10', border: 'border-violet-500/20', iconColor: 'text-violet-400' },
                    ].map(({ href, icon: Icon, label, color, border, iconColor }) => (
                        <Link key={href} href={href} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border bg-gradient-to-b ${color} ${border} hover:scale-105 transition-all active:scale-95`}>
                            <Icon size={22} className={iconColor} />
                            <span className="text-xs font-black text-[var(--foreground)] uppercase tracking-wide">{label}</span>
                        </Link>
                    ))}
                </div>

                {/* Card suits decoration */}
                <div className="flex justify-center gap-5 text-[var(--foreground-subtle)] mb-4 opacity-40">
                    <Spade size={14} /><Heart size={14} className="text-red-500/60" /><Club size={14} /><Diamond size={14} className="text-red-500/60" />
                </div>
            </div>
        </div>
    )
}

async function EventsList({ userId }: { userId: string }) {
    const supabase = await createClient()
    const { data: events } = await supabase
        .from('events')
        .select(`*, event_responses (*)`)
        .in('status', ['upcoming', 'active'])
        .order('date', { ascending: true })

    if (!events || events.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center" style={{ background: 'var(--background-card)' }}>
                <Zap size={24} className="text-[var(--foreground-subtle)] mx-auto mb-3" />
                <p className="text-[var(--foreground-subtle)] text-sm font-medium">No battles scheduled yet.</p>
                <Link href="/history" className="mt-3 inline-block text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors">View Past Games →</Link>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {events.map((event) => {
                const myResponse = event.event_responses?.find((r: { player_id: string }) => r.player_id === userId)
                const isAttending = myResponse?.status === 'accepted'
                const isActive = event.status === 'active'

                return (
                    <div key={event.id} className={`relative rounded-2xl overflow-hidden border-2 transition-all ${isActive ? 'border-emerald-500/50 shadow-[0_0_24px_rgba(16,185,129,0.15)]' : isAttending ? 'border-amber-500/30 shadow-[0_0_16px_rgba(245,158,11,0.1)]' : 'border-[var(--border)]'}`}
                        style={{ background: 'var(--background-card)' }}>

                        {/* Active session glow bar */}
                        {isActive && <div className="h-1 w-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
                        {!isActive && isAttending && <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg,#f59e0b,#fbbf24)' }} />}

                        <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-black text-base text-[var(--foreground)] pr-2">{event.title}</h3>
                                {isActive ? (
                                    <span className="shrink-0 text-[10px] font-black bg-emerald-500 text-black px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">● LIVE</span>
                                ) : isAttending ? (
                                    <span className="shrink-0 text-[10px] font-black bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2 py-1 rounded-full uppercase tracking-wider">✓ In</span>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs text-[var(--foreground-muted)] mb-4">
                                <span className="flex items-center gap-1.5"><Calendar size={11} className="text-amber-500" />{new Date(event.date).toLocaleDateString()} · {event.time}</span>
                                {event.location && <span className="flex items-center gap-1.5"><MapPin size={11} />{event.location}</span>}
                                <span className="flex items-center gap-1.5"><DollarSign size={11} className="text-emerald-500" /><strong className="text-emerald-500">{event.buy_in_amount}€</strong> buy-in</span>
                            </div>

                            <div className="flex gap-2">
                                {isActive ? (
                                    <Link href={`/session/${event.id}`} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-black text-sm text-center flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_16px_rgba(16,185,129,0.4)]">
                                        <Crown size={15} /> Enter Table
                                    </Link>
                                ) : !isAttending ? (
                                    <form action={async () => { 'use server'; await submitRsvp(event.id, 'accepted') }} className="flex-1">
                                        <button type="submit" className="w-full py-2.5 text-sm font-black rounded-xl text-white flex items-center justify-center gap-2 transition-all active:scale-95"
                                            style={{ background: 'linear-gradient(135deg, #059669, #065f46)' }}>
                                            <CheckCircle size={15} /> Accept
                                        </button>
                                    </form>
                                ) : (
                                    <Link href={`/session/${event.id}`} className="flex-1 py-2.5 rounded-xl font-black text-sm text-center flex items-center justify-center gap-2 transition-all active:scale-95 border border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                                        <Crown size={15} /> View Session
                                    </Link>
                                )}
                                <Link href={`/api/calendar?id=${event.id}`} className="px-3 py-2.5 bg-[var(--background-raised)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors flex items-center justify-center">
                                    <Download size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
