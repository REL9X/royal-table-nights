'use client'

import { Zap, Bell, Send, Loader2, X } from 'lucide-react'
import { NotificationService } from '@/lib/notifications'
import { useState, useEffect } from 'react'
import { sendBroadcast, sendSelfTestPush } from './actions'
import { createClient } from '@/lib/supabase/client'

interface Toast { id: number; title: string; message: string }

export default function SystemTesting() {
    const [sending, setSending] = useState(false)
    const [testing, setTesting] = useState(false)
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
        setTesting(true)
        try {
            const granted = await NotificationService.requestPermissions()
            if (!granted) {
                addToast('Permission Denied', 'Please enable notifications in your browser settings.')
                setTesting(false)
                return
            }

            const res = await sendSelfTestPush()
            if (res.success) {
                addToast('Test Sent! 🔔', `Check your device for a push notification. (${res.sent} device)`)
            } else {
                addToast('Test Failed', res.error || 'Unknown error')
            }
        } catch (e) {
            console.error(e)
            addToast('Error', 'Failed to trigger test.')
        }
        setTesting(false)
    }

    const handleBroadcast = async () => {
        if (!title || !message) { alert('Please fill in both title and message.'); return }
        setSending(true)
        const res = await sendBroadcast(title, message)
        if (res.success) {
            // Note: sendBroadcast now automatically fires the background Web-Push payload internally
            setTitle('')
            setMessage('')
            addToast('Broadcast Sent', `Notification dispatched to ${res.sent} device(s).`)
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
                    <div key={t.id} className="pointer-events-auto bg-[var(--background-card)] border border-sky-500/30 rounded-2xl p-4 shadow-2xl shadow-black/20 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                            <Bell size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-xs text-[var(--foreground)] uppercase tracking-tight leading-none mb-1">{t.title}</p>
                            <p className="text-[10px] text-[var(--foreground-muted)] leading-tight">{t.message}</p>
                        </div>
                        <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-[var(--foreground-subtle)] hover:text-[var(--foreground)] transition-colors">
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mb-8 p-6 rounded-[2.5rem] border border-sky-500/20 bg-[var(--background-card)] shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                    <Zap size={120} className="text-sky-500" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Bell size={16} className="text-sky-500" />
                        <h3 className="text-lg font-black text-[var(--foreground)] uppercase tracking-tight">Notification Center</h3>
                    </div>
                    <p className="text-xs text-[var(--foreground-muted)] mb-6 max-w-xs">Send global alerts to all registered devices or test your own setup.</p>
                    
                    <div className="space-y-6">
                        {/* Global Broadcast Form */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Send size={12} /> Global Broadcast (To Everyone)
                            </p>
                             <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Alert Title (e.g. Table is Open!)"
                                className="w-full bg-[var(--background-raised)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none focus:border-sky-500/50 transition-all font-bold"
                            />
                             <textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Message for all players..."
                                rows={3}
                                className="w-full bg-[var(--background-raised)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none focus:border-sky-500/50 transition-all font-bold resize-none"
                            />
                            <button 
                                onClick={handleBroadcast}
                                disabled={sending || !title || !message}
                                className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 disabled:bg-[var(--background-raised)] disabled:text-[var(--foreground-subtle)] text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sky-500/20 disabled:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                Send to All Phones 🔔
                            </button>
                        </div>
                        
                        {/* Self Test */}
                        <div className="pt-5 border-t border-[var(--border)] space-y-3">
                            <p className="text-[10px] font-black text-[var(--foreground-subtle)] uppercase tracking-[0.2em] mb-1">
                                Troubleshooting
                            </p>
                            <button 
                                onClick={handleTest}
                                disabled={testing}
                                className="w-full py-3 bg-[var(--background-raised)] border border-[var(--border)] hover:border-sky-500/30 text-[var(--foreground-muted)] hover:text-[var(--foreground)] rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {testing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="text-amber-500" />}
                                Run Self-Test (Your Phone Only)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
