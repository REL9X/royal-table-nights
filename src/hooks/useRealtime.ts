'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Custom hook to listen for real-time changes in a Supabase table
 * and trigger a router refresh.
 */
export function useRealtime(table: string, filter?: string) {
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel(`realtime-${table}-${filter || 'all'}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: table,
                    filter: filter
                },
                () => {
                    // Trigger a re-fetch of server components
                    router.refresh()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [table, filter, router, supabase])
}
