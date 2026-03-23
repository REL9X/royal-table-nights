'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, DollarSign, Info, ArrowLeft, Sword } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { createEvent } from '../actions'
import { getActiveSeasons } from '../../seasons/actions'
import { motion } from 'framer-motion'

export default function NewEventPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [seasons, setSeasons] = useState<{ id: string, name: string }[]>([])
    const [selectedSeason, setSelectedSeason] = useState<string>('')

    useEffect(() => {
        getActiveSeasons().then(setSeasons)
    }, [])

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full blur-[140px] opacity-20" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-15" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-6 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/admin" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-wider">New Table Night</h1>
                        <p className="text-[var(--foreground-muted)] text-xs font-medium">Gather the combatants for a new battle.</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[2.5rem] border border-[var(--border)] p-6 md:p-10 shadow-2xl relative overflow-hidden"
                    style={{ background: 'var(--background-card)' }}
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Sword size={120} className="transform -rotate-12" />
                    </div>

                    <form action={async (formData) => {
                        setIsSubmitting(true)
                        await createEvent(formData)
                    }} className="space-y-8 relative z-10">

                        <div className="space-y-6">
                            {/* Date & Time Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                        <Calendar size={12} className="text-amber-500" /> Date
                                    </label>
                                    <input
                                        name="date"
                                        type="date"
                                        required
                                        className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-2xl px-5 py-4 text-[var(--foreground)] font-bold transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                        <Clock size={12} className="text-sky-400" /> Time
                                    </label>
                                    <input
                                        name="time"
                                        type="time"
                                        required
                                        className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-2xl px-5 py-4 text-[var(--foreground)] font-bold transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <MapPin size={12} className="text-red-500" /> Location
                                </label>
                                <input
                                    name="location"
                                    type="text"
                                    placeholder="Where's the seat?"
                                    className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-2xl px-5 py-4 text-[var(--foreground)] font-bold placeholder-[var(--foreground-subtle)] transition-all outline-none"
                                />
                            </div>

                            {/* Buy-In & Rebuy Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                        <DollarSign size={12} className="text-emerald-500" /> Buy-In (€)
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="buyInAmount"
                                            type="number"
                                            min="1"
                                            step="1"
                                            required
                                            placeholder="10"
                                            className="w-full bg-emerald-500/5 border border-emerald-500/20 focus:border-emerald-500/50 rounded-2xl px-5 py-4 text-emerald-500 font-black transition-all outline-none"
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500/50 font-black">€</span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                        <DollarSign size={12} className="text-amber-500" /> Rebuy (€)
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="rebuyAmount"
                                            type="number"
                                            min="1"
                                            step="1"
                                            required
                                            placeholder="10"
                                            className="w-full bg-amber-500/5 border border-amber-500/20 focus:border-amber-500/50 rounded-2xl px-5 py-4 text-amber-500 font-black transition-all outline-none"
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-amber-500/50 font-black">€</span>
                                    </div>
                                </div>
                            </div>

                            {/* Season Assignment */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <Sword size={12} className="text-indigo-500" /> Season Assignment
                                </label>
                                <select
                                    name="season_id"
                                    value={selectedSeason}
                                    onChange={(e) => setSelectedSeason(e.target.value)}
                                    className={`w-full bg-[var(--background-raised)] border focus:border-amber-500/50 rounded-2xl px-5 py-4 font-bold transition-all outline-none appearance-none cursor-pointer ${selectedSeason ? 'border-amber-500/50 text-amber-500' : 'border-[var(--border)] text-[var(--foreground)]'}`}
                                >
                                    <option value="">⚡ None (Off-Season Tournament)</option>
                                    {seasons.map(s => (
                                        <option key={s.id} value={s.id}>🏆 {s.name}</option>
                                    ))}
                                </select>
                                {selectedSeason ? (
                                    <p className="text-[10px] text-amber-500/80 mt-1 ml-1 font-bold">
                                        ⚠️ This event will count towards the season rankings and leaderboard.
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-[var(--foreground-subtle)] mt-1 ml-1">
                                        Off-season events do not count towards seasonal leaderboards.
                                    </p>
                                )}
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
                                                <input name="pts_per_game" type="number" required defaultValue="10" min="0"
                                                    className="w-full bg-[var(--background-card)] border border-[var(--border)] focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-[var(--foreground)] font-bold outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-[var(--foreground-muted)] mb-1.5 uppercase tracking-wider">Pts per 1€ Profit</label>
                                                <input name="pts_per_euro_profit" type="number" required defaultValue="1" min="0" step="0.1"
                                                    className="w-full bg-[var(--background-card)] border border-[var(--border)] focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-[var(--foreground)] font-bold outline-none transition-all" />
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-indigo-500/20">
                                            <label className="block text-[10px] font-black text-[var(--foreground-muted)] mb-3 uppercase tracking-wider">Game Rank Bonuses</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="text-center">
                                                    <div className="text-[10px] font-bold text-amber-500 mb-1">1st Place</div>
                                                    <input name="pts_1st_place" type="number" required defaultValue="10" min="0"
                                                        className="w-full bg-[var(--background-card)] border border-amber-500/30 focus:border-amber-500/50 rounded-xl px-2 py-2 text-center text-sm font-black text-[var(--foreground)] outline-none" />
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[10px] font-bold text-slate-300 mb-1">2nd Place</div>
                                                    <input name="pts_2nd_place" type="number" required defaultValue="5" min="0"
                                                        className="w-full bg-[var(--background-card)] border border-slate-500/30 focus:border-slate-500/50 rounded-xl px-2 py-2 text-center text-sm font-black text-[var(--foreground)] outline-none" />
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[10px] font-bold text-[#b87333] mb-1">3rd Place</div>
                                                    <input name="pts_3rd_place" type="number" required defaultValue="0" min="0"
                                                        className="w-full bg-[var(--background-card)] border border-[#b87333]/30 focus:border-[#b87333]/50 rounded-xl px-2 py-2 text-center text-sm font-black text-[var(--foreground)] outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Notes */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <Info size={12} className="text-violet-500" /> Additional Notes
                                </label>
                                <textarea
                                    name="notes"
                                    rows={3}
                                    placeholder="Any specific house rules?"
                                    className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-2xl px-5 py-4 text-[var(--foreground)] font-bold placeholder-[var(--foreground-subtle)] transition-all outline-none resize-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-black shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'SCHEDULING BATTLE...' : 'SCHEDULE EVENT'}
                        </button>
                    </form>
                </motion.div>

                <p className="mt-8 text-center text-[var(--foreground-subtle)] text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                    "Fortune is for the brave"
                </p>
            </div>
        </div>
    )
}
