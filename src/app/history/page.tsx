import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar, Users, Trophy, Edit3, Zap, ChevronLeft, Sword } from 'lucide-react'
import Link from 'next/link'

export default async function HistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAdmin = profile?.role === 'admin'

    const { data: events } = await supabase
        .from('events')
        .select(`*, session_players(profit, placement)`)
        .eq('status', 'completed')
        .order('date', { ascending: false })

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20" style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />
                <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-15" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-6 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/dashboard" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                        <ChevronLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-wider">Table History</h1>
                        <p className="text-[var(--foreground-muted)] text-xs font-medium">All nights at the royal table, immortalized.</p>
                    </div>
                    {isAdmin && (
                        <Link href="/admin/events/new" className="ml-auto text-xs font-black bg-amber-500 text-black px-3 py-1.5 rounded-full hover:bg-amber-400 transition-colors">
                            + New
                        </Link>
                    )}
                </div>

                {events && events.length > 0 ? (
                    <div className="space-y-3">
                        {events.map((event, i) => {
                            const playerCount = event.session_players?.length ?? 0
                            const totalPot = playerCount > 0
                                ? event.session_players.reduce((_: number, sp: any) => _ + (Number(sp.profit) < 0 ? Math.abs(Number(sp.profit)) : 0), 0)
                                : 0

                            const colorBars = [
                                'from-amber-500 to-orange-500',
                                'from-sky-500 to-blue-500',
                                'from-violet-500 to-purple-500',
                                'from-emerald-500 to-teal-500',
                                'from-pink-500 to-rose-500',
                            ]
                            const bar = colorBars[i % colorBars.length]

                            return (
                                <div key={event.id} className="group relative rounded-2xl border border-[var(--border)] hover:border-[var(--border-strong)] overflow-hidden transition-all hover:shadow-lg"
                                    style={{ background: 'var(--background-card)' }}>
                                    {/* Colored top bar */}
                                    <div className={`h-1 w-full bg-gradient-to-r ${bar}`} />

                                    {/* Admin edit button — sits above the link */}
                                    {isAdmin && (
                                        <div className="absolute top-3 right-3 z-20">
                                            <Link href={`/admin/events/${event.id}/edit`}
                                                className="p-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black rounded-lg transition-colors block">
                                                <Edit3 size={12} />
                                            </Link>
                                        </div>
                                    )}

                                    {/* Entire card is the link */}
                                    <Link href={`/history/${event.id}`} className="block p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0 pr-10">
                                                <h3 className="font-black text-sm text-[var(--foreground)] group-hover:text-amber-500 transition-colors uppercase tracking-wide truncate">{event.title}</h3>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-[var(--foreground-muted)]">
                                                    <span className="flex items-center gap-1"><Calendar size={10} className="text-amber-500" />{new Date(event.date).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1"><Users size={10} className="text-sky-400" />{playerCount} players</span>
                                                </div>
                                            </div>
                                            <span className="flex items-center gap-1 text-amber-500 text-xs font-black shrink-0">
                                                <Trophy size={12} /> View →
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center" style={{ background: 'var(--background-card)' }}>
                        <Sword size={32} className="text-[var(--foreground-subtle)] mx-auto mb-3" />
                        <p className="font-black text-[var(--foreground-muted)]">No battles recorded yet.</p>
                        <p className="text-xs text-[var(--foreground-subtle)] mt-1">Play your first session to start the log!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
