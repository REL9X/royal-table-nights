import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Plus, Crown, Calendar as CalendarIcon, Zap, Target, Trophy } from 'lucide-react'

export default async function SeasonsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/dashboard')

    // Fetch all seasons, sorted by newest first
    const { data: seasons } = await supabase
        .from('seasons')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            <div className="max-w-4xl mx-auto px-4 pt-6 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-8">
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                            <ChevronLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
                                <Crown className="text-amber-500" size={24} /> Seasons
                            </h1>
                            <p className="text-[var(--foreground-subtle)] text-xs font-medium">Manage rules and active periods</p>
                        </div>
                    </div>

                    <Link href="/admin/seasons/new" className="hidden sm:flex px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black text-sm uppercase tracking-widest items-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        <Plus size={16} /> New Season
                    </Link>
                </div>

                {/* Active Seasons */}
                {seasons && seasons.length > 0 ? (
                    <>
                        <h2 className="font-black text-sm uppercase tracking-widest text-[var(--foreground-muted)] mb-4">Current Active Season</h2>
                        <div className="grid gap-4 md:grid-cols-2 mb-10">
                            {seasons.filter(s => s.status === 'active').map(season => {
                                const statusConfig = {
                                    upcoming: { label: 'Upcoming', className: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
                                    active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
                                    completed: { label: 'Completed', className: 'bg-[var(--background-card)] text-[var(--foreground-muted)] border-[var(--border)]' },
                                }
                                const sc = statusConfig[season.status as keyof typeof statusConfig] || statusConfig.upcoming
                                const isActive = season.status === 'active'

                                return (
                                    <div key={season.id} className={`rounded-2xl border p-5 transition-all ${isActive ? 'border-amber-500/30 bg-amber-500/5' : 'border-[var(--border)] bg-[var(--background-card)] hover:border-[var(--border-strong)]'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h2 className="font-black text-xl text-[var(--foreground)]">{season.name}</h2>
                                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[var(--foreground-subtle)] font-mono">
                                                    <CalendarIcon size={10} /> Created {new Date(season.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${sc.className}`}>
                                                {sc.label}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mb-4">
                                            <Link href={`/admin/seasons/${season.id}/edit`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--background-raised)] hover:bg-amber-500/10 border border-[var(--border)] hover:border-amber-500/30 text-[var(--foreground-muted)] hover:text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors">
                                                Edit Season <ChevronLeft size={12} className="rotate-180" />
                                            </Link>
                                        </div>

                                        {/* Rules Snapshot */}
                                        <div className="bg-black/30 rounded-xl p-3 border border-[var(--border)]">
                                            <div className="text-[9px] font-black text-[var(--foreground-muted)] mb-2 uppercase tracking-widest">Points Structure</div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Zap size={12} className={isActive ? "text-[#4ade80]" : "text-[var(--foreground-muted)]"} />
                                                    <div className="text-xs font-black">{season.pts_per_game} <span className="text-[9px] text-[var(--foreground-subtle)] font-normal uppercase">per game</span></div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Target size={12} className={isActive ? "text-[#38bdf8]" : "text-[var(--foreground-muted)]"} />
                                                    <div className="text-xs font-black">{season.pts_per_euro_profit} <span className="text-[9px] text-[var(--foreground-subtle)] font-normal uppercase">per 1€</span></div>
                                                </div>
                                            </div>

                                            <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <Trophy size={10} className={isActive ? "text-amber-500" : "text-[var(--foreground-muted)]"} />
                                                    <span className="text-[9px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">Rank</span>
                                                </div>
                                                <div className="flex gap-2 text-xs font-black">
                                                    <span className={isActive ? "text-amber-400" : "text-[var(--foreground-muted)]"}>1st: +{season.pts_1st_place}</span>
                                                    <span className={isActive ? "text-slate-300" : "text-[var(--foreground-muted)]"}>2nd: +{season.pts_2nd_place}</span>
                                                    <span className={isActive ? "text-[#b87333]" : "text-[var(--foreground-muted)]"}>3rd: +{season.pts_3rd_place}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {seasons.filter(s => s.status === 'active').length === 0 && (
                                <div className="col-span-full rounded-2xl border border-dashed border-[var(--border)] p-8 text-center" style={{ background: 'var(--background-card)' }}>
                                    <p className="text-[var(--foreground-subtle)] font-bold mb-1 uppercase tracking-widest text-xs">No Active Season</p>
                                </div>
                            )}
                        </div>

                        <h2 className="font-black text-sm uppercase tracking-widest text-[var(--foreground-muted)] mb-4 mt-8">Past & Upcoming Seasons</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {seasons.filter(s => s.status !== 'active').map(season => {
                                const statusConfig = {
                                    upcoming: { label: 'Upcoming', className: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
                                    completed: { label: 'Completed', className: 'bg-[var(--background-card)] text-[var(--foreground-muted)] border-[var(--border)]' },
                                }
                                const sc = statusConfig[season.status as keyof typeof statusConfig] || statusConfig.upcoming

                                return (
                                    <div key={season.id} className="rounded-2xl border p-5 transition-all border-[var(--border)] bg-[var(--background-card)] hover:border-[var(--border-strong)] opacity-90">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h2 className="font-black text-lg text-[var(--foreground)]">{season.name}</h2>
                                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[var(--foreground-subtle)] font-mono">
                                                    <CalendarIcon size={10} /> Created {new Date(season.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${sc.className}`}>
                                                {sc.label}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mb-4">
                                            <Link href={`/admin/seasons/${season.id}/edit`} className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--background-raised)] hover:bg-amber-500/10 border border-[var(--border)] hover:border-amber-500/30 text-[var(--foreground-muted)] hover:text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors">
                                                Edit Season <ChevronLeft size={12} className="rotate-180" />
                                            </Link>
                                        </div>

                                        {/* Rules Snapshot */}
                                        <div className="bg-black/20 rounded-xl p-3 border border-[var(--border)] grayscale">
                                            <div className="grid grid-cols-2 gap-2 mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Zap size={10} className="text-[var(--foreground-muted)]" />
                                                    <div className="text-[10px] font-black">{season.pts_per_game} <span className="font-normal uppercase">/ game</span></div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Target size={10} className="text-[var(--foreground-muted)]" />
                                                    <div className="text-[10px] font-black">{season.pts_per_euro_profit} <span className="font-normal uppercase">/ 1€</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {seasons.filter(s => s.status !== 'active').length === 0 && (
                                <div className="col-span-full rounded-2xl border border-dashed border-[var(--border)] p-6 text-center" style={{ background: 'var(--background-card)' }}>
                                    <p className="text-[var(--foreground-subtle)] font-bold mb-1 uppercase tracking-widest text-[10px]">No Past or Upcoming Seasons</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center" style={{ background: 'var(--background-card)' }}>
                        <Crown size={32} className="text-amber-500/50 mx-auto mb-3" />
                        <p className="text-[var(--foreground)] font-bold mb-1">No Seasons Found</p>
                        <p className="text-sm text-[var(--foreground-subtle)] max-w-sm mx-auto">Create your first season to start tracking games and customized leaderboards.</p>
                        <Link href="/admin/seasons/new" className="inline-flex mt-6 px-6 py-2.5 bg-amber-500 text-black rounded-xl font-black text-sm uppercase tracking-widest items-center gap-2 transition-all">
                            <Plus size={16} /> Create Initial Season
                        </Link>
                    </div>
                )}

                {/* Mobile FAB */}
                <div className="fixed bottom-20 right-4 sm:hidden z-50">
                    <Link href="/admin/seasons/new" className="flex items-center justify-center w-14 h-14 bg-amber-500 text-black rounded-full shadow-[0_5px_20px_rgba(245,158,11,0.4)] active:scale-95 transition-transform">
                        <Plus size={24} strokeWidth={3} />
                    </Link>
                </div>
            </div>
        </div>
    )
}
