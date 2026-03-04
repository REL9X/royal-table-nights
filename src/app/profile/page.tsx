import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Target, Clock, Trophy, Zap, Star, ChevronLeft } from 'lucide-react'
import { ProfileForm } from './ProfileForm'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) return <div>Profile not found</div>

    const getROI = (p: any) => p.total_invested > 0 ? (Number(p.total_profit) / Number(p.total_invested)) * 100 : 0
    const profit = Number(profile.total_profit) || 0
    const points = profile.total_points || 0

    const statCards = [
        { label: 'Season Points', value: points, unit: 'pts', icon: Trophy, color: 'text-amber-500', bg: 'from-amber-500/20', border: 'border-amber-500/20' },
        { label: 'Net Profit', value: `${profit > 0 ? '+' : ''}${profit.toFixed(0)}`, unit: '€', icon: profit >= 0 ? TrendingUp : TrendingDown, color: profit >= 0 ? 'text-emerald-500' : 'text-red-500', bg: profit >= 0 ? 'from-emerald-500/20' : 'from-red-500/20', border: profit >= 0 ? 'border-emerald-500/20' : 'border-red-500/20' },
        { label: 'Games Played', value: profile.total_sessions_played || 0, unit: '', icon: Zap, color: 'text-sky-400', bg: 'from-sky-500/20', border: 'border-sky-500/20' },
        { label: 'Total ROI', value: getROI(profile).toFixed(1), unit: '%', icon: Target, color: 'text-violet-400', bg: 'from-violet-500/20', border: 'border-violet-500/20' },
        { label: 'Biggest Win', value: `+${profile.biggest_win || 0}`, unit: '€', icon: Star, color: 'text-emerald-400', bg: 'from-emerald-800/20', border: 'border-emerald-900/30' },
        { label: 'Biggest Loss', value: `-${profile.biggest_loss || 0}`, unit: '€', icon: TrendingDown, color: 'text-red-400', bg: 'from-red-800/20', border: 'border-red-900/30' },
    ]

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-5%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-25" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
                <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-15" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-md mx-auto px-4 pt-6 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/dashboard" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                        <ChevronLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-wider">Player Card</h1>
                        <p className="text-[var(--foreground-muted)] text-xs font-medium">Edit your profile & view career stats</p>
                    </div>
                </div>

                {/* Profile Form Card */}
                <div className="rounded-2xl border border-[var(--border)] overflow-hidden mb-5" style={{ background: 'var(--background-card)' }}>
                    <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #f59e0b, #0ea5e9)' }} />
                    <div className="p-5">
                        <ProfileForm initialName={profile.name} initialAvatarUrl={profile.avatar_url} />
                    </div>
                </div>

                {/* Stats */}
                <div>
                    <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-3 flex items-center gap-2">
                        <Trophy size={12} className="text-amber-500" /> Career Stats
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {statCards.map(({ label, value, unit, icon: Icon, color, bg, border }) => (
                            <div key={label} className={`rounded-2xl border ${border} p-4 relative overflow-hidden bg-gradient-to-br ${bg} to-transparent`}>
                                <Icon size={32} className={`absolute top-2 right-2 opacity-15 ${color}`} />
                                <p className={`text-[10px] uppercase font-black tracking-widest mb-1 ${color}`}>{label}</p>
                                <p className="font-black text-2xl text-[var(--foreground)]">
                                    {value}<span className="text-sm font-bold text-[var(--foreground-muted)] ml-0.5">{unit}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
