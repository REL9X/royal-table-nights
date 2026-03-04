'use client'

import { useTransition } from 'react'
import { Save, UserMinus, Shield, Coins, TrendingUp, TrendingDown, Target } from 'lucide-react'
import { updateSessionPlayer, removePlayerFromSession } from './actions'

type Profile = {
    name: string | null
    role: string | null
    avatar_url: string | null
}

type Player = {
    id: string
    player_id: string
    buy_ins: number
    rebuys: number
    total_invested: number
    cash_out: number
    profit: number
    placement: number | null
    is_eliminated: boolean
    points_earned: number | null
    profiles: Profile | null
}

export default function PlayerEditCard({ player, eventId }: { player: Player, eventId: string }) {
    const [isPending, startTransition] = useTransition()
    const [isRemoving, startRemoveTransition] = useTransition()

    const name = player.profiles?.name || 'Unknown'
    const isAdmin = player.profiles?.role === 'admin'
    const profit = Number(player.profit)

    const handleUpdate = (formData: FormData) => {
        startTransition(async () => {
            await updateSessionPlayer(eventId, player.player_id, formData)
        })
    }

    const handleRemove = () => {
        startRemoveTransition(async () => {
            await removePlayerFromSession(eventId, player.player_id)
        })
    }

    return (
        <div className="border border-[var(--border)] bg-[var(--background-card)] p-5 rounded-[2rem] relative overflow-hidden group transition-all hover:border-amber-500/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black overflow-hidden border ${isAdmin ? 'border-amber-500/30' : 'border-[var(--border)]'}`}
                        style={{ background: 'var(--background-raised)' }}>
                        {player.profiles?.avatar_url
                            ? <img src={player.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                            : <span className={isAdmin ? 'text-amber-500' : 'text-[var(--foreground-muted)]'}>{name[0]?.toUpperCase()}</span>
                        }
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-sm text-[var(--foreground)] uppercase tracking-wide">
                                {isAdmin && <span className="text-amber-500 mr-1.5">GM</span>}
                                {name.startsWith('GM ') ? name.slice(3) : name}
                            </h3>
                            {player.placement && (
                                <span className="text-[9px] font-black bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase">#{player.placement}</span>
                            )}
                        </div>
                        <p className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest mt-0.5">Player ID: {player.player_id.slice(0, 8)}...</p>
                    </div>
                </div>

                <button
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="text-red-500 hover:bg-red-500 hover:text-white text-[10px] uppercase font-black px-3 py-1.5 rounded-xl border border-red-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                    <UserMinus size={12} /> {isRemoving ? 'REMOVING...' : 'DISCARD'}
                </button>
            </div>

            <form action={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1">Buy-ins</label>
                        <input name="buy_ins" type="number" defaultValue={player.buy_ins} required className="w-full bg-[var(--background-raised)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] font-bold focus:outline-none focus:border-amber-500 transition-colors text-center text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1">Rebuys</label>
                        <input name="rebuys" type="number" defaultValue={player.rebuys} required className="w-full bg-[var(--background-raised)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] font-bold focus:outline-none focus:border-amber-500 transition-colors text-center text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1">Invested (€)</label>
                        <input name="total_invested" type="number" defaultValue={player.total_invested} required className="w-full bg-[var(--background-raised)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] font-bold focus:outline-none focus:border-amber-500 transition-colors text-center text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-emerald-500 uppercase tracking-widest ml-1">Cash Out (€)</label>
                        <input name="cash_out" type="number" defaultValue={player.cash_out} required className="w-full bg-emerald-500/5 border border-emerald-500/30 rounded-xl px-3 py-2 text-emerald-500 font-black focus:outline-none focus:border-emerald-500 transition-colors text-center text-sm shadow-[inset_0_0_10px_rgba(16,185,129,0.05)]" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-[var(--foreground-muted)] uppercase tracking-widest ml-1">Final Rank</label>
                        <input name="placement" type="number" defaultValue={player.placement ?? ''} required className="w-full bg-[var(--background-raised)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)] font-bold focus:outline-none focus:border-amber-500 transition-colors text-center text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-violet-500 uppercase tracking-widest ml-1">Season Points</label>
                        <div className="w-full bg-violet-500/5 border border-violet-500/20 rounded-xl px-3 py-2 text-violet-500 font-bold text-center text-sm">
                            {player.points_earned ?? 0} PTS
                        </div>
                    </div>
                </div>

                <input type="hidden" name="is_eliminated" value={player.is_eliminated ? 'true' : 'false'} />

                <div className="flex justify-between items-center bg-[var(--background-raised)] p-3 rounded-2xl border border-[var(--border)]">
                    <div className="flex items-center gap-2 pl-2">
                        <span className="text-[10px] font-black text-[var(--foreground-muted)] uppercase tracking-widest">Profit:</span>
                        <span className={`font-black text-sm ${profit > 0 ? 'text-emerald-500' : profit < 0 ? 'text-red-500' : 'text-[var(--foreground-subtle)]'}`}>
                            {profit > 0 ? '+' : ''}{profit}€
                        </span>
                    </div>
                    <button type="submit" disabled={isPending} className="py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-black shadow-[0_4px_12px_rgba(245,158,11,0.2)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest">
                        <Save size={14} /> {isPending ? 'STASHING...' : 'STASH CHANGES'}
                    </button>
                </div>
            </form>
        </div>
    )
}
