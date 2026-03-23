import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Save, Crown, Zap, Target, Trophy, CheckCircle } from 'lucide-react'
import { updateSeason, finishSeason, undoFinishSeason } from '../../actions'
import DeleteSeasonButton from './DeleteSeasonButton'
import ConfirmActionForm from '@/components/ConfirmActionForm'

export const dynamic = 'force-dynamic'

export default async function EditSeasonPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/dashboard')

    const { id } = await params
    const { data: season } = await supabase.from('seasons').select('*').eq('id', id).single()

    if (!season) redirect('/admin/seasons')

    // Fetch winner if completed
    let seasonWinner = null
    if (season.status === 'completed') {
        const { data: sPointsData } = await supabase
            .from('session_players')
            .select('player_id, points_earned, events!inner(season_id, status)')
            .eq('events.season_id', season.id)
            .eq('events.status', 'completed')

        const sMap: Record<string, number> = {}
        sPointsData?.forEach((sp: any) => {
            sMap[sp.player_id] = (sMap[sp.player_id] || 0) + (sp.points_earned || 0)
        })
        const rankings = Object.entries(sMap).sort((a, b) => b[1] - a[1])
        if (rankings[0]) {
            const { data: winnerProfile } = await supabase.from('profiles').select('name').eq('id', rankings[0][0]).single()
            seasonWinner = winnerProfile?.name
        }
    }

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            <div className="max-w-xl mx-auto px-4 pt-6 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/admin/seasons" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                        <ChevronLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
                            <Crown className="text-amber-500" size={24} /> Edit Season
                        </h1>
                        <p className="text-[var(--foreground-subtle)] text-xs font-medium">Update rules and point structures</p>
                    </div>
                </div>

                <div className="flex justify-end mb-6">
                    <DeleteSeasonButton seasonId={season.id} />
                </div>

                <form action={async (formData) => { 'use server'; await updateSeason(formData) }} className="space-y-6">
                    <input type="hidden" name="id" value={season.id} />

                    {/* Basic Info */}
                    <div className="p-5 rounded-2xl border border-[var(--border)]" style={{ background: 'var(--background-card)' }}>
                        <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-4">Season Details</h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-[var(--foreground-muted)] mb-1.5 uppercase tracking-wider">Season Name</label>
                                    <input name="name" type="text" required defaultValue={season.name} placeholder="e.g. Season 1"
                                        className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-[var(--foreground-muted)] mb-1.5 uppercase tracking-wider">Max Games</label>
                                    <input name="max_games" type="number" required defaultValue={season.max_games || 10} min="1"
                                        className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-bold" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-[var(--foreground-muted)] mb-1.5 uppercase tracking-wider">Status</label>
                                <select name="status" defaultValue={season.status}
                                    className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-bold appearance-none">
                                    <option value="upcoming">⏳ Upcoming (Not active yet)</option>
                                    <option value="active">🟢 Active (Replaces current season)</option>
                                    <option value="completed">🛑 Completed (Finalizes leaderboards)</option>
                                </select>
                                <p className="text-[10px] text-[var(--foreground-subtle)] mt-1.5 leading-snug">
                                    Warning: Setting to <strong>Completed</strong> will temporarily not trigger end-of-season calculations until we build that logic next.
                                </p>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-[var(--foreground-muted)] mb-1.5 uppercase tracking-wider">Season Note</label>
                                <textarea name="theme_note" rows={3} defaultValue={season.theme_note || ''} placeholder="e.g. Mexican Night tonight, rules, etc."
                                    className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-bold resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* Points Configuration */}
                    <div className="p-5 rounded-2xl border border-amber-500/20 relative overflow-hidden" style={{ background: 'var(--background-card)' }}>
                        {/* Subtle Background Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

                        <h2 className="font-black text-xs uppercase tracking-widest text-amber-500/80 mb-4 flex items-center gap-2">
                            <Target size={14} /> Rule Configuration
                        </h2>

                        <div className="space-y-5">
                            {/* Base Points */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-1.5 text-[10px] font-black text-[var(--foreground-muted)] mb-1.5 uppercase tracking-wider">
                                        <Zap size={10} className="text-[#4ade80]" /> Points per Game
                                    </label>
                                    <input name="pts_per_game" type="number" required defaultValue={season.pts_per_game} min="0"
                                        className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-[#4ade80]/50 rounded-xl px-4 py-3 text-lg font-black text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[#4ade80]/20 transition-all" />
                                </div>
                                <div>
                                    <label className="flex items-center gap-1.5 text-[10px] font-black text-[var(--foreground-muted)] mb-1.5 uppercase tracking-wider">
                                        <Target size={10} className="text-[#38bdf8]" /> Pts per 1€ Profit
                                    </label>
                                    <input name="pts_per_euro_profit" type="number" required defaultValue={season.pts_per_euro_profit} min="0" step="0.1"
                                        className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-[#38bdf8]/50 rounded-xl px-4 py-3 text-lg font-black text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]/20 transition-all" />
                                </div>
                            </div>

                            {/* Game Rank Bonuses */}
                            <div className="pt-4 border-t border-[var(--border)]">
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-[var(--foreground-muted)] mb-3 uppercase tracking-wider">
                                    <Trophy size={10} className="text-amber-500" /> Game Rank Bonuses
                                </label>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold text-amber-400 mb-1">1st Place</div>
                                        <input name="pts_1st_place" type="number" required defaultValue={season.pts_1st_place} min="0"
                                            className="w-full bg-amber-500/5 border border-amber-500/20 focus:border-amber-500/50 rounded-xl px-2 py-2 text-center text-sm font-black text-[var(--foreground)] focus:outline-none" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold text-slate-300 mb-1">2nd Place</div>
                                        <input name="pts_2nd_place" type="number" required defaultValue={season.pts_2nd_place} min="0"
                                            className="w-full bg-slate-500/5 border border-slate-500/20 focus:border-slate-500/50 rounded-xl px-2 py-2 text-center text-sm font-black text-[var(--foreground)] focus:outline-none" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold flex items-center justify-center gap-1 text-[#b87333] mb-1">3rd Place</div>
                                        <input name="pts_3rd_place" type="number" required defaultValue={season.pts_3rd_place} min="0"
                                            className="w-full bg-[#b87333]/5 border border-[#b87333]/20 focus:border-[#b87333]/50 rounded-xl px-2 py-2 text-center text-sm font-black text-[var(--foreground)] focus:outline-none" />
                                    </div>
                                </div>
                            </div>

                            {/* End of Season Bonuses */}
                            <div className="pt-4 border-t border-[var(--border)]">
                                <label className="flex items-center gap-1.5 text-[10px] font-black text-[var(--foreground-muted)] mb-3 uppercase tracking-wider">
                                    <Crown size={10} className="text-[#a78bfa]" /> End-of-Season Bonuses
                                </label>
                                <p className="text-[9px] text-[var(--foreground-subtle)] mb-3">Awarded to players based on their final ranking when the season is marked as Completed.</p>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold text-amber-500 mb-1">1st Place</div>
                                        <input name="pts_season_1st" type="number" required defaultValue={season.pts_season_1st || 500} min="0"
                                            className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-xl px-2 py-2 text-center text-sm font-black text-[var(--foreground)] focus:outline-none" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold text-slate-300 mb-1">2nd Place</div>
                                        <input name="pts_season_2nd" type="number" required defaultValue={season.pts_season_2nd || 250} min="0"
                                            className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-slate-500/50 rounded-xl px-2 py-2 text-center text-sm font-black text-[var(--foreground)] focus:outline-none" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold text-[#b87333] mb-1">3rd Place</div>
                                        <input name="pts_season_3rd" type="number" required defaultValue={season.pts_season_3rd || 100} min="0"
                                            className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-[#b87333]/50 rounded-xl px-2 py-2 text-center text-sm font-black text-[var(--foreground)] focus:outline-none" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold text-[var(--foreground-muted)] mb-1">4th Place</div>
                                        <input name="pts_season_4th" type="number" required defaultValue={season.pts_season_4th || 50} min="0"
                                            className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-indigo-500/50 rounded-xl px-2 py-2 text-center text-sm font-black text-[var(--foreground)] focus:outline-none" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold text-[var(--foreground-muted)] mb-1">5th Place</div>
                                        <input name="pts_season_5th" type="number" required defaultValue={season.pts_season_5th || 50} min="0"
                                            className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-indigo-500/50 rounded-xl px-2 py-2 text-center text-sm font-black text-[var(--foreground)] focus:outline-none" />
                                    </div>
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold text-[var(--foreground-muted)] mb-1">Participation</div>
                                        <input name="pts_season_participation" type="number" required defaultValue={season.pts_season_participation || 10} min="0"
                                            className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-emerald-500/50 rounded-xl px-2 py-2 text-center text-sm font-black text-[var(--foreground)] focus:outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                        <Save size={18} /> Save Changes
                    </button>
                </form>

                {/* Advanced Actions */}
                <div className="mt-8 pt-8 border-t border-[var(--border)]">
                    <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-4 flex items-center gap-2">
                        <Zap size={14} className="text-emerald-500" /> End of Season
                    </h2>
                    <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                        <h3 className="font-black text-sm text-[var(--foreground)] mb-1">Finalize Season</h3>
                        <p className="text-[10px] text-[var(--foreground-subtle)] mb-5 max-w-sm">
                            This will instantly calculate final standings, distribute End-of-Season RP bonuses, award Championship badges to the winner, and mark this season as Completed.
                        </p>

                        {season.status === 'completed' ? (
                            <div className="space-y-6">
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-amber-500 font-black text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 w-fit">
                                        <Trophy size={14} /> Winner: {seasonWinner || 'TBD'}
                                    </div>
                                    <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest">
                                        Season {season.name} is over. New season coming soon!
                                    </p>
                                </div>
                                <ConfirmActionForm
                                    action={async (formData) => { 'use server'; await undoFinishSeason(season.id) }}
                                    confirmMessage="Are you sure you want to undo the finalization? This will revoke the distributed RP and Badges, and set the season back to Active."
                                >
                                    <button type="submit" className="w-full px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95">
                                        <Zap size={14} /> Undo Finalization
                                    </button>
                                </ConfirmActionForm>
                            </div>
                        ) : (
                            <ConfirmActionForm
                                action={async (formData) => { 'use server'; await finishSeason(season.id) }}
                                confirmMessage="Are you sure you want to finalize this season? This will calculate final standings, distribute End-of-Season RP bonuses, award Championship badges, and lock the season."
                            >
                                <button type="submit" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                    <Trophy size={14} /> Distribute Rewards & Finalize
                                </button>
                            </ConfirmActionForm>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
