import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.royaltable.app',
    appName: 'Royal Table Nights',
    webDir: 'out', // The standard Next.js export directory

    server: {
        // IMPORTANT: To use Server Actions on a mobile app, we configure Capacitor
        // to act as a "Remote Web App". Replace this URL with your live Vercel domain 
        // when you deploy. e.g. 'https://royal-table-nights.vercel.app'
        url: 'https://royal-table-nights-pwxotmm3x-bernardo-coutos-projects-ce46957f.vercel.app',
        // For local testing on the same Wi-Fi, you could use your computer's local IP:
        // url: 'http://192.168.1.X:3000',
        cleartext: true
    }
};

export default config;
