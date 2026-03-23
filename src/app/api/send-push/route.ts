import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: Request) {
    const supabase = await createClient()

    // Auth check — only admins can send pushes
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { title, message } = await req.json()

    // Get all subscriptions
    const { data: subs } = await supabase.from('push_subscriptions').select('*')
    if (!subs || subs.length === 0) return NextResponse.json({ sent: 0 })

    const payload = JSON.stringify({ title, body: message })
    let sent = 0
    const dead: string[] = []

    await Promise.allSettled(subs.map(async (sub) => {
        try {
            await webpush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                payload
            )
            sent++
        } catch (err: any) {
            if (err.statusCode === 410 || err.statusCode === 404) {
                dead.push(sub.id) // Subscription expired — clean it up
            }
        }
    }))

    // Remove expired subscriptions
    if (dead.length > 0) {
        await supabase.from('push_subscriptions').delete().in('id', dead)
    }

    return NextResponse.json({ sent })
}
