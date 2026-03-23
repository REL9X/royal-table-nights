'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { NotificationService } from '@/lib/notifications'

export default function EventRealtimeNotifier() {
    const supabase = createClient()

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
