import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Check, Users, Play, Calendar as CalendarIcon, Phone, Trash2, Plus, Edit3, ChevronLeft, Crown, Shield, Zap, Settings } from 'lucide-react'
import { approvePlayer, addAllowedPhone, removeAllowedPhone } from './actions'
import { startSession } from './events/actions'
import Link from 'next/link'
import PlayerName from '@/components/PlayerName'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/dashboard')

    const { data: pendingPlayers } = await supabase.from('profiles').select('*').eq('is_approved', false).neq('role', 'admin').order('created_at', { ascending: false })
    const { data: events } = await supabase.from('events').select('*, event_responses(id)').order('date', { ascending: true })
    const { data: allowedPhones } = await supabase.from('allowed_phones').select('*').order('created_at', { ascending: false })

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-5%] left-[20%] w-[60%] h-[50%] rounded-full blur-[120px] opacity-20" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
                <div className="absolute bottom-[5%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-15" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-6 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/dashboard" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                        <ChevronLeft size={18} />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-wider">GM Panel</h1>
                            <span className="text-[10px] font-black bg-amber-500 text-black px-2 py-0.5 rounded-full">ADMIN</span>
                        </div>
                        <p className="text-[var(--foreground-muted)] text-xs font-medium">Manage players, invites & events</p>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                        { icon: Users, label: 'Pending', value: pendingPlayers?.length || 0, color: 'text-amber-500', bg: 'from-amber-500/15', border: 'border-amber-500/20' },
                        { icon: CalendarIcon, label: 'Events', value: events?.length || 0, color: 'text-sky-400', bg: 'from-sky-500/15', border: 'border-sky-500/20' },
                        { icon: Phone, label: 'Invited', value: allowedPhones?.length || 0, color: 'text-violet-400', bg: 'from-violet-500/15', border: 'border-violet-500/20' },
                    ].map(({ icon: Icon, label, value, color, bg, border }) => (
                        <div key={label} className={`rounded-2xl border ${border} p-3 bg-gradient-to-br ${bg} to-transparent text-center`}>
                            <Icon size={18} className={`${color} mx-auto mb-1`} />
                            <p className="font-black text-xl text-[var(--foreground)]">{value}</p>
                            <p className="text-[10px] font-bold text-[var(--foreground-muted)] uppercase tracking-wide">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Pending Approvals */}
                <section className="mb-6">
                    <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-3 flex items-center gap-2">
                        <Users size={12} className="text-amber-500" /> Pending Approvals
                        {(pendingPlayers?.length ?? 0) > 0 && (
                            <span className="bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full">{pendingPlayers?.length}</span>
                        )}
                    </h2>

                    {pendingPlayers && pendingPlayers.length > 0 ? (
                        <div className="space-y-2">
                            {pendingPlayers.map((player) => (
                                <div key={player.id} className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--border)] animate-in fade-in" style={{ background: 'var(--background-card)' }}>
                                    <div className="w-10 h-10 rounded-xl bg-[var(--background-raised)] flex items-center justify-center font-black text-base text-[var(--foreground-muted)] border border-[var(--border)] shrink-0">
                                        {player.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <PlayerName user={player} isClickable={true} className="font-black text-sm text-[var(--foreground)] truncate block" />
                                        <p className="text-xs text-[var(--foreground-subtle)]">Requesting access</p>
                                    </div>
                                    <form action={async () => { 'use server'; await approvePlayer(player.id) }}>
                                        <button type="submit" className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black flex items-center justify-center transition-all font-black border border-emerald-500/20">
                                            <Check size={15} />
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[var(--border)] p-6 text-center" style={{ background: 'var(--background-card)' }}>
                            <Shield size={24} className="text-[var(--foreground-subtle)] mx-auto mb-2" />
                            <p className="text-sm text-[var(--foreground-subtle)] font-medium">All clear — no pending players.</p>
                        </div>
                    )}
                </section>

                {/* Allowed Phones (Invites) */}
                <section className="mb-6">
                    <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-3 flex items-center gap-2">
                        <Phone size={12} className="text-violet-400" /> Player Invites
                    </h2>

                    <div className="rounded-2xl border border-[var(--border)] p-4 mb-3" style={{ background: 'var(--background-card)' }}>
                        <form action={async (formData) => { 'use server'; await addAllowedPhone(formData) }} className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-[var(--foreground-muted)] mb-1.5 uppercase tracking-wider">Player Name</label>
                                    <input name="name" type="text" required placeholder="Phil Ivey"
                                        className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-xl px-3 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-[var(--foreground-muted)] mb-1.5 uppercase tracking-wider">Mobile Number</label>
                                    <div className="flex bg-[var(--background-raised)] border border-[var(--border)] rounded-xl focus-within:border-amber-500/50 overflow-hidden transition-all">
                                        <div className="px-3 py-2.5 text-xs text-[var(--foreground-muted)] font-mono border-r border-[var(--border)] bg-[var(--background-card)]">+351</div>
                                        <input name="phone" type="tel" required pattern="[0-9]{9}" maxLength={9} placeholder="9XX XXX XXX"
                                            className="flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none font-mono tracking-wider" />
                                    </div>
                                </div>
                            </div>
                            <button suppressHydrationWarning type="submit" className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95">
                                <Plus size={16} /> Send Invite
                            </button>
                        </form>
                    </div>

                    {allowedPhones && allowedPhones.length > 0 ? (
                        <div className="space-y-2">
                            {allowedPhones.map(person => (
                                <div key={person.phone} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)]" style={{ background: 'var(--background-card)' }}>
                                    <div>
                                        <p className="font-black text-sm text-[var(--foreground)]">{person.name}</p>
                                        <p className="text-xs text-[var(--foreground-subtle)] font-mono">{person.phone}</p>
                                    </div>
                                    <form action={async () => { 'use server'; await removeAllowedPhone(person.phone) }}>
                                        <button type="submit" className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all border border-red-500/20">
                                            <Trash2 size={13} />
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-[var(--border)] p-4 text-center">
                            <p className="text-xs text-[var(--foreground-subtle)]">No invites sent yet.</p>
                        </div>
                    )}
                </section>

                {/* Events Management */}
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] flex items-center gap-2">
                            <Zap size={12} className="text-emerald-500" /> Events
                        </h2>
                        <Link href="/admin/events/new" className="text-xs font-black bg-emerald-500 text-black px-3 py-1.5 rounded-full hover:bg-emerald-400 transition-all active:scale-95">
                            + New Event
                        </Link>
                    </div>

                    {events && events.length > 0 ? (
                        <div className="space-y-2">
                            {events.map(event => {
                                const statusConfig = {
                                    upcoming: { label: 'Upcoming', className: 'bg-sky-500/20 text-sky-400 border border-sky-500/20' },
                                    active: { label: '● LIVE', className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse' },
                                    completed: { label: 'Ended', className: 'bg-[var(--background-raised)] text-[var(--foreground-muted)] border border-[var(--border)]' },
                                }
                                const sc = statusConfig[event.status as keyof typeof statusConfig] ?? statusConfig.upcoming

                                return (
                                    <div key={event.id} className="rounded-2xl border border-[var(--border)] p-4 transition-all hover:border-[var(--border-strong)]" style={{ background: 'var(--background-card)' }}>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-black text-sm text-[var(--foreground)] truncate">{event.title}</h3>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 ${sc.className}`}>{sc.label}</span>
                                                </div>
                                                <p className="text-xs text-[var(--foreground-muted)]">{new Date(event.date).toLocaleDateString()} · {event.time} · {event.event_responses?.length || 0} RSVPs</p>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <Link href={`/admin/events/${event.id}/edit`} className="p-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black rounded-xl transition-all border border-amber-500/20">
                                                    <Edit3 size={14} />
                                                </Link>
                                                {event.status === 'active' || event.status === 'completed' ? (
                                                    <Link href={`/session/${event.id}`} className="px-3 py-2 bg-[var(--background-raised)] border border-[var(--border)] text-[var(--foreground)] rounded-xl text-xs font-black hover:bg-[var(--border)] transition-all">
                                                        View
                                                    </Link>
                                                ) : (
                                                    <form action={async () => { 'use server'; await startSession(event.id) }}>
                                                        <button type="submit" className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black transition-all active:scale-95 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                                                            <Play size={12} fill="currentColor" /> Start
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center" style={{ background: 'var(--background-card)' }}>
                            <CalendarIcon size={28} className="text-[var(--foreground-subtle)] mx-auto mb-2" />
                            <p className="text-sm text-[var(--foreground-subtle)]">No events scheduled yet.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
