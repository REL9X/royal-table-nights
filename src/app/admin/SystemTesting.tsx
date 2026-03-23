'use client'

import { Zap, Bell, Send, Loader2 } from 'lucide-react'
import { NotificationService } from '@/lib/notifications'
import { useState } from 'react'
import { sendBroadcast } from './actions'

export default function SystemTesting() {
    const [sending, setSending] = useState(false)
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')

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

    const handleBroadcast = async () => {
        if (!title || !message) {
            alert('Please fill in both title and message.')
            return
        }
        
        setSending(true)
        const res = await sendBroadcast(title, message)
        setSending(false)
        
        if (res.success) {
            alert('Broadcast sent to all active players!')
            setTitle('')
            setMessage('')
        } else {
            alert('Error: ' + res.error)
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
                    <h3 className="text-lg font-black text-white uppercase tracking-tight">System Deployment</h3>
                </div>
                <p className="text-xs text-white/50 mb-6 max-w-xs">Manage PWA permissions and trigger global alerts.</p>
                
                <div className="space-y-4">
                    <button 
                        onClick={handleTest}
                        className="px-6 py-3 bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500 hover:text-black text-sky-400 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Zap size={14} />
                        Test Personal Push
                    </button>

                    <div className="pt-4 border-t border-white/5 space-y-3">
                        <p className="text-[10px] font-black text-sky-400/60 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Send size={10} /> Global Broadcast
                        </p>
                        <input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Alert Title (e.g. Table is Open!)"
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-sky-500/50 transition-all font-bold"
                        />
                        <textarea 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Message for all players..."
                            rows={2}
                            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-sky-500/50 transition-all font-bold resize-none"
                        />
                        <button 
                            onClick={handleBroadcast}
                            disabled={sending}
                            className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-black rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Broadcast to All Players
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
