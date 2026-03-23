'use client'

import { Zap, Bell, Send, Loader2, X } from 'lucide-react'
import { NotificationService } from '@/lib/notifications'
import { useState, useEffect } from 'react'
import { sendBroadcast } from './actions'
import { createClient } from '@/lib/supabase/client'

interface Toast { id: number; title: string; message: string }

export default function SystemTesting() {
    const [sending, setSending] = useState(false)
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [toasts, setToasts] = useState<Toast[]>([])

    const addToast = (t: string, m: string) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, title: t, message: m }])
        setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 5000)
    }

    // Listen for broadcasts in realtime so GM can see the result immediately
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel('broadcast-preview')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'broadcasts' }, (payload) => {
                addToast(payload.new.title || 'GM Announcement 📣', payload.new.message)
            })
            .subscribe()
        return () => { supabase.removeChannel(channel) }
    }, [])

    const handleTest = async () => {
        const granted = await NotificationService.requestPermissions()
        addToast('Royal Table Service 🔔', 'Your PWA notifications are configured correctly!')
        if (granted) {
            await NotificationService.notifyAchievement(
                'Royal Table Service 🔔',
                'Your PWA notifications are configured correctly! Ready for the next battle.'
            )
        }
    }

    const handleBroadcast = async () => {
        if (!title || !message) { alert('Please fill in both title and message.'); return }
        setSending(true)
        const res = await sendBroadcast(title, message)
        if (res.success) {
            // Also fire real Web Push to all subscribed devices (background notifications)
            await fetch('/api/send-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, message })
            })
            setTitle('')
            setMessage('')
        } else {
            alert('Error: ' + res.error)
        }
        setSending(false)
    }

    return (
        <>
            {/* Toast stack */}
            <div className="fixed top-4 right-4 z-50 space-y-2 max-w-xs w-full pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto bg-[#1a1a2e] border border-sky-500/30 rounded-2xl p-4 shadow-2xl shadow-black/60 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                            <Bell size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-xs text-white uppercase tracking-tight leading-none mb-1">{t.title}</p>
                            <p className="text-[10px] text-white/50 leading-tight">{t.message}</p>
                        </div>
                        <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-white/20 hover:text-white transition-colors">
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mb-8 p-6 rounded-[2.5rem] border border-sky-500/20 bg-sky-500/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Zap size={80} className="text-sky-500" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Bell size={16} className="text-sky-400" />
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Send Notification</h3>
                    </div>
                    <p className="text-xs text-white/50 mb-6 max-w-xs">Manage PWA permissions and trigger global alerts.</p>
                    
                    <div className="space-y-4">
                        <button 
                            onClick={handleTest}
                            className="px-6 py-3 bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500 hover:text-black text-sky-400 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Zap size={14} />
                            Personal Push
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
        </>
    )
}
