import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AlertTriangle, CheckCircle, ArrowLeft, Coins, Calculator, TrendingUp, Skull } from 'lucide-react'
import Link from 'next/link'
import { finalizeSession } from './actions'
import { motion } from 'framer-motion'

export default async function FinalizeSessionPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const eventId = params.id
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (profile?.role !== 'admin') redirect('/dashboard')

    const { data: event } = await supabase.from('events').select('*').eq('id', eventId).single()
    if (!event || event.status !== 'active') return redirect('/dashboard')

    const { data: players } = await supabase
        .from('session_players')
        .select(`*, profiles(name)`)
        .eq('event_id', eventId)

    const totalPot = players?.reduce((sum, p) => sum + Number(p.total_invested), 0) || 0
    const totalCashOut = players?.reduce((sum, p) => sum + Number(p.cash_out), 0) || 0
    const diff = totalPot - totalCashOut

    const allCashedOutOrEliminated = players?.every(p => p.is_eliminated || Number(p.cash_out) > 0 || Number(p.total_invested) === 0)

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden flex flex-col items-center justify-center p-4" style={{ background: 'var(--background)' }}>
            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full blur-[140px] opacity-20" style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[140px] opacity-20" style={{ background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-md w-full z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl mb-4">
                        <Skull className="text-red-500" size={32} />
                    </div>
                    <h1 className="font-black text-3xl text-[var(--foreground)] uppercase tracking-tighter">End Battle</h1>
                    <p className="text-[var(--foreground-muted)] text-sm font-medium">Finalize the ledger and award the spoils.</p>
                </div>

                <div className="rounded-[2.5rem] border border-[var(--border)] p-6 md:p-8 shadow-2xl relative overflow-hidden"
                    style={{ background: 'var(--background-card)', backdropFilter: 'blur(10px)' }}>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-[var(--background-raised)] p-4 rounded-2xl border border-[var(--border)]">
                            <p className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1">Total Pot</p>
                            <p className="text-xl font-black text-amber-500">{totalPot}€</p>
                        </div>
                        <div className="bg-[var(--background-raised)] p-4 rounded-2xl border border-[var(--border)]">
                            <p className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mb-1">Declared</p>
                            <p className={`text-xl font-black ${diff === 0 ? 'text-emerald-500' : 'text-[var(--foreground)]'}`}>{totalCashOut}€</p>
                        </div>
                    </div>

                    {diff !== 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 flex gap-3 text-amber-500">
                            <Calculator className="shrink-0" size={20} />
                            <div>
                                <p className="font-black text-xs uppercase tracking-tight">Discrepancy: {Math.abs(diff).toFixed(2)}€</p>
                                <p className="text-[10px] font-bold opacity-80 mt-1 leading-relaxed">The pot doesn't match the declared cash outs. Winners will be adjusted to balance the transaction.</p>
                            </div>
                        </div>
                    )}

                    {!allCashedOutOrEliminated && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 text-red-500 text-xs flex gap-3">
                            <AlertTriangle size={20} className="shrink-0" />
                            <p className="font-bold leading-relaxed">Some players haven't cashed out. Their exit value will be counted as 0€.</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <form action={async () => {
                            'use server'
                            await finalizeSession(eventId)
                        }}>
                            <button type="submit" className="w-full py-5 bg-red-500 hover:bg-red-400 text-black rounded-2xl font-black shadow-[0_0_30px_rgba(239,68,68,0.3)] transition-all active:scale-95 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                <CheckCircle size={20} /> Finalize Session
                            </button>
                        </form>

                        <Link href={`/session/${eventId}`} className="w-full py-4 text-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] font-black text-[10px] uppercase tracking-widest block transition-colors">
                            Return to Table
                        </Link>
                    </div>
                </div>

                <p className="mt-8 text-center text-[var(--foreground-subtle)] text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                    "GG NO RE"
                </p>
            </div>
        </div>
    )
}
