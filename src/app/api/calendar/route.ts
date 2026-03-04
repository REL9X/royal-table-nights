import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('id')

    if (!eventId) {
        return new NextResponse('Event ID is required', { status: 400 })
    }

    const supabase = await createClient()

    // First check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

    if (!event) {
        return new NextResponse('Event not found', { status: 404 })
    }

    // Parse date and time to create standard ICS format
    const [year, month, day] = event.date.split('-')
    const [hour, minute] = event.time.split(':')

    // Format as YYYYMMDDTHHMMSSZ
    const startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)))
    // Assuming 4 hour duration for a poker session
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000)

    const formatIcsDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Royal Table Nights//Poker App//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART:${formatIcsDate(startDate)}
DTEND:${formatIcsDate(endDate)}
LOCATION:${event.location || 'Home Game'}
DESCRIPTION:Buy-in: ${event.buy_in_amount}EUR\\nRebuy: ${event.rebuy_amount}EUR\\nNotes: ${event.notes || 'No notes'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

    return new NextResponse(icsContent, {
        status: 200,
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': `attachment; filename="royal_table_${event.date}.ics"`,
        },
    })
}
