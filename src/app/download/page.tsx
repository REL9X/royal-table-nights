'use client'

import { motion } from 'framer-motion'
import { Crown, Smartphone, Apple, Download, ChevronLeft, ShieldCheck, Zap, Bell } from 'lucide-react'
import Link from 'next/link'

export default function DownloadPage() {
    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans relative overflow-hidden flex flex-col items-center justify-center p-4" style={{ background: 'var(--background)' }}>
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-5%] left-[20%] w-[60%] h-[50%] rounded-full blur-[120px] opacity-20" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
                <div className="absolute bottom-[5%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-15" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-2xl w-full relative z-10 flex flex-col items-center">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <Link href="/login" className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-white transition-colors mb-8 group">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10">
                            <ChevronLeft size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Login</span>
                    </Link>

                    <div className="relative mb-6 mx-auto w-fit">
                        <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 animate-pulse" />
                        <div className="relative bg-gradient-to-br from-amber-400 to-amber-600 p-5 rounded-[2.5rem] shadow-2xl skew-y-3 transform">
                            <Crown className="w-10 h-10 text-black" />
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4 uppercase leading-none">
                        GET THE <span className="text-amber-500">EXPERIENCE</span>
                    </h1>
                    <p className="text-[var(--foreground-muted)] text-xs font-bold uppercase tracking-[0.2em] opacity-60 max-w-xs mx-auto leading-relaxed">
                        Transform your mobile device into a high-stakes tracking station.
                    </p>
                </motion.div>

                {/* Platforms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12">
                    {/* Android Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-[2.5rem] p-8 bg-[var(--background-card)] border border-white/5 backdrop-blur-md relative overflow-hidden group shadow-2xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-white uppercase tracking-tight">Android</h3>
                                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Native APK</p>
                            </div>
                        </div>

                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2 text-[10px] text-white/60 font-medium tracking-tight">
                                <ShieldCheck size={14} className="text-emerald-500" /> Fast & Optimized Performance
                            </li>
                            <li className="flex items-center gap-2 text-[10px] text-white/60 font-medium tracking-tight">
                                <Bell size={14} className="text-emerald-500" /> Native Push Notifications
                            </li>
                            <li className="flex items-center gap-2 text-[10px] text-white/60 font-medium tracking-tight">
                                <Zap size={14} className="text-emerald-500" /> Sideload Directly from Site
                            </li>
                        </ul>

                        <button 
                            onClick={() => alert('Development build coming soon! In the browser context, you should provide the direct .apk link here.')}
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_0_rgb(5,150,105)]"
                        >
                            <Download size={14} /> Download APK
                        </button>
                    </motion.div>

                    {/* iOS Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-[2.5rem] p-8 bg-[var(--background-card)] border border-white/5 backdrop-blur-md relative overflow-hidden group shadow-2xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/20">
                                <Apple size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-white uppercase tracking-tight">iPhone</h3>
                                <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest">PWA / Web App</p>
                            </div>
                        </div>

                        <div className="bg-black/20 p-4 rounded-2xl mb-6 border border-white/5">
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.1em] mb-2">Instructions:</p>
                            <ol className="space-y-3 text-[10px] text-white/80 font-medium tracking-tight list-decimal list-inside">
                                <li>Open this site in <span className="text-sky-400">Safari</span></li>
                                <li>Tap the <span className="font-bold underline">Share Icon</span> at the bottom</li>
                                <li>Select <span className="font-bold border border-white/20 px-1 rounded">Add to Home Screen</span></li>
                            </ol>
                        </div>

                        <Link 
                            href="/"
                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/10 shadow-lg"
                        >
                            <Zap size={14} className="text-amber-500" /> Launch Mobile Site
                        </Link>
                    </motion.div>
                </div>

                {/* Footer Quote */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 1 }}
                    className="text-center"
                >
                    <p className="text-[var(--foreground-subtle)] text-[10px] font-black uppercase tracking-[0.4em]">The Table is Yours</p>
                </motion.div>
            </div>
        </div>
    )
}
