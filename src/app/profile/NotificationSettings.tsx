'use client'

import { useState } from 'react'
import { Bell, Shield, Trophy, Zap, Clock, Check } from 'lucide-react'
import { updateNotificationPrefs } from './actions'
import { motion } from 'framer-motion'

interface NotificationSettingsProps {
    initialPrefs: {
        all_enabled: boolean
        new_games: boolean
        season_results: boolean
        rank_ups: boolean
        reminders: boolean
    }
}

export default function NotificationSettings({ initialPrefs }: NotificationSettingsProps) {
    const [prefs, setPrefs] = useState(initialPrefs)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    async function handleToggle(key: keyof typeof initialPrefs) {
        const nextPrefs = { ...prefs, [key]: !prefs[key] }
        setPrefs(nextPrefs)
        setSaving(true)
        setSaved(false)

        const res = await updateNotificationPrefs(nextPrefs)
        setSaving(false)
        if (res.success) {
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        }
    }

    const sections = [
        { key: 'new_games', label: 'New Battle Scheduled', desc: 'Alert when GM Berna deploys a new game table.', icon: Zap, color: 'text-emerald-500' },
        { key: 'rank_ups', label: 'Rank Promotions', desc: 'Celebrate with a notification when you reach a new rank.', icon: Trophy, color: 'text-amber-500' },
        { key: 'season_results', label: 'Season Finalization', desc: 'Get the final rankings when a war campaign ends.', icon: Shield, color: 'text-sky-400' },
        { key: 'reminders', label: 'Game Reminders', desc: 'System prompts 24h and 1 week before your RSVPs.', icon: Clock, color: 'text-violet-400' },
    ]

    const allEnabled = prefs.all_enabled ?? true

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-xs uppercase tracking-widest text-[var(--foreground-muted)] flex items-center gap-2">
                    <Bell size={12} className="text-amber-500" /> Notification Logic
                </h2>
                {saved && (
                    <motion.span 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1"
                    >
                        <Check size={10} /> Saved
                    </motion.span>
                )}
            </div>

            <div className="space-y-3">
                {/* Global Toggle */}
                <button
                    onClick={() => handleToggle('all_enabled')}
                    disabled={saving}
                    className={`w-full text-left p-5 rounded-3xl border transition-all flex items-center gap-4 group shadow-xl
                        ${allEnabled 
                            ? 'bg-emerald-500/10 border-emerald-500/30' 
                            : 'bg-white/5 border-white/5'}`}
                >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all shrink-0
                        ${allEnabled ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-white/5 text-white/20 border-white/5'}`}>
                        <Bell size={24} className={allEnabled ? 'animate-bounce' : ''} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="font-black text-base text-[var(--foreground)] tracking-tight uppercase leading-none mb-1">
                            Notifications {allEnabled ? 'ON' : 'OFF'}
                        </h4>
                        <p className="text-[10px] text-[var(--foreground-muted)] font-medium leading-tight">
                            {allEnabled ? 'Receive alerts for games, ranks, and events.' : 'All system notifications are currently disabled.'}
                        </p>
                    </div>
                    <div className={`w-12 h-7 rounded-full p-1 transition-colors relative ${allEnabled ? 'bg-emerald-500' : 'bg-white/10'}`}>
                        <motion.div 
                            animate={{ x: allEnabled ? 20 : 0 }}
                            className="w-5 h-5 rounded-full bg-white shadow-sm"
                        />
                    </div>
                </button>

                {/* Specific Toggles */}
                <div className={`space-y-2 transition-all duration-500 ${!allEnabled ? 'opacity-30 grayscale pointer-events-none' : 'opacity-100'}`}>
                    {sections.map((section) => {
                        const Icon = section.icon
                        const isEnabled = prefs[section.key as keyof typeof initialPrefs]
                        
                        return (
                            <button
                                key={section.key}
                                onClick={() => handleToggle(section.key as keyof typeof initialPrefs)}
                                disabled={saving || !allEnabled}
                                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 group
                                    ${isEnabled 
                                        ? 'bg-white/5 border-white/10' 
                                        : 'bg-black/20 border-white/5 opacity-60 grayscale'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl bg-[var(--background-raised)] flex items-center justify-center border border-white/5 shrink-0 group-hover:scale-110 transition-transform ${section.color}`}>
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-sm text-[var(--foreground)] tracking-tight uppercase leading-none mb-1">{section.label}</h4>
                                    <p className="text-[10px] text-[var(--foreground-muted)] font-medium leading-tight">{section.desc}</p>
                                </div>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors relative ${isEnabled ? 'bg-emerald-500' : 'bg-white/10'}`}>
                                    <motion.div 
                                        animate={{ x: isEnabled ? 16 : 0 }}
                                        className="w-4 h-4 rounded-full bg-white shadow-sm"
                                    />
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
            
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] text-center pt-2 italic">
                Settings are synced across all your PWA devices.
            </p>
        </div>
    )
}
