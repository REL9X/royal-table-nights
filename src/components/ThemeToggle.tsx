'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle({ className = '' }: { className?: string }) {
    const { theme, toggle } = useTheme()

    return (
        <button
            onClick={toggle}
            aria-label="Toggle theme"
            className={`p-2 rounded-full transition-all
                bg-[var(--background-raised)] hover:bg-[var(--border)] 
                text-[var(--foreground-muted)] hover:text-[var(--foreground)]
                border border-[var(--border)] ${className}`}
        >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
    )
}
