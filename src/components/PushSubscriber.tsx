'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PushSubscriber({ userId }: { userId: string }) {
    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
        if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return

        async function subscribe() {
            window.console.log('Push: subscribe starting...')
            try {
                if (!navigator.serviceWorker.controller) {
                    window.console.log('Push: No SW controller yet, waiting for registration...')
                }
                const registration = await navigator.serviceWorker.ready
                window.console.log('Push: SW ready at scope:', registration.scope)
                
                const existing = await registration.pushManager.getSubscription()
                if (existing) {
                    window.console.log('Push: Existing subscription found, ensuring DB is synced...')
                    await saveSubscription(existing, userId)
                    return
                }

                window.console.log('Push: No subscription found, requesting permission...')
                const permission = await Notification.requestPermission()
                window.console.log('Push: Permission result:', permission)
                if (permission !== 'granted') return

                window.console.log('Push: Subscribing with VAPID key...')
                const sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
                })

                window.console.log('Push: Subscription successful, saving to DB...')
                await saveSubscription(sub, userId)
                window.console.log('Push: Subscription saved successfully.')
            } catch (e) {
                window.console.error('Push subscription failed:', e)
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
