'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{
    theme: Theme
    toggle: () => void
}>({ theme: 'dark', toggle: () => { } })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('dark')

    useEffect(() => {
        const saved = localStorage.getItem('rtn-theme') as Theme | null

        // If no saved pref, use system preference
        let initial: Theme = 'dark'
        if (saved) {
            initial = saved
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            initial = 'light'
        }

        setTheme(initial)
        document.documentElement.classList.remove('dark', 'light')
        document.documentElement.classList.add(initial)

        // Also react to system changes if no saved preference
        const media = window.matchMedia('(prefers-color-scheme: dark)')
        const onSystemChange = (e: MediaQueryListEvent) => {
            if (localStorage.getItem('rtn-theme')) return // user has a manual preference
            const next = e.matches ? 'dark' : 'light'
            setTheme(next)
            document.documentElement.classList.remove('dark', 'light')
            document.documentElement.classList.add(next)
        }
        media.addEventListener('change', onSystemChange)
        return () => media.removeEventListener('change', onSystemChange)
    }, [])

    const toggle = () => {
        setTheme(prev => {
            const next = prev === 'dark' ? 'light' : 'dark'
            localStorage.setItem('rtn-theme', next)
            document.documentElement.classList.remove('dark', 'light')
            document.documentElement.classList.add(next)
            return next
        })
    }

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext)
}
