'use client'
import React from 'react'

import { motion } from 'framer-motion'
import { Crown, Smartphone, Apple, Download, ChevronLeft, ShieldCheck, Zap, Bell } from 'lucide-react'
import Link from 'next/link'


export default function DownloadPage() {
    const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
    const [isInstalled, setIsInstalled] = React.useState(false)

    React.useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
        }
        window.addEventListener('beforeinstallprompt', handler)

        const appInstalledHandler = () => {
            setIsInstalled(true)
            setDeferredPrompt(null)
        }
        window.addEventListener('appinstalled', appInstalledHandler)

        // Check if already in standalone mode
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
            window.removeEventListener('appinstalled', appInstalledHandler)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // If prompt is not available, just navigate home or show a message
            window.location.href = '/'
            return
        }
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === 'accepted') {
            setDeferredPrompt(null)
        }
    }

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

                    <Link href="/login" className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors mb-8 group">
                        <div className="w-8 h-8 rounded-lg bg-[var(--background-raised)] flex items-center justify-center border border-[var(--border)] group-hover:bg-[var(--border)] transition-all">
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

                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[var(--foreground)] mb-4 uppercase leading-none">
                        GET THE <span className="text-amber-500">EXPERIENCE</span>
                    </h1>
                    <p className="text-[var(--foreground-muted)] text-xs font-bold uppercase tracking-[0.2em] opacity-80 max-w-xs mx-auto leading-relaxed">
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
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <Smartphone size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-[var(--foreground)] uppercase tracking-tight">Android</h3>
                                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Instant App / PWA</p>
                            </div>
                        </div>

                        <div className="bg-[var(--background-raised)]/50 p-4 rounded-2xl mb-6 border border-[var(--border)]">
                            <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.1em] mb-2">Instructions:</p>
                            <ol className="space-y-3 text-[10px] text-[var(--foreground)] font-medium tracking-tight list-decimal list-inside">
                                {isInstalled ? (
                                    <li className="text-emerald-600 dark:text-emerald-400 font-black italic underline decoration-emerald-500/30">APP IS ALREADY INSTALLED! 🤘</li>
                                ) : (
                                    <>
                                        <li>Tap <span className="text-emerald-600 dark:text-emerald-400 font-bold italic">LAUNCH INSTANT APP</span> below</li>
                                        <li>Or open <span className="text-emerald-600 dark:text-emerald-400">Chrome</span> Settings ⋮</li>
                                        <li>Select <span className="font-bold border border-[var(--border)] px-1 rounded">Install App</span></li>
                                    </>
                                )}
                            </ol>
                        </div>

                        <button 
                            onClick={handleInstallClick}
                            disabled={isInstalled}
                            className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_0_rgb(5,150,105)] ${isInstalled ? 'bg-emerald-500/20 text-emerald-500/50 cursor-not-allowed shadow-none' : 'bg-emerald-500 hover:bg-emerald-400 text-black'}`}
                        >
                            {isInstalled ? (
                                <ShieldCheck size={14} />
                            ) : (
                                <Zap size={14} />
                            )}
                            {isInstalled ? 'Installed & Ready' : 'Launch Instant App'}
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
                            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
                                <Apple size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-xl text-[var(--foreground)] uppercase tracking-tight">iPhone</h3>
                                <p className="text-[9px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">PWA / Web App</p>
                            </div>
                        </div>

                        <div className="bg-[var(--background-raised)]/50 p-4 rounded-2xl mb-6 border border-[var(--border)]">
                            <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-[0.1em] mb-2">Instructions:</p>
                            <ol className="space-y-3 text-[10px] text-[var(--foreground)] font-medium tracking-tight list-decimal list-inside">
                                <li>Open this site in <span className="text-sky-600 dark:text-sky-400 italic font-bold">Safari</span></li>
                                <li>Tap the <span className="font-bold underline text-sky-600 dark:text-sky-400">Share Icon</span> at the bottom</li>
                                <li>Select <span className="font-bold border border-[var(--border)] px-1 rounded italic">Add to Home Screen</span></li>
                            </ol>
                        </div>

                        <Link 
                            href="/"
                            className="w-full py-4 bg-[var(--background-raised)] hover:bg-[var(--border)] text-[var(--foreground)] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 border border-[var(--border)] shadow-lg"
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
