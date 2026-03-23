import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Trophy, ChevronRight, Lock } from 'lucide-react'
import { PLAYER_RANKS } from '@/lib/playerRanks'

export default async function RanksPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('total_points').eq('id', user.id).single()
    const currentPoints = profile?.total_points || 0

    // Reverse the ranks so we show progression from bottom (Fish) to top (World Champion)
    const progressionRanks = [...PLAYER_RANKS].reverse()

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-25" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-md mx-auto px-4 pt-6 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                            <ChevronLeft size={18} />
                        </Link>
                        <div>
                            <h1 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-wider">Rankings System</h1>
                            <p className="text-[var(--foreground-muted)] text-xs font-medium">Climb the ladder to become a legend</p>
                        </div>
                    </div>
                </div>

                {/* Progress Overview Header */}
                <div className="bg-[var(--background-card)] border border-[var(--border)] rounded-2xl p-5 mb-8 shadow-sm text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
                    <Trophy size={24} className="mx-auto text-amber-500 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground-muted)] mb-1">Your Total XP</p>
                    <h2 className="text-3xl font-black text-[var(--foreground)] tracking-wider">
                        {currentPoints} <span className="text-base text-amber-500">PTS</span>
                    </h2>
                </div>

                {/* Ranks Ladder */}
                <div className="relative pl-6">
                    {/* Vertical line connecting ranks */}
                    <div className="absolute top-4 bottom-4 left-6 border-l-2 border-dashed border-[var(--border)] -translate-x-1/2" />

                    <div className="flex flex-col gap-6">
                        {progressionRanks.map((rank, index) => {
                            const isAchieved = currentPoints >= rank.minPoints
                            const isNext = !isAchieved && (index === 0 || currentPoints >= progressionRanks[index - 1].minPoints)

                            return (
                                <div key={rank.level} className={`relative flex items-center gap-4 transition-all duration-300 ${isAchieved ? 'opacity-100' : isNext ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                                    {/* Icon Box (lies on the line) */}
                                    <div className={`relative z-10 shrink-0 w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl bg-[var(--background-card)] shadow-sm ${isAchieved ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : isNext ? 'border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'border-[var(--border)]'}`}>
                                        {rank.icon}
                                    </div>

                                    {/* Label Box */}
                                    <div className={`flex-1 rounded-xl p-3 border ${isAchieved ? 'bg-amber-500/5 border-amber-500/30' : isNext ? 'bg-sky-500/5 border-sky-500/30' : 'bg-[var(--background-card)] border-[var(--border)]'}`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`font-black uppercase tracking-wide text-sm ${isAchieved ? 'text-amber-500' : isNext ? 'text-sky-400' : 'text-[var(--foreground)]'}`}>
                                                {rank.title}
                                            </span>
                                            {isAchieved ? (
                                                <span className="text-[10px] font-black uppercase bg-amber-500 text-black px-2 py-0.5 rounded-full">Unlocked</span>
                                            ) : isNext ? (
                                                <span className="text-[10px] font-black uppercase bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/30">Next Target</span>
                                            ) : (
                                                <Lock size={12} className="text-[var(--foreground-subtle)]" />
                                            )}
                                        </div>
                                        <div className="text-[11px] font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                                            {rank.level === 1 ? 'Starting Rank' : `${rank.minPoints}+ Points Required`}
                                        </div>

                                        {/* Progress bar for the 'Next' rank */}
                                        {isNext && index > 0 && (
                                            <div className="mt-3">
                                                <div className="flex justify-between text-[10px] font-bold text-[var(--foreground-muted)] uppercase mb-1">
                                                    <span>Progress to {rank.title}</span>
                                                    <span>{currentPoints} / {rank.minPoints}</span>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-[var(--background-raised)] overflow-hidden">
                                                    <div className="h-full rounded-full bg-sky-500 transition-all duration-500" style={{ width: `${Math.min(100, Math.round((currentPoints / rank.minPoints) * 100))}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    )
}
