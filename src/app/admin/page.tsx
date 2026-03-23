import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Check, Users, Play, Calendar as CalendarIcon, Phone, Trash2, Plus, Edit3, ChevronLeft, Crown, Shield, Zap, ChevronRight, Bell, UserPlus, ShieldPlus, ArrowUpCircle } from 'lucide-react'
import { approvePlayer, addAllowedPhone, removeAllowedPhone, promoteToAdmin } from './actions'
import { startSession } from './events/actions'
import { finishSeason } from './seasons/actions'
import Link from 'next/link'
import PlayerName from '@/components/PlayerName'

import BattleRegistry from './BattleRegistry'
import RealtimeRefresher from '@/components/RealtimeRefresher'
import SystemTesting from './SystemTesting'
import NotificationSettings from '../profile/NotificationSettings'

export default async function AdminPage({
    searchParams
}: {
    searchParams: Promise<{ tab?: string }>
}) {
    const activeTab = (await searchParams).tab || 'events'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/dashboard')

    const { data: pendingPlayers } = await supabase.from('profiles').select('*').eq('is_approved', false).neq('role', 'admin').order('created_at', { ascending: false })
    const { data: allApprovedPlayers } = await supabase.from('profiles').select('*').eq('is_approved', true).order('name', { ascending: true })
    const { data: events } = await supabase.from('events').select('*, event_responses(id)').order('date', { ascending: false }).order('created_at', { ascending: false })
    const { data: allowedPhones } = await supabase.from('allowed_phones').select('*').order('created_at', { ascending: false })
    const { data: allSeasons } = await supabase.from('seasons').select('*').order('created_at', { ascending: false })

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-5%] left-[20%] w-[60%] h-[50%] rounded-full blur-[120px] opacity-20" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
                <div className="absolute bottom-[5%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-15" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-xl mx-auto px-4 pt-6 relative z-10">
                <RealtimeRefresher table="events" />
                <RealtimeRefresher table="profiles" />

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/dashboard" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                        <ChevronLeft size={18} />
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-wider leading-none">GM Panel</h1>
                            <span className="text-[9px] font-black bg-amber-500 text-black px-2 py-0.5 rounded-full">ADMIN</span>
                        </div>
                        <p className="text-[var(--foreground-muted)] text-[10px] uppercase font-black tracking-widest mt-1">Control Center</p>
                    </div>
                </div>

                {/* Main Navigation - Tabbed Style */}
                <div className="flex gap-1 mb-8 p-1 bg-black/20 rounded-xl border border-white/5 backdrop-blur-sm">
                    <Link
                        href="/admin?tab=events"
                        className={`flex-1 py-2.5 text-center rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'events'
                            ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 shadow-lg'
                            : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                            }`}
                    >
                        Events
                    </Link>
                    <Link
                        href="/admin?tab=players"
                        className={`flex-1 py-2.5 text-center rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'players'
                            ? 'text-violet-400 bg-violet-400/10 border border-violet-400/20 shadow-lg'
                            : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                            }`}
                    >
                        Players
                    </Link>
                    <Link
                        href="/admin?tab=notifications"
                        className={`flex-1 py-2.5 text-center rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'notifications'
                            ? 'text-sky-400 bg-sky-400/10 border border-sky-400/20 shadow-lg'
                            : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
                            }`}
                    >
                        Logic
                    </Link>
                </div>

                {/* ── CONTENT AREA ── */}
                {activeTab === 'players' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Pending Approvals */}
                        <div className="mb-10">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-[var(--foreground-muted)] mb-1 flex items-center gap-2 px-1">
                                Pending Registration Approvals
                                {(pendingPlayers?.length ?? 0) > 0 && (
                                    <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">{pendingPlayers?.length}</span>
                                )}
                            </h3>
                            <p className="text-[10px] text-[var(--foreground-muted)] px-1 mb-4">Players who registered manually and need you to approve their access.</p>

                            {pendingPlayers && pendingPlayers.length > 0 ? (
                                <div className="space-y-3">
                                    {pendingPlayers.map((player) => (
                                        <div key={player.id} className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--border)] bg-[var(--background-card)] shadow-md transition-all hover:border-violet-500/30">
                                            <div className="w-12 h-12 rounded-2xl border-2 border-white/5 bg-[var(--background-raised)] flex items-center justify-center font-black text-xl text-violet-400 shrink-0">
                                                {player.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <PlayerName user={player} isClickable={true} className="font-black text-base text-[var(--foreground)] truncate block" />
                                                <p className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest mt-0.5">Awaiting GM Action</p>
                                            </div>
                                            <form action={async () => { 'use server'; await approvePlayer(player.id) }}>
                                                <button type="submit" className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black flex items-center justify-center transition-all border border-emerald-500/20 shadow-lg">
                                                    <Check size={20} />
                                                </button>
                                            </form>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-dashed border-white/5 p-10 text-center bg-black/10">
                                    <Shield size={32} className="text-white/10 mx-auto mb-3" />
                                    <p className="text-[10px] text-[var(--foreground-muted)] font-black uppercase tracking-[0.3em]">Clear records</p>
                                </div>
                            )}
                        </div>

                        {/* Registered Players */}
                        <div className="mb-10">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-[var(--foreground-muted)] mb-1 px-1 flex items-center gap-2">
                                Battle-Ready Players
                                <span className="bg-emerald-500/20 text-emerald-500 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20">{allApprovedPlayers?.length || 0}</span>
                            </h3>
                            <p className="text-[10px] text-[var(--foreground-muted)] px-1 mb-4">Manage roles and details for the active squadron.</p>
                            
                            {allApprovedPlayers && allApprovedPlayers.length > 0 ? (
                                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                                    {allApprovedPlayers.map((player) => (
                                        <div key={player.id} className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-black/20 group hover:border-violet-500/30 transition-all">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--background-raised)] flex items-center justify-center font-black text-xs text-[var(--foreground)] shrink-0 overflow-hidden border border-white/5">
                                                {player.avatar_url ? <img src={player.avatar_url} alt="" className="w-full h-full object-cover" /> : player.name?.[0]?.toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-sm text-[var(--foreground)] tracking-tight truncate uppercase">{player.name}</p>
                                                <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                                    {player.role === 'admin' ? (
                                                        <span className="text-amber-500 flex items-center gap-1"><ShieldPlus size={10} /> Grand Master</span>
                                                    ) : (
                                                        <span className="text-emerald-400/80">Active Warrior</span>
                                                    )}
                                                </p>
                                            </div>
                                            
                                            {player.role !== 'admin' && (
                                                <form action={async () => { 'use server'; await promoteToAdmin(player.id) }}>
                                                    <button type="submit" className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-black shadow-lg shadow-amber-500/10 active:scale-95 transition-all group relative">
                                                        <ShieldPlus size={16} />
                                                        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black text-[8px] font-black uppercase text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">Make Admin</span>
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-dashed border-white/5 p-6 text-center bg-black/10">
                                    <p className="text-[10px] text-[var(--foreground-muted)] font-black uppercase tracking-[0.3em]">No registered players yet</p>
                                </div>
                            )}
                        </div>

                        {/* Player Invites Form */}
                        <div className="mb-10">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-[var(--foreground-muted)] mb-1 px-1 flex items-center gap-2">
                                Mobile Deployment Invites
                                <span className="bg-sky-500/20 text-sky-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-sky-500/20">{allowedPhones?.length || 0}</span>
                            </h3>
                            <p className="text-[10px] text-[var(--foreground-muted)] px-1 mb-4">You can pre-approve phone numbers here. When these players sign up, they will show up in your pending list for final approval.</p>
                            <div className="rounded-2xl border border-white/5 p-5 mb-6 bg-black/20 backdrop-blur-sm">
                                <form action={async (formData) => { 'use server'; await addAllowedPhone(formData) }} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input name="name" type="text" required placeholder="Agent Name"
                                            className="w-full bg-black/40 border border-white/5 focus:border-violet-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none transition-all font-bold" />
                                        <div className="flex bg-black/40 border border-white/5 rounded-xl focus-within:border-violet-500/50 overflow-hidden transition-all">
                                            <div className="px-3 py-3 text-[10px] text-white/40 font-mono border-r border-white/5 bg-black/20 flex items-center">+351</div>
                                            <input name="phone" type="tel" required pattern="[0-9]{9}" maxLength={9} placeholder="9XX XXX XXX"
                                                className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-white/20 focus:outline-none font-mono tracking-widest" />
                                        </div>
                                    </div>
                                    <button suppressHydrationWarning type="submit" className="w-full py-3 bg-violet-500 hover:bg-violet-400 text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_0_rgb(109,40,217)]">
                                        <Plus size={14} /> Send Invite
                                    </button>
                                </form>
                            </div>

                            <div className="space-y-2">
                                {allowedPhones && allowedPhones.slice(0, 5).map(person => (
                                    <div key={person.phone} className="flex items-center justify-between p-3 px-4 rounded-xl border border-white/5 bg-white/5 group transition-all hover:bg-white/10">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-xs text-white tracking-tight truncate">{person.name}</p>
                                            <p className="text-[9px] text-white/40 font-mono tracking-widest leading-none mt-1">{person.phone}</p>
                                        </div>
                                        <form action={async () => { 'use server'; await removeAllowedPhone(person.phone) }}>
                                            <button type="submit" className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all opacity-40 group-hover:opacity-100">
                                                <Trash2 size={14} />
                                            </button>
                                        </form>
                                    </div>
                                ))}
                                {allowedPhones && allowedPhones.length > 5 && (
                                    <details className="group">
                                        <summary className="text-center text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest pt-2 cursor-pointer list-none hover:text-[var(--foreground)] transition-colors py-2">
                                            <span className="group-open:hidden">+{allowedPhones.length - 5} More Active Invites</span>
                                            <span className="hidden group-open:inline">Hide Active Invites</span>
                                        </summary>
                                        <div className="space-y-2 mt-2 border-t border-white/5 pt-2">
                                            {allowedPhones.slice(5).map(person => (
                                                <div key={person.phone} className="flex items-center justify-between p-3 px-4 rounded-xl border border-white/5 bg-white/5 group/row transition-all hover:bg-white/10">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-xs text-white tracking-tight truncate">{person.name}</p>
                                                        <p className="text-[9px] text-white/40 font-mono tracking-widest leading-none mt-1">{person.phone}</p>
                                                    </div>
                                                    <form action={async () => { 'use server'; await removeAllowedPhone(person.phone) }}>
                                                        <button type="submit" className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all opacity-40 group-hover/row:opacity-100">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </form>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                )}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'notifications' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
                        {/* GM Notification Tools */}
                        <SystemTesting />

                        {/* Admin's Personal Preferences */}
                        <div className="pt-4 border-t border-white/5">
                            <NotificationSettings 
                                initialPrefs={profile.notification_preferences || {
                                    all_enabled: true,
                                    new_games: true,
                                    season_results: true,
                                    rank_ups: true,
                                    reminders: true
                                }} 
                            />
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

                        {/* Quick Action Header */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                            <Link href="/admin/seasons/new" className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all group shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0">
                                        <Crown size={20} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-black text-sm text-white group-hover:text-amber-500 transition-colors uppercase tracking-tight leading-none">Initialize Season</h4>
                                        <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1.5 truncate">Season Ops</p>
                                    </div>
                                </div>
                            </Link>
                            <Link href="/admin/seasons" className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all group shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0">
                                        <Shield size={20} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-black text-sm text-white group-hover:text-amber-500 transition-colors uppercase tracking-tight leading-none">Seasons</h4>
                                        <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1.5 truncate">Browse Archive</p>
                                    </div>
                                </div>
                            </Link>
                            <Link href="/admin/events/new" className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.3)] shrink-0">
                                        <Plus size={20} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h4 className="font-black text-sm text-white group-hover:text-emerald-500 transition-colors uppercase tracking-tight leading-none">New Game</h4>
                                        <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mt-1.5 truncate">Deploy Battle</p>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Season Management Section */}
                        {allSeasons?.filter(s => s.status === 'active').map(s => (
                            <div key={s.id} className="mb-10">
                                <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-[var(--foreground-muted)] mb-4 px-1 flex items-center gap-2">
                                    <Shield size={12} className="text-amber-500" /> Season Management
                                </h3>
                                <div className="p-6 rounded-[2rem] border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-transparent shadow-2xl backdrop-blur-md relative overflow-hidden group">
                                    {/* Glass reflection */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                    <div className="flex items-center gap-4 mb-6 relative z-10">
                                        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black shadow-[0_0_20px_rgba(245,158,11,0.4)] shrink-0">
                                            <Crown size={28} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                <h4 className="font-black text-xl text-amber-500 uppercase tracking-widest truncate leading-none">{s.name}</h4>
                                            </div>
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Active War Campaign</p>
                                        </div>
                                    </div>

                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                                        <Link
                                            href={`/admin/seasons/${s.id}/edit`}
                                            className="flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg"
                                        >
                                            <Edit3 size={14} /> Edit Rules
                                        </Link>
                                        <form action={async () => { 'use server'; await finishSeason(s.id) }}>
                                            <button
                                                type="submit"
                                                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-[0_5px_0_rgb(180,83,9)] flex items-center justify-center gap-2"
                                            >
                                                <Zap size={14} className="fill-black" /> Finish Season
                                            </button>
                                        </form>
                                    </div>
                                    <p className="mt-4 text-[9px] font-black text-white/20 uppercase tracking-[0.2em] text-center italic">
                                        Ending season will distribute points and badges to all participants.
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Expandable Register */}
                        <div className="mb-6">
                            <BattleRegistry
                                seasonGroups={(() => {
                                    const seasonEvs = events?.filter(e => e.season_id).slice() || []
                                    const grouped = new Map<string, { id: string; name: string; events: { id: string; node: React.ReactNode }[] }>()
                                    for (const event of seasonEvs) {
                                        const season = allSeasons?.find(s => s.id === event.season_id)
                                        const sid = event.season_id as string
                                        if (!grouped.has(sid)) grouped.set(sid, { id: sid, name: season?.name ?? 'Unknown Season', events: [] })
                                        grouped.get(sid)!.events.push({ id: event.id, node: <EventRow key={event.id} event={event} startSession={startSession} compact /> })
                                    }
                                    return Array.from(grouped.values()).map(g => ({ seasonId: g.id, seasonName: g.name, events: g.events.map(e => e.node), count: g.events.length }))
                                })()}
                                offSeasonEvents={(events?.filter(e => !e.season_id).slice() || []).map(event => ({
                                    id: event.id,
                                    node: <EventRow key={event.id} event={event} startSession={startSession} compact />
                                }))}
                                offSeasonCount={events?.filter(e => !e.season_id).length || 0}
                            />
                        </div>

                        <div className="text-center pt-4">
                            <Link href="/admin/seasons" className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] hover:text-white transition-colors">
                                Browse Archive <ChevronRight size={12} className="inline ml-1" />
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function EventRow({ event, startSession, compact }: { event: any, startSession: any, compact?: boolean }) {
    const statusConfig = {
        upcoming: { label: 'Upcoming', className: 'bg-sky-500/20 text-sky-400 border border-sky-500/20' },
        active: { label: '● LIVE', className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse' },
        completed: { label: 'Ended', className: 'bg-white/5 text-white/30 border border-white/5' },
    }
    const sc = statusConfig[event.status as keyof typeof statusConfig] ?? statusConfig.upcoming

    if (compact) {
        return (
            <div className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5 transition-colors group">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-black text-xs text-white truncate uppercase tracking-tight italic group-hover:text-emerald-400 transition-colors leading-none">{event.title}</h3>
                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${sc.className} uppercase tracking-widest`}>{sc.label}</span>
                    </div>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                        <CalendarIcon size={9} /> {new Date(event.date).toLocaleDateString()}
                        <span className="text-sky-400/50 ml-2 flex items-center gap-1"><Users size={9} /> {event.event_responses?.length || 0}</span>
                    </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/admin/events/${event.id}/edit`} className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all">
                        <Edit3 size={12} />
                    </Link>
                    {event.status === 'active' ? (
                        <Link href={`/admin/events/${event.id}/finalize`} className="px-3 h-7 rounded-lg bg-emerald-500 text-black font-black text-[8px] uppercase tracking-widest flex items-center justify-center transition-all shadow-[0_2px_0_rgb(5,150,105)] hover:scale-105 active:scale-95">
                            FINISH
                        </Link>
                    ) : event.status === 'upcoming' ? (
                        <form action={async () => { 'use server'; await startSession(event.id) }}>
                            <button type="submit" className="px-3 h-7 rounded-lg bg-sky-500 text-black font-black text-[8px] uppercase tracking-widest flex items-center justify-center transition-all shadow-[0_2px_0_rgb(14,165,233)] hover:scale-105 active:scale-95">
                                START
                            </button>
                        </form>
                    ) : (
                        <Link href={`/history/${event.id}`} className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all">
                            <ChevronRight size={12} />
                        </Link>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-2xl border border-white/5 p-4 transition-all bg-white/5 hover:bg-white/10 group backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-black text-sm text-white truncate uppercase tracking-tight italic group-hover:text-emerald-400 transition-colors leading-none">{event.title}</h3>
                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${sc.className} uppercase tracking-widest`}>{sc.label}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-black text-white/30 uppercase tracking-widest leading-none">
                        <span className="flex items-center gap-1"><CalendarIcon size={10} /> {new Date(event.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1 text-sky-400/50">
                            <Users size={10} /> {event.event_responses?.length || 0} RSVPs
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <Link href={`/admin/events/${event.id}/edit`} className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all">
                        <Edit3 size={14} />
                    </Link>
                    {event.status === 'active' ? (
                        <Link href={`/admin/events/${event.id}/finalize`} className="px-4 h-8 rounded-lg bg-emerald-500 text-black font-black text-[9px] uppercase tracking-widest flex items-center justify-center transition-all shadow-[0_3px_0_rgb(5,150,105)] hover:scale-105 active:scale-95">
                            FINISH
                        </Link>
                    ) : event.status === 'upcoming' ? (
                        <form action={async () => { 'use server'; await startSession(event.id) }}>
                            <button type="submit" className="px-4 h-8 rounded-lg bg-sky-500 text-black font-black text-[9px] uppercase tracking-widest flex items-center justify-center transition-all shadow-[0_3px_0_rgb(14,165,233)] hover:scale-105 active:scale-95">
                                START
                            </button>
                        </form>
                    ) : (
                        <Link href={`/history/${event.id}`} className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all">
                            <ChevronRight size={14} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
