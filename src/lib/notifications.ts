import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const NotificationService = {
    async requestPermissions() {
        if (!Capacitor.isNativePlatform()) {
            if (!('Notification' in window)) {
                console.log('This browser does not support notifications.');
                return false;
            }
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        
        try {
            const permission = await LocalNotifications.requestPermissions();
            return permission.display === 'granted';
        } catch (error) {
            console.error('Error requesting notification permissions:', error);
            return false;
        }
    },

    async scheduleEventReminders(eventId: string, title: string, date: string) {
        if (!Capacitor.isNativePlatform()) {
            console.log('Skipping local notification schedule: Not on a native platform.');
            return;
        }

        const eventDate = new Date(date);
        const dayBefore = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000);
        const weekBefore = new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const now = new Date();

        const notifications = [];

        // 1 Day Before
        if (dayBefore > now) {
            notifications.push({
                title: 'Royal Table Night: Tomorrow!',
                body: `Don't forget: ${title} is happening in 24 hours. Get your chips ready!`,
                id: parseInt(eventId.slice(0, 8), 16) + 1, // Unique ID from UUID
                schedule: { at: dayBefore },
                smallIcon: 'ic_stat_crown', // Custom icon name if we add it
                actionTypeId: '',
                extra: { eventId }
            });
        }

        // 1 Week Before
        if (weekBefore > now) {
            notifications.push({
                title: 'Royal Table Night: 7 Days to go!',
                body: `The battle for ${title} starts in one week. Confirm your seat!`,
                id: parseInt(eventId.slice(0, 8), 16) + 7,
                schedule: { at: weekBefore },
                smallIcon: 'ic_stat_crown',
                actionTypeId: '',
                extra: { eventId }
            });
        }

        if (notifications.length > 0) {
            try {
                // Cancel existing reminders for this event first
                await LocalNotifications.cancel({ notifications: [{ id: parseInt(eventId.slice(0, 8), 16) + 1 }, { id: parseInt(eventId.slice(0, 8), 16) + 7 }] });
                await LocalNotifications.schedule({ notifications });
                console.log(`Scheduled ${notifications.length} reminders for event: ${title}`);
            } catch (error) {
                console.error('Error scheduling local notifications:', error);
            }
        }
    },

    async notifyAchievement(title: string, message: string) {
        if (!Capacitor.isNativePlatform()) {
            // Fallback for web: use Browser Notification API if granted
            console.log(`Web Notification: ${title} - ${message}`);
            
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                    body: message,
                    icon: '/logo.png' // Use PWA icon
                });
            }
            return;
        }

        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title,
                        body: message,
                        id: Math.floor(Math.random() * 1000000),
                        schedule: { at: new Date(Date.now() + 500) }, // Show almost immediately
                        smallIcon: 'ic_stat_crown',
                    }
                ]
            });
        } catch (error) {
            console.error('Error showing immediate notification:', error);
        }
    }
};
