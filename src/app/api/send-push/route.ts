import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    // Set VAPID details at request time — not module level — so build doesn't throw
    if (!process.env.VAPID_SUBJECT || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        return NextResponse.json({ error: 'Push not configured' }, { status: 500 })
    }
    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    )

    const supabase = await createClient()

    // Auth check — only admins can send pushes
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { title, message } = await req.json()

    const { sendPushPayload } = await import('@/lib/push')
    const { sent, error } = await sendPushPayload(title, message)

    if (error) {
        return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ sent })
}
