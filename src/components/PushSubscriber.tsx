'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PushSubscriber({ userId }: { userId: string }) {
    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
        if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return

        async function subscribe() {
            try {
                const registration = await navigator.serviceWorker.ready
                const existing = await registration.pushManager.getSubscription()
                if (existing) {
                    // Already subscribed — ensure it's saved in DB
                    await saveSubscription(existing, userId)
                    return
                }

                const permission = await Notification.requestPermission()
                if (permission !== 'granted') return

                const sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
                })

                await saveSubscription(sub, userId)
            } catch (e) {
                console.warn('Push subscription failed:', e)
            }
        }

        subscribe()
    }, [userId])

    return null
}

async function saveSubscription(sub: PushSubscription, userId: string) {
    const supabase = createClient()
    const json = sub.toJSON()
    await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: json.keys?.p256dh ?? '',
        auth: json.keys?.auth ?? ''
    }, { onConflict: 'user_id,endpoint' })
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const output = new ArrayBuffer(rawData.length)
    const bytes = new Uint8Array(output)
    for (let i = 0; i < rawData.length; i++) bytes[i] = rawData.charCodeAt(i)
    return output
}
