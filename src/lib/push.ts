import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

export async function sendPushPayload(title: string, message: string) {
    if (!process.env.VAPID_SUBJECT || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
        console.error('Push missing VAPID configuration.')
        return { sent: 0, error: 'Push missing VAPID configuration.' }
    }
    
    try {
        webpush.setVapidDetails(
            process.env.VAPID_SUBJECT,
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        )
    } catch (e) {
        // already set or invalid
    }

    const supabase = await createClient()

    const { data: subs } = await supabase.from('push_subscriptions').select('*')
    if (!subs || subs.length === 0) return { sent: 0 }

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
            // 410 Gone means the subscription is no longer valid
            if (err.statusCode === 410 || err.statusCode === 404) {
                dead.push(sub.id)
            }
        }
    }))

    if (dead.length > 0) {
        await supabase.from('push_subscriptions').delete().in('id', dead)
    }

    return { sent }
}
