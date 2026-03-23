import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, Trash2, Edit3, Save, Database, Users, Calendar, Clock, MapPin, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { updateEventDetails } from './actions'
import { getActiveSeasons } from '../../../seasons/actions'
import PlayerEditCard from './PlayerEditCard'
import DeleteEventButton from './DeleteEventButton'
import EventEditForm from './EventEditForm'
import { Sword } from 'lucide-react'

export default async function AdminEditEventPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const eventId = params.id
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/dashboard')

    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

    if (!event) return <div className="p-10 text-[var(--foreground)]">Event not found</div>

    const seasons = await getActiveSeasons()

    const { data: players } = await supabase
        .from('session_players')
        .select(`*, profiles(name, role, avatar_url)`)
        .eq('event_id', eventId)
        .order('placement', { ascending: true })

    const totalPot = players?.reduce((sum, p) => sum + Number(p.total_invested), 0) || 0

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-20" style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-15" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-6xl mx-auto px-4 pt-6 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                            <ArrowLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-wider">Edit Historical Event</h1>
                            <p className="text-[var(--foreground-muted)] text-xs font-medium">Rewriting the history of the Royal Table.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
                    {/* Event Metadata (LEFT COLUMN) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="rounded-[2rem] border border-[var(--border)] p-6 shadow-2xl relative overflow-hidden h-fit"
                            style={{ background: 'var(--background-card)' }}>
                            <div className="flex items-center gap-2 mb-6">
                                <Database size={18} className="text-amber-500" />
                                <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)]">Event Metadata</h2>
                            </div>

                            <EventEditForm event={event} seasons={seasons} />

                            <div className="mt-8 pt-8 border-t border-[var(--border)]">
                                <DeleteEventButton eventId={eventId} />
                            </div>
                        </div>
                    </div>

                    {/* Player Sessions (RIGHT COLUMN) */}
                    <div className="lg:col-span-8 space-y-5">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-sky-400" />
                                <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)]">Combatant Stats</h2>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                                <span className="text-[10px] font-black text-amber-500 uppercase">Pot: {totalPot}€</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            {players?.map((player) => (
                                <PlayerEditCard key={player.id} player={player} eventId={eventId} />
                            ))}

                            {(!players || players.length === 0) && (
                                <div className="p-12 border border-dashed border-[var(--border)] rounded-[2rem] text-center" style={{ background: 'var(--background-card)' }}>
                                    <Users size={32} className="text-[var(--foreground-subtle)] mx-auto mb-3 opacity-20" />
                                    <p className="font-black text-[var(--foreground-muted)] opacity-50 uppercase text-xs tracking-widest">No players found in this session.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
