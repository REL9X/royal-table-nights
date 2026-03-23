'use client'

import { useRealtime } from '@/hooks/useRealtime'

/**
 * A tiny client component to be dropped into Server Components 
 * to enable real-time updates via router.refresh()
 */
export default function RealtimeRefresher({ table, filter }: { table: string, filter?: string }) {
    useRealtime(table, filter)
    return null
}
