'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { NotificationService } from '@/lib/notifications'

interface EventRealtimeNotifierProps {
    preferences?: {
        new_games: boolean
        season_results: boolean
    }
}

export default function EventRealtimeNotifier({ preferences }: EventRealtimeNotifierProps) {
    const supabase = createClient()
    
    // Default to true if not provided (fallback)
    const canNotifyNewGames = preferences?.new_games ?? true
    const canNotifySeasonResults = preferences?.season_results ?? true

    useEffect(() => {
        const channel = supabase
            .channel('event-alerts')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'events'
                },
                (payload) => {
                    if (!canNotifyNewGames) return
                    const newEvent = payload.new
                    NotificationService.notifyAchievement(
                        'New Battle Scheduled! 🔥',
                        `GM Berna just created "${newEvent.title}". Check it out on the dashboard!`
                    )
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'events'
                },
                (payload) => {
                    const oldStatus = payload.old.status
                    const newStatus = payload.new.status
                    
                    if (oldStatus !== 'completed' && newStatus === 'completed') {
                        if (!canNotifySeasonResults) return
                        NotificationService.notifyAchievement(
                            'Battle Results are In! 🏆',
                            `The session "${payload.new.title}" has been finalized. Check the new rankings!`
                        )
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    return null
}
