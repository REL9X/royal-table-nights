'use client'

import { useState, useEffect } from 'react'
import { X, Share, PlusSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function IOSInstallPrompt() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
        
        // Target Safari mostly or any browser on iOS (they all use similar webkit engine, but Share button is mostly Safari standard)
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent)

        if (isIOS && !isStandalone && isSafari) {
            const dismissed = localStorage.getItem('rtn-ios-prompt-dismissed')
            if (dismissed) {
                const dismissedTime = parseInt(dismissed, 10)
                const oneWeek = 7 * 24 * 60 * 60 * 1000
                if (Date.now() - dismissedTime < oneWeek) {
                    return // Still dismissed
                }
            }
            
            // Show prompt after a short delay
            const timer = setTimeout(() => setShow(true), 2500)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleDismiss = () => {
        setShow(false)
        localStorage.setItem('rtn-ios-prompt-dismissed', Date.now().toString())
    }

    return (
        <AnimatePresence>
            {show && (
                <motion.div 
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 200, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-6 w-full px-4 z-50 pointer-events-none flex justify-center pb-safe"
                >
                    <div className="bg-[var(--background-card)] border border-[var(--border)] shadow-[0_20px_40px_rgba(0,0,0,0.8)] rounded-3xl p-5 w-full max-w-sm pointer-events-auto relative overflow-hidden">
                        
                        {/* Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />
                        
                        <button 
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 text-[var(--foreground-muted)] hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <div className="flex gap-4 items-start pt-1">
                            <div className="w-12 h-12 shrink-0 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-bold text-2xl shadow-inner border border-amber-400">
                                🃏
                            </div>
                            <div className="flex-1 pr-6">
                                <h3 className="font-black text-[var(--foreground)] tracking-tight text-sm uppercase mb-1">Instala a App</h3>
                                <p className="text-[11px] text-[var(--foreground-muted)] leading-snug font-medium mb-3">
                                    Para receberes notificações dos GMs, instala a app no teu iPhone.
                                </p>
                                
                                <div className="space-y-3 mt-4">
                                    <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">
                                            <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center shrink-0">
                                                <Share size={14} className="text-sky-400" />
                                            </div>
                                            <span>1. Partilhar</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                                                <PlusSquare size={14} className="text-emerald-400" />
                                            </div>
                                            <span>2. Home Screen</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Triangle pointing down */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[var(--background-card)] border-r border-b border-[var(--border)] rotate-45 transform" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
