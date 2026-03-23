'use client'

import { useState } from 'react'
import { CheckCircle, Crown, Loader2 } from 'lucide-react'
import { submitRsvp } from './actions'
import { NotificationService } from '@/lib/notifications'
import Link from 'next/link'

interface RsvpButtonProps {
    eventId: string
    eventTitle: string
    eventDate: string
    isAttending: boolean
}

export default function RsvpButton({ eventId, eventTitle, eventDate, isAttending }: RsvpButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    async function handleRsvp() {
        setIsLoading(true)
        try {
            // 1. Submit to server
            const res = await submitRsvp(eventId, 'accepted')
            
            if (res?.success) {
                // 2. Request permission and schedule local reminders
                const granted = await NotificationService.requestPermissions()
                if (granted) {
                    await NotificationService.scheduleEventReminders(eventId, eventTitle, eventDate)
                }
            }
        } catch (error) {
            console.error('RSVP failed:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isAttending) {
        return (
            <Link href={`/session/${eventId}`} className="flex-1 py-2.5 rounded-xl font-black text-sm text-center flex items-center justify-center gap-2 transition-all active:scale-95 border border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                <Crown size={15} /> View Session
            </Link>
        )
    }

    return (
        <button
            onClick={handleRsvp}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-black rounded-xl text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #059669, #065f46)' }}
        >
            {isLoading ? (
                <Loader2 size={15} className="animate-spin" />
            ) : (
                <>
                    <CheckCircle size={15} /> Accept
                </>
            )}
        </button>
    )
}
