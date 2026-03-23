'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle({ className = '' }: { className?: string }) {
    const { theme, toggle } = useTheme()

    return (
        <button
            onClick={toggle}
            aria-label="Toggle theme"
            className={`p-2 rounded-xl transition-all duration-300
                bg-[var(--background-card)] hover:bg-[var(--background-raised)]
                text-[var(--foreground-muted)] hover:text-amber-500
                border border-[var(--border)] hover:border-amber-500/30
                active:scale-95 z-[100] ${className}`}
        >
            {theme === 'dark' ? (
                <Sun size={16} className="text-amber-500" />
            ) : (
                <Moon size={16} className="text-sky-500" />
            )}
        </button>
    )
}
