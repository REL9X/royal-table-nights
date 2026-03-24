// Appends the Web Push event handler to the next-pwa generated service worker
const fs = require('fs')
const path = require('path')

const swPath = path.join(__dirname, '..', 'public', 'sw.js')
const pushHandler = `

// ── Web Push handler (v1.0.4 - appended by postbuild) ──
self.addEventListener('push', function(event) {
    if (!event.data) return;
    var data = {};
    try { data = event.data.json(); } catch(e) { data = { title: 'Royal Table', body: event.data.text() }; }
    var title = data.title || 'Royal Table Nights';
    var options = {
        body: data.body || data.message || '',
        icon: '/logo-push.png',
        badge: '/logo-push.png',
        vibrate: [200, 100, 200],
        tag: 'royal-broadcast',
        renotify: true,
        data: { url: '/dashboard' }
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    var url = (event.notification.data && event.notification.data.url) || '/dashboard';
    event.waitUntil(clients.openWindow(url));
});
`

if (fs.existsSync(swPath)) {
    const current = fs.readFileSync(swPath, 'utf8')
    if (!current.includes('v1.0.4')) {
        // Remove old handler if exists (simplistic check)
        const cleaned = current.split('// ── Web Push handler')[0]
        fs.writeFileSync(swPath, cleaned + pushHandler)
        console.log('[push-sw] Push handler (v1.0.4) updated in sw.js')
    } else {
        console.log('[push-sw] Push handler (v1.0.4) already present, skipping')
    }
} else {
    console.warn('[push-sw] sw.js not found — skipping')
}
