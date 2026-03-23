'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { deleteSeason } from '../../actions'

export default function DeleteSeasonButton({ seasonId }: { seasonId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteSeason(seasonId)
            if (result && 'error' in result) {
                alert(result.error)
                setIsDeleting(false)
                setShowConfirm(false)
            } else if (result && 'success' in result) {
                // Success: hard refresh to clear any Next.js client-side cache
                window.location.href = '/admin/seasons'
            }
        } catch (error) {
            console.error("Failed to delete", error)
            alert("An unexpected error occurred while deleting the season.")
            setIsDeleting(false)
            setShowConfirm(false)
        }
    }

    if (showConfirm) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="w-full max-w-sm bg-[var(--background-card)] border border-red-500/30 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 mb-4 text-red-500">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="font-black text-lg uppercase tracking-wider text-[var(--foreground)]">Dangerous Action</h3>
                    </div>

                    <div className="space-y-3 mb-6">
                        <p className="text-sm font-bold text-[var(--foreground)]">
                            Are you sure you want to delete this season?
                        </p>
                        <ul className="text-xs text-[var(--foreground-muted)] space-y-2 list-disc pl-4 font-medium leading-relaxed">
                            <li>All <span className="text-amber-500 font-bold">Championship Badges</span> awarded for this season will be revoked.</li>
                            <li>Players' <span className="text-amber-500 font-bold">Win Records</span> will be permanently removed.</li>
                            <li><span className="text-amber-500 font-bold">Season Bonus Points</span> will be deducted from player totals.</li>
                            <li>This action <span className="text-red-500 font-bold uppercase">cannot be undone</span>.</li>
                        </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setShowConfirm(false)}
                            disabled={isDeleting}
                            className="px-4 py-3 bg-[var(--background-raised)] hover:bg-[var(--border)] text-[var(--foreground)] border border-[var(--border)] rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-4 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Forever'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold transition-all text-xs active:scale-95"
        >
            <Trash2 size={14} /> Delete Season
        </button>
    )
}
