import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Bell } from 'lucide-react'
import NotificationSettings from '@/app/profile/NotificationSettings'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profile) redirect('/dashboard')

    return (
        <div className="min-h-screen text-[var(--foreground)] font-sans pb-28 relative overflow-hidden" style={{ background: 'var(--background)' }}>
            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-5%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-25" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
                <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-15" style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }} />
            </div>

            <div className="max-w-md mx-auto px-4 pt-6 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/dashboard" className="p-2 bg-[var(--background-card)] border border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                        <ChevronLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="font-black text-2xl text-[var(--foreground)] uppercase tracking-wider">Settings</h1>
                        <p className="text-[var(--foreground-muted)] text-xs font-medium uppercase tracking-widest">Preferences & Logic</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <NotificationSettings 
                        initialPrefs={profile.notification_preferences || {
                            new_games: true,
                            season_results: true,
                            rank_ups: true,
                            reminders: true
                        }} 
                    />
                </div>
            </div>
        </div>
    )
}
