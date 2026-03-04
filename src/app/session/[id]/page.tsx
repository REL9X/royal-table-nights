import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChevronLeft, PlusCircle, Crown, CheckCircle, TrendingUp, TrendingDown, Zap, DollarSign, Users, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { addRebuy, submitCashout, eliminatePlayer } from './actions'
import PlayerName from '@/components/PlayerName'

export default async function SessionPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const eventId = params.id
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single()
    if (!event) return <div className="p-10 text-[var(--foreground)]">Event not found</div>

    const { data: sessionPlayers } = await supabase
        .from('session_players')
        .select(`*, profiles(name, avatar_url)`)
        .eq('event_id', eventId)
        .order('profit', { ascending: false })

    const mySessionData = sessionPlayers?.find(p => p.player_id === user.id)
    const totalPot = sessionPlayers?.reduce((acc, p) => acc + Number(p.total_invested), 0) || 0
    const isLive = event.status === 'active'
    const isCompleted = event.status === 'completed'
    const isAdmin = profile?.role === 'admin'

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
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <Link href={isCompleted ? '/history' : '/dashboard'}
                            className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                            <ChevronLeft size={18} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-black text-xl text-[var(--foreground)] uppercase tracking-wider">{event.title}</h1>
                                {isLive && (
                                    <span className="text-[10px] font-black bg-emerald-500 text-black px-2 py-0.5 rounded-full animate-pulse">● LIVE</span>
                                )}
                                {isCompleted && (
                                    <span className="text-[10px] font-black bg-[var(--background-raised)] text-[var(--foreground-muted)] border border-[var(--border)] px-2 py-0.5 rounded-full">Ended</span>
                                )}
                            </div>
                            <p className="text-[var(--foreground-muted)] text-xs">{new Date(event.date).toLocaleDateString()} · {event.buy_in_amount}€ buy-in</p>
                        </div>
                    </div>

                    {/* Total Pot */}
                    <div className="text-right">
                        <p className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-wider">Total Pot</p>
                        <p className="text-xl font-black text-amber-500">{totalPot}€</p>
                    </div>
                </div>

                {/* Pot bar visual */}
                <div className="rounded-2xl border border-[var(--border)] p-4 mb-5 flex items-center gap-4" style={{ background: 'var(--background-card)' }}>
                    <div className="flex items-center gap-2 shrink-0">
                        <Users size={14} className="text-sky-400" />
                        <span className="text-sm font-black text-[var(--foreground)]">{sessionPlayers?.length || 0}</span>
                        <span className="text-xs text-[var(--foreground-muted)]">players</span>
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-[var(--border)] overflow-hidden">
                        <div className="h-full rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                            style={{ width: '100%', background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
                    </div>
                    <p className="font-black text-amber-500 text-sm shrink-0">{totalPot}€</p>
                </div>

                {/* Players Grid */}
                <div className="mb-5">
                    <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-3 flex items-center gap-2">
                        <Crown size={12} className="text-amber-500" /> Players
                    </h2>
                    <div className="space-y-2">
                        {sessionPlayers?.map((player, index) => {
                            const profit = Number(player.profit)
                            const isMe = player.player_id === user.id
                            const isElim = player.is_eliminated
                            const isLeading = index === 0 && profit > 0 && !isElim

                            return (
                                <div key={player.id} className={`rounded-2xl border overflow-hidden transition-all ${isElim ? 'opacity-50 border-[var(--border)]' : isMe ? 'border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.1)]' : 'border-[var(--border)]'}`}
                                    style={{ background: 'var(--background-card)' }}>

                                    {/* Eliminated overlay header */}
                                    {isElim && (
                                        <div className="h-0.5 w-full bg-red-500/50" />
                                    )}
                                    {isLeading && !isElim && (
                                        <div className="h-0.5 w-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                    )}

                                    <div className="p-3 flex items-center gap-3">
                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-black overflow-hidden border shrink-0 ${isLeading ? 'border-emerald-500/50' : isMe ? 'border-amber-500/30' : 'border-[var(--border)]'}`}
                                            style={{ background: 'var(--background-raised)' }}>
                                            {player.profiles?.avatar_url
                                                ? <img src={player.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                : <span className={isLeading ? 'text-emerald-500' : isMe ? 'text-amber-500' : 'text-[var(--foreground-muted)]'}>{player.profiles?.name?.[0]?.toUpperCase()}</span>
                                            }
                                        </div>

                                        {/* Name + stats */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <span className="font-black text-sm text-[var(--foreground)] truncate">
                                                    <PlayerName user={player.profiles} />
                                                </span>
                                                {isMe && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full font-black shrink-0">YOU</span>}
                                                {isLeading && <span className="text-[9px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded-full font-black shrink-0">🥇 LEAD</span>}
                                                {isElim && <span className="text-[9px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded-full font-black shrink-0">BUST</span>}
                                            </div>
                                            <p className="text-[10px] text-[var(--foreground-subtle)]">
                                                {player.total_invested}€ in · {player.buy_ins} BI{player.rebuys > 0 ? ` + ${player.rebuys} RB` : ''}
                                                {isElim && player.cash_out !== null ? ` · OUT: ${player.cash_out}€` : ''}
                                            </p>
                                        </div>

                                        {/* Profit */}
                                        <div className="text-right shrink-0">
                                            <p className={`font-black text-base ${profit > 0 ? 'text-emerald-500' : profit < 0 ? 'text-red-500' : 'text-[var(--foreground-muted)]'}`}>
                                                {profit > 0 ? '+' : ''}{profit}€
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action buttons for own row (live only) */}
                                    {!isElim && isLive && (isMe || isAdmin) && (
                                        <div className="px-3 pb-3">
                                            <form action={async () => {
                                                'use server'
                                                await addRebuy(eventId, player.player_id)
                                            }}>
                                                <button type="submit" className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-black rounded-xl transition-all flex justify-center items-center gap-1.5 border border-amber-500/20">
                                                    <PlusCircle size={13} /> Rebuy ({event.rebuy_amount}€)
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Cash Out Section (own player, live) */}
                {isLive && mySessionData && !mySessionData.is_eliminated && (
                    <div className="rounded-2xl border border-emerald-500/30 overflow-hidden mb-4 shadow-[0_0_24px_rgba(16,185,129,0.1)]" style={{ background: 'var(--background-card)' }}>
                        <div className="h-1 w-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <div className="p-4">
                            <h2 className="font-black text-sm uppercase tracking-widest text-[var(--foreground-muted)] mb-4 flex items-center gap-2">
                                <DollarSign size={13} className="text-emerald-500" /> Cash Out
                            </h2>
                            <form action={async (formData) => {
                                'use server'
                                const amount = Number(formData.get('amount')) || 0
                                await submitCashout(eventId, user.id, amount)
                            }} className="flex gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-emerald-500/60 rounded-xl pl-4 pr-10 py-3 text-[var(--foreground)] font-black text-lg outline-none transition-all"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] font-bold">€</span>
                                </div>
                                <button type="submit" className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-black shadow-[0_0_16px_rgba(16,185,129,0.4)] transition-all active:scale-95 flex items-center gap-2">
                                    <CheckCircle size={16} /> Out
                                </button>
                            </form>

                            <form action={async () => {
                                'use server'
                                await eliminatePlayer(eventId, user.id)
                            }} className="mt-3 text-center">
                                <button type="submit" className="text-red-500/70 hover:text-red-400 text-xs font-bold transition-colors flex items-center gap-1 mx-auto">
                                    <AlertTriangle size={11} /> Busted? Cash out 0€
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Admin End Session */}
                {isAdmin && isLive && (
                    <div className="rounded-2xl border border-red-500/20 p-4" style={{ background: 'var(--background-card)' }}>
                        <p className="text-xs text-[var(--foreground-muted)] mb-3 text-center">All players cashed out?</p>
                        <Link href={`/admin/events/${eventId}/finalize`}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl font-black text-sm transition-all active:scale-95">
                            <CheckCircle size={16} /> End Session & Calculate Results
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
