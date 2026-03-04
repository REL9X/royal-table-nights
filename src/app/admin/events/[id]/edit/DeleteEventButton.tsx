'use client'

import { useState, useTransition } from 'react'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { deleteEvent } from './actions'

export default function DeleteEventButton({ eventId }: { eventId: string }) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [isPending, startTransition] = useTransition()

    const handleConfirm = () => {
        startTransition(async () => {
            await deleteEvent(eventId)
        })
    }

    if (showConfirm) {
        return (
            <div className="bg-red-950/60 border border-red-700/60 rounded-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-400 mt-0.5 shrink-0" size={20} />
                    <div>
                        <p className="font-bold text-red-300 text-sm">Delete this event permanently?</p>
                        <p className="text-red-400/80 text-xs mt-1">This will remove all session data and recalculate every player&apos;s stats. This cannot be undone.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleConfirm}
                        disabled={isPending}
                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Trash2 size={16} />
                        {isPending ? 'Deleting...' : 'Yes, Delete Forever'}
                    </button>
                    <button
                        onClick={() => setShowConfirm(false)}
                        disabled={isPending}
                        className="px-4 py-2.5 bg-[var(--background-raised)] hover:bg-[var(--border-strong)] text-[var(--foreground-muted)] rounded-xl font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <X size={16} /> Cancel
                    </button>
                </div>
            </div>
        )
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-3 bg-red-950/40 hover:bg-red-900/60 text-red-500 border border-red-900/50 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
            <Trash2 size={18} /> DANGER: Delete Entire Event
        </button>
    )
}
