'use client'

import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface LiveTimerProps {
    startedAt: string
    className?: string
}

export default function LiveTimer({ startedAt, className = '' }: LiveTimerProps) {
    const [elapsed, setElapsed] = useState<string>('00:00:00')

    useEffect(() => {
        if (!startedAt) return

        const startTime = new Date(startedAt).getTime()

        const updateTimer = () => {
            const now = Date.now()
            const diffMs = now - startTime

            if (diffMs < 0) {
                setElapsed('00:00:00')
                return
            }

            const totalSeconds = Math.floor(diffMs / 1000)
            const hours = Math.floor(totalSeconds / 3600)
            const minutes = Math.floor((totalSeconds % 3600) / 60)
            const seconds = totalSeconds % 60

            const formatted = [
                hours.toString().padStart(2, '0'),
                minutes.toString().padStart(2, '0'),
                seconds.toString().padStart(2, '0')
            ].join(':')

            setElapsed(formatted)
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [startedAt])

    return (
        <div className={`flex items-center gap-1.5 font-mono font-black ${className}`}>
            <Clock size={14} className="animate-pulse" />
            <span>{elapsed}</span>
        </div>
    )
}
