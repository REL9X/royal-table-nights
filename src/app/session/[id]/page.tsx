import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChevronLeft, Crown, CheckCircle, DollarSign, Users, AlertTriangle, PlusCircle, RotateCcw, Skull } from 'lucide-react'
import Link from 'next/link'
import { addRebuy, undoRebuy, submitCashout, eliminatePlayer, undoCashout } from './actions'
import PlayerName from '@/components/PlayerName'
import LiveTimer from '@/components/LiveTimer'
import PokerTable from './PokerTable'
import AdminAddPlayer from './AdminAddPlayer'
import RealtimeRefresher from '@/components/RealtimeRefresher'

export default async function SessionPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const eventId = params.id
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'

    const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single()
    if (!event) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4">
                <div className="text-[var(--foreground)] text-center mb-6 font-black uppercase tracking-widest">Event not found</div>
                <Link href="/dashboard" className="px-6 py-3 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] font-bold uppercase tracking-widest text-xs transition-colors flex items-center gap-2">
                    <ChevronLeft size={16} /> Go Back
                </Link>
            </div>
        )
    }

    const { data: sessionPlayers } = await supabase
        .from('session_players')
        .select(`*, profiles(id, name, avatar_url, total_points, role)`)
        .eq('event_id', eventId)
        .order('profit', { ascending: false })

    // Identify all previous champions
    const { data: completedSeasons } = await supabase
        .from('seasons')
        .select('id')
        .eq('status', 'completed')

    const championIds = new Set<string>()
    if (completedSeasons && completedSeasons.length > 0) {
        for (const s of completedSeasons) {
            const { data: sPointsData } = await supabase
                .from('session_players')
                .select('player_id, points_earned, events!inner(season_id, status)')
                .eq('events.season_id', s.id)
                .eq('events.status', 'completed')

            const sMap: Record<string, number> = {}
            sPointsData?.forEach((sp: any) => {
                sMap[sp.player_id] = (sMap[sp.player_id] || 0) + (sp.points_earned || 0)
            })

            const winner = Object.entries(sMap).sort((a, b) => b[1] - a[1])[0]
            if (winner) championIds.add(winner[0])
        }
    }

    const mySessionData = sessionPlayers?.find(p => p.player_id === user.id)
    const totalPot = Number((sessionPlayers?.reduce((acc, p) => acc + Number(p.total_invested), 0) || 0).toFixed(1))
    const isLive = event.status === 'active'
    const isCompleted = event.status === 'completed'

    // Fetch all approved profiles for RSVP list
    const [
        { data: allProfiles },
        { data: rsvps }
    ] = await Promise.all([
        supabase.from('profiles').select('id, name, avatar_url, total_points').eq('is_approved', true).order('name', { ascending: true }),
        supabase.from('event_responses').select('*').eq('event_id', eventId)
    ])

    const rsvpMap: Record<string, string> = {}
    rsvps?.forEach(r => { rsvpMap[r.player_id] = r.status })

    const fullRsvpList = (allProfiles || []).map(p => ({
        ...p,
        status: rsvpMap[p.id] || 'pending'
    }))

    // Sort: Accepted (A-Z) -> Pending (A-Z) -> Declined (bottom)
    const sortedRsvpList = [...fullRsvpList].sort((a, b) => {
        const order = { accepted: 1, pending: 2, declined: 3 }
        const statusA = a.status as keyof typeof order
        const statusB = b.status as keyof typeof order
        if (order[statusA] !== order[statusB]) {
            return order[statusA] - order[statusB]
        }
        return (a.name || '').localeCompare(b.name || '')
    })

    const sessionPlayerIds = sessionPlayers?.map(p => p.player_id) || []
    const availablePlayers = (allProfiles || []).filter((p: any) => !sessionPlayerIds.includes(p.id))

    const medals = ['🥇', '🥈', '🥉']

    const acceptedCount = sortedRsvpList.filter(p => p.status === 'accepted').length

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[10%] w-[60%] h-[50%] rounded-full blur-[120px] opacity-20"
                    style={{ background: isLive ? 'radial-gradient(circle, #059669 0%, transparent 70%)' : 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
                <div className="absolute bottom-[5%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-15"
                    style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-md mx-auto px-4 pt-6 relative z-10">
                {/* Real-time Refreshers */}
                <RealtimeRefresher table="events" filter={`id=eq.${eventId}`} />
                <RealtimeRefresher table="session_players" filter={`event_id=eq.${eventId}`} />

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <Link href={isCompleted ? '/history' : '/dashboard'}
                            className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors active:scale-95">
                            <ChevronLeft size={18} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-black text-xl text-[var(--foreground)] uppercase tracking-wider">{event.title}</h1>
                            </div>
                            <p className="text-[var(--foreground-muted)] text-xs">{new Date(event.date).toLocaleDateString()} · {event.buy_in_amount}€ buy-in</p>
                        </div>
                    </div>
                    {isLive && (
                        <div className="text-right">
                            <p className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-wider">Pot</p>
                            <p className="text-xl font-black text-amber-500">{totalPot}€</p>
                        </div>
                    )}
                </div>

                {/* ── POKER TABLE VISUAL ── */}
                {isLive && sessionPlayers && sessionPlayers.length > 0 && (
                    <div className="mb-6">
                        <PokerTable players={sessionPlayers as any} currentUserId={user.id} />
                    </div>
                )}

                {/* ── PLAYER LIST (LIVE OR HISTORY) ── */}
                {(isLive || isCompleted) && sessionPlayers && sessionPlayers.length > 0 && (
                    <div className="mb-5">
                        <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-3 flex items-center gap-2">
                            <Crown size={12} className="text-amber-500" /> Players · {sessionPlayers?.length || 0}
                        </h2>
                        <div className="space-y-2">
                            {sessionPlayers?.map((player, index) => {
                                const profit = Number(player.profit)
                                const isMe = player.player_id === user.id
                                const isElim = player.is_eliminated
                                const isLeading = index === 0 && profit > 0 && !isElim
                                const canAct = isLive && (isAdmin || isMe)
                                const alreadyCashedOut = isElim || Number(player.cash_out) > 0

                                return (
                                    <div key={player.id} className={`rounded-2xl border overflow-hidden transition-all
                                        ${isElim ? 'opacity-60 border-[var(--border)]'
                                            : isMe ? 'border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                                                : 'border-[var(--border)]'}`}
                                        style={{ background: 'var(--background-card)' }}>

                                        {isElim && <div className="h-0.5 w-full bg-red-500/50" />}
                                        {isLeading && !isElim && <div className="h-0.5 w-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}

                                        <div className="p-3 flex items-center gap-3">
                                            <div className="w-6 text-center shrink-0 text-sm">
                                                {index < 3 && profit > 0 ? medals[index] : <span className="text-xs font-black text-[var(--foreground-subtle)]">{index + 1}</span>}
                                            </div>

                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black overflow-hidden shrink-0 border
                                                ${isLeading ? 'border-emerald-500/50' : isMe ? 'border-amber-500/30' : 'border-[var(--border)]'}`}
                                                style={{ background: 'var(--background-raised)' }}>
                                                {player.profiles?.avatar_url
                                                    ? <img src={player.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    : <span className={isLeading ? 'text-emerald-500' : isMe ? 'text-amber-500' : 'text-[var(--foreground-muted)]'}>
                                                        {player.profiles?.name?.[0]?.toUpperCase()}
                                                    </span>
                                                }
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <span className="font-black text-sm text-[var(--foreground)] truncate">
                                                        <PlayerName user={player.profiles} isChampion={championIds.has(player.player_id)} totalPoints={player.profiles?.total_points} />
                                                    </span>
                                                    {isMe && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full font-black shrink-0">YOU</span>}
                                                    {isLeading && <span className="text-[9px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded-full font-black shrink-0">🥇 LEAD</span>}
                                                    {isElim && Number(player.cash_out) > 0 && <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-full font-black shrink-0">CASH</span>}
                                                    {isElim && Number(player.cash_out) === 0 && <span className="text-[9px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-full font-black shrink-0">BUST</span>}
                                                    {player.profiles?.role === 'admin' && <span className="text-[8px] bg-violet-500/20 text-violet-400 px-1 py-0.5 rounded font-black shrink-0">GM</span>}
                                                </div>
                                                <p className="text-[10px] text-[var(--foreground-subtle)]">
                                                    {Number(player.total_invested).toFixed(1)}€ in · {player.buy_ins} BI{player.rebuys > 0 ? ` + ${player.rebuys} RB` : ''}
                                                    {isElim && ` · Out: ${Number(player.cash_out).toFixed(1)}€`}
                                                </p>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className={`font-black text-base ${profit > 0 ? 'text-emerald-500' : profit < 0 ? 'text-red-500' : 'text-[var(--foreground-muted)]'}`}>
                                                    {profit > 0 ? '+' : ''}{profit.toFixed(1)}€
                                                </p>
                                            </div>
                                        </div>

                                        {canAct && !alreadyCashedOut && (
                                            <div className="px-3 pb-3 space-y-2">
                                                <div className="grid grid-cols-3 gap-2">
                                                    <form action={async () => {
                                                        'use server'
                                                        await addRebuy(eventId, player.player_id)
                                                    }} className="col-span-1">
                                                        <button type="submit" className="w-full py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-[10px] font-black rounded-xl transition-all flex justify-center items-center gap-1 border border-violet-500/20">
                                                            <RotateCcw size={11} /> +RB
                                                        </button>
                                                    </form>

                                                    <form action={async (formData) => {
                                                        'use server'
                                                        const amount = Number(formData.get('amount')) || 0
                                                        await submitCashout(eventId, player.player_id, amount)
                                                    }} className="col-span-1 flex gap-1">
                                                        <input
                                                            name="amount"
                                                            type="number"
                                                            step="0.1"
                                                            min="0.1"
                                                            required
                                                            className="w-full bg-[var(--background-raised)] border border-emerald-500/30 focus:border-emerald-500/60 rounded-xl px-2 py-2 text-[var(--foreground)] font-black text-xs text-center outline-none"
                                                            placeholder="€"
                                                        />
                                                        <button type="submit" className="shrink-0 px-2.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-black text-[10px] transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                                            <CheckCircle size={12} />
                                                        </button>
                                                    </form>

                                                    <form action={async () => {
                                                        'use server'
                                                        await eliminatePlayer(eventId, player.player_id)
                                                    }} className="col-span-1">
                                                        <button type="submit" className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black rounded-xl transition-all flex justify-center items-center gap-1 border border-red-500/20">
                                                            <Skull size={11} /> Bust
                                                        </button>
                                                    </form>
                                                </div>

                                                {player.rebuys > 0 && (
                                                    <form action={async () => {
                                                        'use server'
                                                        await undoRebuy(eventId, player.player_id)
                                                    }}>
                                                        <button type="submit" className="w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-black rounded-xl border border-amber-500/20 transition-all flex justify-center items-center gap-1">
                                                            ↩ Undo Last Rebuy ({player.rebuys} RB)
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        )}

                                        {canAct && alreadyCashedOut && (
                                            <div className="px-3 pb-3 flex items-center gap-2">
                                                <p className="flex-1 text-[10px] text-center text-[var(--foreground-subtle)] font-bold py-1.5 bg-[var(--background-raised)] rounded-xl border border-[var(--border)]">
                                                    {Number(player.cash_out) > 0 ? `✓ Cashed out ${Number(player.cash_out).toFixed(1)}€` : '💀 Busted'}
                                                </p>
                                                <form action={async () => {
                                                    'use server'
                                                    await undoCashout(eventId, player.player_id)
                                                }}>
                                                    <button type="submit" className="py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[10px] font-black rounded-xl border border-amber-500/20 transition-all whitespace-nowrap">
                                                        ↩ Undo {Number(player.cash_out) > 0 ? 'Cashout' : 'Bust'}
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* ── RSVP LIST (UPCOMING OR REFERENCE) ── */}
                {(!isLive || !isCompleted) && (
                    <div className="mb-5">
                        <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users size={12} className="text-amber-500" /> Invited Players
                            </div>
                            <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20 lowercase font-bold tracking-tight">
                                {acceptedCount} accepted
                            </span>
                        </h2>
                        <div className="grid grid-cols-1 gap-2">
                            {sortedRsvpList.map((player) => {
                                const isAccepted = player.status === 'accepted'
                                const isPending = player.status === 'pending'
                                const isDeclined = player.status === 'declined'

                                if (isDeclined) return null // Hide declined for now as per "leaderboard style" request

                                return (
                                    <div key={player.id} className="p-3 bg-[var(--background-card)] border border-[var(--border)] rounded-2xl flex items-center gap-3 transition-all">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black overflow-hidden shrink-0 border border-[var(--border)] bg-[var(--background-raised)]">
                                            {player.avatar_url 
                                                ? <img src={player.avatar_url} alt="" className="w-full h-full object-cover" />
                                                : <span className="text-[var(--foreground-muted)]">{player.name?.[0]?.toUpperCase()}</span>
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-sm text-[var(--foreground)] truncate">
                                                <PlayerName user={player as any} totalPoints={player.total_points} showRankIcon={true} />
                                            </p>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${isAccepted ? 'text-emerald-500' : 'text-amber-500/60'}`}>
                                                {isAccepted ? '✓ Accepted' : '⏳ Pending'}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* ── ADMIN CONTROLS ── */}
                {isAdmin && (
                    <div className="space-y-3 mb-6">
                        {isLive && <AdminAddPlayer eventId={eventId} availablePlayers={availablePlayers as any} />}
                        {isLive && (
                            <Link href={`/admin/events/${eventId}/finalize`}
                                className="flex items-center justify-center gap-2 w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-black text-sm transition-all active:scale-95">
                                <CheckCircle size={16} /> End Session & Calculate Results
                            </Link>
                        )}
                        {!isLive && !isCompleted && (
                            <div className="p-4 rounded-2xl border border-dashed border-amber-500/20 bg-amber-500/5 text-center">
                                <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest mb-1">GM Controls</p>
                                <p className="text-xs text-[var(--foreground-muted)] mb-3">Wait for players to arrive at the table.</p>
                                <Link href="/admin/events" className="inline-block px-4 py-2 bg-amber-500 text-black rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-amber-400 transition-colors">
                                    Manage Event
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
