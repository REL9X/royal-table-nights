'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PushSubscriber({ userId }: { userId: string }) {
    useEffect(() => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
        if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return

        async function subscribe() {
            try {
                // ── ENSURE SW IS REGISTERED (Global Repair) ──
                let reg = await navigator.serviceWorker.getRegistration()
                if (!reg) {
                    console.log('RTN-PUSH: Auto-registering SW...')
                    reg = await navigator.serviceWorker.register('/sw.js')
                }
                
                // Wait for the SW to be active
                await navigator.serviceWorker.ready
                
                // ── CHECK EXISTING SUBSCRIPTION ──
                const existing = await reg.pushManager.getSubscription()
                if (existing) {
                    // SILENT UPDATE: If they already have it, just make sure DB is synced
                    await saveSubscription(existing, userId)
                    return
                }

                // ── NEW SUBSCRIPTION ──
                // If they've already granted permission (maybe in a previous version), 
                // we can subscribe silently now.
                if (Notification.permission === 'granted') {
                    const sub = await reg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
                    })
                    await saveSubscription(sub, userId)
                } 
                // Note: We don't call requestPermission() here to avoid a popup every dashboard visit.
                // We leave that to the NotificationSettings/Settings page where it's expected.
            } catch (e) {
                console.error('Push auto-subscription failed:', e)
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
