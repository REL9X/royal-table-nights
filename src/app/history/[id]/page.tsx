import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChevronLeft, Share2, Trophy, Coins, TrendingUp, TrendingDown, Edit3, Target, Users, Zap, Calendar } from 'lucide-react'
import Link from 'next/link'
import PlayerName from '@/components/PlayerName'

export default async function SessionDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const eventId = params.id
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'

    const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single()
    if (!event) return <div className="p-10 text-[var(--foreground)]">Event not found</div>

    const { data: players } = await supabase
        .from('session_players')
        .select(`*, profiles(name, avatar_url)`)
        .eq('event_id', eventId)
        .order('placement', { ascending: true })

    const totalPot = players?.reduce((sum, p) => sum + Number(p.total_invested), 0) || 0

    // WhatsApp Share Generator
    const generateShareText = () => {
        let text = `🃏 *Royal Table — ${new Date(event.date).toLocaleDateString()}*\n\n`
        text += `Buy-in ${event.buy_in_amount}€ | Rebuy ${event.rebuy_amount}€\n`
        text += `Players: ${players?.length}\n`
        text += `Total pot: ${totalPot}€\n\n`

        players?.slice(0, 3).forEach((p, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
            const sign = p.profit >= 0 ? '+' : ''

            let nameStr = p.profiles?.name || '';
            if (nameStr.startsWith('GM ')) nameStr = nameStr.substring(3).trim();
            // We don't need to re-add GM here for the share string unless desired, 
            // but let's keep it clean.
            text += `${medal} ${nameStr} ${sign}${p.profit}€\n`
        })

        if (players && players.length > 3) text += `\n...and ${players.length - 3} others.\n`
        text += `\nGG! ⚔️`
        return encodeURIComponent(text)
    }

    const medals = ['🥇', '🥈', '🥉']

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-25" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
                <div className="absolute bottom-[5%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-20" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-6 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/history" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                            <ChevronLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-wider">{event.title}</h1>
                            <p className="text-[var(--foreground-muted)] text-xs font-medium">{new Date(event.date).toLocaleDateString()} · Battle Results</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <Link href={`/admin/events/${event.id}/edit`} className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 hover:bg-amber-500 hover:text-black transition-all">
                                <Edit3 size={18} />
                            </Link>
                        )}
                        <a
                            href={`https://wa.me/?text=${generateShareText()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all"
                        >
                            <Share2 size={18} />
                        </a>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/20 p-4 rounded-2xl relative overflow-hidden">
                        <Coins className="absolute top-2 right-2 opacity-15 text-amber-500" size={36} />
                        <p className="text-[10px] uppercase font-black tracking-widest mb-1 text-amber-500">Total Pot</p>
                        <p className="font-black text-2xl text-[var(--foreground)]">{totalPot}€</p>
                    </div>
                    <div className="bg-gradient-to-br from-sky-500/20 to-transparent border border-sky-500/20 p-4 rounded-2xl relative overflow-hidden">
                        <Users className="absolute top-2 right-2 opacity-15 text-sky-400" size={36} />
                        <p className="text-[10px] uppercase font-black tracking-widest mb-1 text-sky-400">Combatants</p>
                        <p className="font-black text-2xl text-[var(--foreground)]">{players?.length}</p>
                    </div>
                </div>

                {/* Event Metadata */}
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl px-4 py-3 mb-6 flex items-center justify-around gap-3">
                    <div className="text-center">
                        <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-tighter">Buy-in</p>
                        <p className="font-black text-sm">{event.buy_in_amount}€</p>
                    </div>
                    <div className="w-px h-6 bg-amber-500/20" />
                    <div className="text-center">
                        <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-tighter">Rebuy</p>
                        <p className="font-black text-sm">{event.rebuy_amount}€</p>
                    </div>
                    <div className="w-px h-6 bg-amber-500/20" />
                    <div className="text-center">
                        <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-tighter">Date</p>
                        <p className="font-black text-sm">{new Date(event.date).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })}</p>
                    </div>
                </div>

                {/* Leaderboard */}
                <div className="rounded-2xl border border-[var(--border)] overflow-hidden shadow-2xl" style={{ background: 'var(--background-card)' }}>
                    <div className="px-4 py-3 border-b border-[var(--border)] flex text-[10px] font-black text-[var(--foreground-subtle)] uppercase tracking-wider">
                        <div className="w-10 text-center">Rank</div>
                        <div className="flex-1 ml-3">Player</div>
                        <div className="w-16 text-right">In</div>
                        <div className="w-16 text-right">Out</div>
                        <div className="w-20 text-right">Profit</div>
                    </div>

                    <div className="divide-y divide-[var(--border)]/40">
                        {players?.map((player, index) => {
                            const isMe = player.player_id === user.id
                            const profit = Number(player.profit)
                            const isFirst = index === 0

                            return (
                                <div key={player.id} className={`px-4 py-3.5 flex items-center transition-colors ${isMe ? 'bg-amber-500/5 border-l-2 border-l-amber-500' : 'hover:bg-[var(--background-raised)]'}`}>
                                    <div className="w-10 text-center shrink-0">
                                        {index < 3 ? (
                                            <span className="text-lg">{medals[index]}</span>
                                        ) : (
                                            <span className="text-sm font-black text-[var(--foreground-subtle)]">{index + 1}</span>
                                        )}
                                    </div>

                                    <div className="flex-1 flex items-center gap-3 ml-3 min-w-0">
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black overflow-hidden shrink-0 border border-[var(--border)]`}
                                            style={{ background: 'var(--background-raised)' }}>
                                            {player.profiles?.avatar_url ? <img src={player.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-[var(--foreground-muted)]">{player.profiles?.name?.[0]?.toUpperCase()}</span>}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <PlayerName user={{ ...player.profiles, id: player.player_id }} isClickable={true} className={`font-black text-sm truncate ${isFirst ? 'text-amber-500' : 'text-[var(--foreground)]'}`} />
                                                {isMe && <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full font-black shrink-0">YOU</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-16 text-right text-xs font-bold text-[var(--foreground-muted)]">
                                        {player.total_invested}€
                                    </div>
                                    <div className="w-16 text-right text-xs font-bold text-[var(--foreground-muted)]">
                                        {player.cash_out}€
                                    </div>
                                    <div className={`w-20 text-right font-mono font-black text-sm ${profit > 0 ? 'text-emerald-500' : profit < 0 ? 'text-red-500' : 'text-[var(--foreground-subtle)]'}`}>
                                        {profit > 0 ? '+' : ''}{profit}€
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* GG Message */}
                <div className="mt-8 text-center opacity-30 select-none">
                    <p className="font-black text-lg tracking-widest uppercase italic text-[var(--foreground-muted)]">Good Game</p>
                </div>
            </div>
        </div>
    )
}
