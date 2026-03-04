'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, DollarSign, Info, ArrowLeft, Sword } from 'lucide-react'
import Link from 'next/link'
import { createEvent } from '../actions'
import { motion } from 'framer-motion'

export default function NewEventPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

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
                                            min="0"
                                            step="0.01"
                                            required
                                            placeholder="10.00"
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
                                            min="0"
                                            step="0.01"
                                            required
                                            placeholder="10.00"
                                            className="w-full bg-amber-500/5 border border-amber-500/20 focus:border-amber-500/50 rounded-2xl px-5 py-4 text-amber-500 font-black transition-all outline-none"
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-amber-500/50 font-black">€</span>
                                    </div>
                                </div>
                            </div>

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
