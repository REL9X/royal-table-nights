'use client'

import { useState } from 'react'
import { Save, Sword } from 'lucide-react'
import { updateEventDetails } from './actions'
import { motion } from 'framer-motion'

export default function EventEditForm({ event, seasons }: { event: any, seasons: any[] }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedSeason, setSelectedSeason] = useState<string>(event.season_id || '')

    return (
        <form action={async (formData) => {
            setIsSubmitting(true)
            await updateEventDetails(event.id, formData)
            setIsSubmitting(false)
        }} className="space-y-5">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1">Title</label>
                <input name="title" defaultValue={event.title} required className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-xl px-4 py-3 text-[var(--foreground)] font-bold transition-all outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1">Date</label>
                    <input name="date" type="date" defaultValue={event.date} required className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-xl px-4 py-3 text-[var(--foreground)] font-bold transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1">Time</label>
                    <input name="time" type="time" defaultValue={event.time} required className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-xl px-4 py-3 text-[var(--foreground)] font-bold transition-all outline-none" />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1">Location</label>
                <input name="location" defaultValue={event.location || ''} className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-xl px-4 py-3 text-[var(--foreground)] font-bold transition-all outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1">Buy-in (€)</label>
                    <input name="buy_in_amount" type="number" step="1" min="1" defaultValue={event.buy_in_amount} required className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-xl px-4 py-3 text-emerald-500 font-black transition-all outline-none" />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1">Rebuy (€)</label>
                    <input name="rebuy_amount" type="number" step="1" min="1" defaultValue={event.rebuy_amount} required className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-xl px-4 py-3 text-amber-500 font-black transition-all outline-none" />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                    <Sword size={12} className="text-indigo-500" /> Season Assignment
                </label>
                <select
                    name="season_id"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-xl px-4 py-3 text-[var(--foreground)] font-bold transition-all outline-none appearance-none cursor-pointer"
                >
                    <option value="">None (Off-Season Tournament)</option>
                    {event.season_id && !seasons.some((s: any) => s.id === event.season_id) && (
                        <option value={event.season_id}>Archived Season</option>
                    )}
                    {seasons.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>

            {/* Conditional Tournament Rules */}
            {selectedSeason === '' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 overflow-hidden"
                >
                    <h2 className="font-black text-xs uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
                        <Sword size={14} /> Tournament Point Rules
                    </h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-[var(--foreground-muted)] mb-1.5 uppercase tracking-wider">Points per Game</label>
                                <input name="pts_per_game" type="number" required defaultValue={event.pts_per_game ?? 10} min="0"
                                    className="w-full bg-[var(--background-card)] border border-[var(--border)] focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-[var(--foreground)] font-bold outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[var(--foreground-muted)] mb-1.5 uppercase tracking-wider">Pts per 1€ Profit</label>
                                <input name="pts_per_euro_profit" type="number" required defaultValue={event.pts_per_euro_profit ?? 1} min="0" step="0.1"
                                    className="w-full bg-[var(--background-card)] border border-[var(--border)] focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-[var(--foreground)] font-bold outline-none transition-all" />
                            </div>
                        </div>

                        <div className="pt-3 border-t border-indigo-500/20">
                            <label className="block text-[10px] font-black text-[var(--foreground-muted)] mb-3 uppercase tracking-wider">Game Rank Bonuses</label>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center">
                                    <div className="text-[10px] font-bold text-amber-500 mb-1">1st Place</div>
                                    <input name="pts_1st_place" type="number" required defaultValue={event.pts_1st_place ?? 10} min="0"
                                        className="w-full bg-[var(--background-card)] border border-amber-500/30 focus:border-amber-500/50 rounded-xl px-2 py-2 text-center text-sm font-black text-[var(--foreground)] outline-none" />
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-bold text-slate-300 mb-1">2nd Place</div>
                                    <input name="pts_2nd_place" type="number" required defaultValue={event.pts_2nd_place ?? 5} min="0"
                                        className="w-full bg-[var(--background-card)] border border-slate-500/30 focus:border-slate-500/50 rounded-xl px-2 py-2 text-center text-sm font-black text-[var(--foreground)] outline-none" />
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-bold text-[#b87333] mb-1">3rd Place</div>
                                    <input name="pts_3rd_place" type="number" required defaultValue={event.pts_3rd_place ?? 0} min="0"
                                        className="w-full bg-[var(--background-card)] border border-[#b87333]/30 focus:border-[#b87333]/50 rounded-xl px-2 py-2 text-center text-sm font-black text-[var(--foreground)] outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1">Notes</label>
                <textarea name="notes" rows={3} defaultValue={event.notes || ''} className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-xl px-4 py-3 text-[var(--foreground)] font-bold transition-all outline-none resize-none" />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50">
                <Save size={16} /> {isSubmitting ? 'Saving...' : 'Save Metadata'}
            </button>
        </form>
    )
}
