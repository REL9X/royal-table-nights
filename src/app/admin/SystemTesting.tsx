'use client'

import { Zap, Bell, Send } from 'lucide-react'
import { NotificationService } from '@/lib/notifications'
import { useState } from 'react'

export default function SystemTesting() {
    const [sending, setSending] = useState(false)

    const handleTest = async () => {
        const granted = await NotificationService.requestPermissions()
        if (granted) {
            await NotificationService.notifyAchievement(
                'Royal Table Service 🔔',
                'Your PWA notifications are configured correctly! Ready for the next battle.'
            )
        } else {
            alert('Notification permission denied. Please check your browser/phone settings.')
        }
    }

    return (
        <div className="mb-8 p-6 rounded-[2.5rem] border border-sky-500/20 bg-sky-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Zap size={80} className="text-sky-500" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Bell size={16} className="text-sky-400" />
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">System Testing</h3>
                </div>
                <p className="text-xs text-white/50 mb-6 max-w-xs">Verify PWA settings and trigger broadcast test alerts.</p>
                
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={handleTest}
                        className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-black rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Zap size={14} />
                        Test Personal Push
                    </button>
                    
                    {/* Placeholder for Broadcast feature later */}
                    <button 
                        disabled
                        className="px-6 py-3 bg-white/5 border border-white/10 text-white/40 rounded-xl font-black text-xs uppercase tracking-widest cursor-not-allowed flex items-center gap-2 opacity-50"
                    >
                        <Send size={14} />
                        Broadcast (Coming)
                    </button>
                </div>
            </div>
        </div>
    )
}
