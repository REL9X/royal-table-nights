'use client'

import { useEffect, useRef } from 'react'
import { getPlayerRank } from '@/lib/playerRanks'
import { NotificationService } from '@/lib/notifications'

interface RankUpNotifierProps {
    currentPoints: number
    enabled?: boolean
}

export default function RankUpNotifier({ currentPoints, enabled = true }: RankUpNotifierProps) {
    const prevPointsRef = useRef<number | null>(null)

    useEffect(() => {
        // First load: just store the initial points
        if (prevPointsRef.current === null) {
            prevPointsRef.current = currentPoints
            return
        }

        // Check for rank change
        const oldRank = getPlayerRank(prevPointsRef.current)
        const newRank = getPlayerRank(currentPoints)

        if (newRank.level > oldRank.level) {
            console.log(`Rank Up detected: ${oldRank.title} -> ${newRank.title}`)
            
            // Trigger celebration notification if enabled
            if (enabled) {
                NotificationService.notifyAchievement(
                    'New Rank Achieved! 🏆',
                    `Congratulations! You have been promoted to ${newRank.icon} ${newRank.title}.`
                )
            }
        }

        // Update ref for next change
        prevPointsRef.current = currentPoints
    }, [currentPoints])

    return null // This component doesn't render anything, it just listens and notifies
}
