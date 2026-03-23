'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle({ className = '' }: { className?: string }) {
    const { theme, toggle } = useTheme()

    return (
        <button
            onClick={toggle}
            aria-label="Toggle theme"
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300
                bg-[var(--background-card)] hover:bg-[var(--background-raised)]
                text-[var(--foreground-muted)] hover:text-amber-500
                border-2 border-[var(--border)] hover:border-amber-500/40
                shadow-xl active:scale-95 z-[100] ${className}`}
        >
            {theme === 'dark' ? (
                <>
                    <Sun size={20} className="text-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-tighter sm:inline hidden">Light Mode</span>
                </>
            ) : (
                <>
                    <Moon size={20} className="text-sky-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-tighter sm:inline hidden">Dark Mode</span>
                </>
            )}
        </button>
    )
}
