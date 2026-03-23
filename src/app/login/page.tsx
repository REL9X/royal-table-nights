'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { loginWithPin, signupWithPin } from './actions'
import { Crown, AlertCircle, Spade, Heart, Club, Diamond, Smartphone } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'

function SubmitButton({ pendingText, text }: { pendingText: string, text: string }) {
    const { pending } = useFormStatus()

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full py-4 mt-4 bg-amber-500 hover:bg-amber-400 text-black rounded-2xl font-black shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest text-sm"
        >
            {pending ? pendingText : text}
            {!pending && (
                <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                    &rarr;
                </motion.span>
            )}
        </button>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[var(--background)] flex items-center justify-center"><Crown className="text-amber-500 animate-pulse w-12 h-12" /></div>}>
            <LoginContent />
        </Suspense>
    )
}

function LoginContent() {
    const searchParams = useSearchParams()

    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState<string | null>(searchParams.get('error'))
    const [savedPhone, setSavedPhone] = useState('')

    useEffect(() => {
        const stored = localStorage.getItem('royal_table_phone')
        if (stored) setSavedPhone(stored)
    }, [])

    async function handleAuth(formData: FormData) {
        setError(null)
        if (isLogin) {
            const res = await loginWithPin(formData)
            if (res?.error) setError(res.error)
        } else {
            const res = await signupWithPin(formData)
            if (res?.error) setError(res.error)
        }
    }

    return (
        <div className="min-h-screen text-[var(--foreground)] flex flex-col justify-center items-center p-4 overflow-hidden relative font-sans" style={{ background: 'var(--background)' }}>
            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[60%] rounded-full blur-[140px] opacity-25" style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[140px] opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-sm"
            >
                <div className="flex flex-col items-center mb-10">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 animate-pulse" />
                        <div className="relative bg-gradient-to-br from-amber-400 to-amber-600 p-4 rounded-[2rem] shadow-2xl rotate-3 transform">
                            <Crown className="w-12 h-12 text-black" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-black tracking-tighter text-[var(--foreground)] mb-2 uppercase text-center leading-none">
                        ROYAL<br /><span className="text-amber-500">TABLE</span>
                    </h1>

                    <div className="flex gap-4 text-amber-500/40 mb-4">
                        <Spade size={14} />
                        <Heart size={14} />
                        <Club size={14} />
                        <Diamond size={14} />
                    </div>

                    <p className="text-[var(--foreground-muted)] text-[10px] font-black tracking-[0.3em] uppercase opacity-60">High Stakes Tracker</p>
                </div>

                <div className="rounded-[2.5rem] border border-[var(--border)] p-8 shadow-2xl relative overflow-hidden"
                    style={{ background: 'var(--background-card)', backdropFilter: 'blur(20px)' }}>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold"
                        >
                            <AlertCircle size={16} />
                            <p>{error}</p>
                        </motion.div>
                    )}

                    <div className="flex mb-8 bg-[var(--background-raised)] p-1.5 rounded-2xl border border-[var(--border)] relative z-10 gap-1">
                        <button
                            onClick={() => { setIsLogin(true); setError(null); }}
                            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-widest ${isLogin ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(null); }}
                            className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-widest ${!isLogin ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'}`}
                        >
                            Signup
                        </button>
                    </div>

                    <form action={handleAuth} className="space-y-5 relative z-10">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                    exit={{ opacity: 0, height: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <label className="block text-[10px] font-black text-[var(--foreground-muted)] mb-1.5 ml-1 uppercase tracking-widest">Player Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        maxLength={12}
                                        required={!isLogin}
                                        className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-2xl px-5 py-4 text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all font-bold"
                                        placeholder="Username"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="block text-[10px] font-black text-[var(--foreground-muted)] mb-1.5 ml-1 uppercase tracking-widest">Mobile Number</label>
                            <div className="flex bg-[var(--background-raised)] border border-[var(--border)] focus-within:border-amber-500/50 rounded-2xl transition-all font-mono overflow-hidden focus-within:ring-4 focus-within:ring-amber-500/10">
                                <div className="px-5 py-4 bg-[var(--border)]/30 text-[var(--foreground-muted)] font-black border-r border-[var(--border)] flex items-center shrink-0 text-sm">
                                    +351
                                </div>
                                <input
                                    name="phone"
                                    type="tel"
                                    required
                                    pattern="[0-9]{9}"
                                    maxLength={9}
                                    value={savedPhone}
                                    onChange={(e) => {
                                        setSavedPhone(e.target.value)
                                        localStorage.setItem('royal_table_phone', e.target.value)
                                    }}
                                    className="w-full bg-transparent px-5 py-4 text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none font-black tracking-widest"
                                    placeholder="900000000"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-[var(--foreground-muted)] mb-1.5 ml-1 uppercase tracking-widest">6-Digit PIN</label>
                            <input
                                name="pin"
                                type="password"
                                required
                                inputMode="numeric"
                                pattern="[0-9]*"
                                minLength={6}
                                maxLength={6}
                                className="w-full bg-[var(--background-raised)] border border-[var(--border)] focus:border-amber-500/50 rounded-2xl px-5 py-4 text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all text-center tracking-[0.8em] font-black text-2xl"
                                placeholder="••••••"
                            />
                        </div>

                        <SubmitButton pendingText={isLogin ? 'CONNECTING...' : 'REGISTERING...'} text={isLogin ? 'ENTER BATTLE' : 'JOIN TABLE'} />
                    </form>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 1 }}
                    className="flex flex-col items-center gap-6 mt-10"
                >
                    <p className="text-center text-[var(--foreground-subtle)] text-[10px] font-bold uppercase tracking-widest px-8 leading-relaxed italic">
                        "The card player must learn that once he has made a bet, it is no longer his."
                    </p>
                    
                    <Link href="/download" className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:text-[var(--foreground)] transition-all group">
                        <Smartphone size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--foreground-muted)] group-hover:text-[var(--foreground)]">Download Mobile App</span>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    )
}
