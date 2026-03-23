'use client'

import { useState, useTransition } from 'react'
import { UserPlus, X, Search, Loader2, Check } from 'lucide-react'
import { addPlayerToSession } from './actions'

interface Profile { id: string; name: string; avatar_url: string | null }

export default function AdminAddPlayer({
    eventId,
    availablePlayers,
}: {
    eventId: string
    availablePlayers: Profile[]
}) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [pending, startTransition] = useTransition()

    const filtered = availablePlayers.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
    )

    const toggle = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const addAll = () => {
        startTransition(async () => {
            await Promise.all([...selected].map(id => addPlayerToSession(eventId, id)))
            setOpen(false)
            setQuery('')
            setSelected(new Set())
        })
    }

    const close = () => { setOpen(false); setQuery(''); setSelected(new Set()) }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400 text-xs font-black transition-all w-full justify-center"
            >
                <UserPlus size={14} /> Add Player to Table
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-3xl border border-[var(--border)] shadow-2xl overflow-hidden"
                        style={{ background: 'var(--background-card)' }}>

                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
                            <div>
                                <p className="font-black text-sm text-[var(--foreground)] uppercase tracking-wider">Add to Table</p>
                                <p className="text-[10px] text-[var(--foreground-muted)]">
                                    {selected.size > 0 ? `${selected.size} selected` : 'Tap to select players'}
                                </p>
                            </div>
                            <button onClick={close} className="p-1.5 rounded-lg bg-[var(--background-raised)] border border-[var(--border)] text-[var(--foreground-muted)]">
                                <X size={14} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 pb-2">
                            <div className="relative mb-3">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" />
                                <input
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="Search player..."
                                    className="w-full bg-[var(--background-raised)] border border-[var(--border)] rounded-xl pl-8 pr-4 py-2.5 text-sm text-[var(--foreground)] font-bold outline-none focus:border-indigo-500/50"
                                />
                            </div>

                            {/* Select all */}
                            {filtered.length > 1 && (
                                <button
                                    onClick={() => {
                                        if (selected.size === filtered.length) setSelected(new Set())
                                        else setSelected(new Set(filtered.map(p => p.id)))
                                    }}
                                    className="text-[10px] font-black text-indigo-400 mb-2 hover:text-indigo-300 transition-colors"
                                >
                                    {selected.size === filtered.length ? '✕ Deselect All' : '✓ Select All'}
                                </button>
                            )}
                        </div>

                        {/* Player list */}
                        <div className="px-4 max-h-56 overflow-y-auto space-y-1.5 pb-4">
                            {availablePlayers.length === 0 ? (
                                <p className="text-center text-xs text-[var(--foreground-muted)] py-6">All approved players are already at the table.</p>
                            ) : filtered.length === 0 ? (
                                <p className="text-center text-xs text-[var(--foreground-muted)] py-4">No players match.</p>
                            ) : filtered.map(p => {
                                const isSelected = selected.has(p.id)
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => toggle(p.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left border ${isSelected ? 'bg-indigo-500/15 border-indigo-500/40' : 'border-transparent hover:bg-[var(--background-raised)] hover:border-[var(--border)]'}`}
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-[var(--background-raised)] border border-[var(--border)] flex items-center justify-center text-xs font-black text-amber-500 overflow-hidden shrink-0">
                                            {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : p.name[0]?.toUpperCase()}
                                        </div>
                                        <span className="font-bold text-sm text-[var(--foreground)] flex-1">{p.name}</span>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-[var(--border)]'}`}>
                                            {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Add button */}
                        <div className="p-4 pt-2 border-t border-[var(--border)]">
                            <button
                                onClick={addAll}
                                disabled={selected.size === 0 || pending}
                                className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2"
                            >
                                {pending ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
                                {pending ? 'Adding...' : `Add ${selected.size > 0 ? `${selected.size} Player${selected.size > 1 ? 's' : ''}` : 'Players'}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
