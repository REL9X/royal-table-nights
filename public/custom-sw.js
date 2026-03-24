// Custom service worker extension — merged by next-pwa at build time
// This file handles Web Push notifications so phones get background alerts

self.addEventListener('push', (event) => {
    if (!event.data) return

    let data = {}
    try { data = event.data.json() } catch { data = { title: 'Royal Table', body: event.data.text() } }

    const title = data.title || 'Royal Table Nights 👑'
    const options = {
        body: data.body || data.message || '',
        icon: '/logo-push.png',
        vibrate: [200, 100, 200],
        tag: 'royal-table-broadcast',
        renotify: true,
        data: { url: '/dashboard' }
    }

    event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const url = event.notification.data?.url || '/dashboard'
    event.waitUntil(clients.openWindow(url))
})
