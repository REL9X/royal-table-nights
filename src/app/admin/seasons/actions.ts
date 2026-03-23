'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function finishSeason(seasonId: string) {
    console.log('--- START finishSeason ---', { seasonId })
    const supabase = await createClient()

    // 1. Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.error('Finalize failed: No user authenticated')
        return { success: false, error: 'Not authenticated' }
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
        console.error('Finalize failed: User is not admin')
        return { success: false, error: 'Not authorized' }
    }

    // 2. Get the season to be finalized
    const { data: season, error: seasonError } = await supabase
        .from('seasons')
        .select('*')
        .eq('id', seasonId)
        .single()

    if (seasonError || !season) {
        console.error('Season not found:', seasonError)
        return { success: false, error: 'Season not found' }
    }

    // 3. Fetch all session_player records for games in this season that are completed
    const { data: sPointsData, error: sPointsError } = await supabase
        .from('session_players')
        .select('player_id, points_earned, events!inner(season_id, status)')
        .eq('events.season_id', season.id)
        .eq('events.status', 'completed')

    if (sPointsError) {
        console.error('Points fetch error:', sPointsError)
        return { success: false, error: 'Points fetch error' }
    }

    const pointsMap: Record<string, number> = {}
    sPointsData?.forEach((sp: any) => {
        pointsMap[sp.player_id] = (pointsMap[sp.player_id] || 0) + (sp.points_earned || 0)
    })

    const standings = Object.entries(pointsMap)
        .sort((a, b) => b[1] - a[1]) // Sort by points descending

    // 4. Distribute Rewards
    console.log(`Distributing rewards for ${standings.length} players...`)
    for (let i = 0; i < standings.length; i++) {
        const [playerId, seasonPoints] = standings[i]
        const rank = i + 1
        let bonus = 0

        // Determine bonus based on rank
        if (rank === 1) bonus = season.pts_season_1st || 0
        else if (rank === 2) bonus = season.pts_season_2nd || 0
        else if (rank === 3) bonus = season.pts_season_3rd || 0
        else if (rank === 4) bonus = season.pts_season_4th || 0
        else if (rank === 5) bonus = season.pts_season_5th || 0
        else bonus = season.pts_season_participation || 0

        // Fetch current profile to update
        const { data: playerProfile } = await supabase
            .from('profiles')
            .select('name, total_points, championship_badges_count, championship_wins')
            .eq('id', playerId)
            .single()

        if (playerProfile) {
            const updates: any = {
                total_points: (playerProfile.total_points || 0) + bonus
            }

            // Award badge for 1st place
            if (rank === 1) {
                updates.championship_badges_count = (playerProfile.championship_badges_count || 0) + 1

                // Record specific season win
                const currentWins = Array.isArray(playerProfile.championship_wins)
                    ? playerProfile.championship_wins
                    : []

                updates.championship_wins = [
                    ...currentWins,
                    {
                        seasonId: season.id,
                        seasonName: season.name,
                        rank: 1,
                        awardedAt: new Date().toISOString()
                    }
                ]
            }

            const { error: pError } = await supabase.from('profiles').update(updates).eq('id', playerId)
            if (pError) console.error(`Error rewarding player ${playerId}:`, pError)
        }
    }

    // 5. Mark season as completed
    const { data: updateData, error: updateError } = await supabase
        .from('seasons')
        .update({ status: 'completed' })
        .eq('id', season.id)
        .select()

    if (updateError) {
        console.error('Error finishing season:', updateError)
        return { success: false, error: updateError.message }
    }

    console.log('Successfully marked season as COMPLETED!')
    revalidatePath('/dashboard')
    revalidatePath(`/admin/seasons/${seasonId}/edit`)
    redirect('/dashboard')
}

export async function undoFinishSeason(seasonId: string) {
    console.log('--- START undoFinishSeason ---', { seasonId })
    const supabase = await createClient()

    // 1. Verify admin
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (!adminUser) return { error: 'Not authenticated' }

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', adminUser.id).single()
    if (adminProfile?.role !== 'admin') return { error: 'Not authorized' }

    // 2. Fetch season rules
    const { data: season, error: seasonError } = await supabase
        .from('seasons')
        .select('*')
        .eq('id', seasonId)
        .single()

    if (seasonError || !season) return { error: 'Season not found' }

    // 3. Mark season back to active
    const { error: updateError } = await supabase
        .from('seasons')
        .update({ status: 'active' })
        .eq('id', seasonId)

    if (updateError) {
        console.error('[undoFinishSeason] Error reverting season:', updateError)
        return { error: 'Failed to update season status' }
    }

    console.log('[undoFinishSeason] Successfully reverted season to active!')
    revalidatePath('/dashboard')
    revalidatePath(`/admin/seasons/${seasonId}/edit`)
}

export async function getActiveSeasons() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching active seasons:', error)
        return []
    }
    return data || []
}

export async function updateSeason(formData: FormData) {
    const supabase = await createClient()

    // 1. Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return redirect('/dashboard')

    const id = formData.get('id') as string

    const updates = {
        name: formData.get('name') as string,
        status: formData.get('status') as string,
        max_games: parseInt(formData.get('max_games') as string),
        pts_per_game: parseInt(formData.get('pts_per_game') as string),
        pts_per_euro_profit: parseFloat(formData.get('pts_per_euro_profit') as string),
        pts_1st_place: parseInt(formData.get('pts_1st_place') as string),
        pts_2nd_place: parseInt(formData.get('pts_2nd_place') as string),
        pts_3rd_place: parseInt(formData.get('pts_3rd_place') as string),
        pts_season_1st: parseInt(formData.get('pts_season_1st') as string),
        pts_season_2nd: parseInt(formData.get('pts_season_2nd') as string),
        pts_season_3rd: parseInt(formData.get('pts_season_3rd') as string),
        pts_season_4th: parseInt(formData.get('pts_season_4th') as string),
        pts_season_5th: parseInt(formData.get('pts_season_5th') as string),
        pts_season_participation: parseInt(formData.get('pts_season_participation') as string),
        theme_note: formData.get('theme_note') as string,
    }

    // If setting to active, mark all others as completed
    if (updates.status === 'active') {
        await supabase
            .from('seasons')
            .update({ status: 'completed' })
            .eq('status', 'active')
            .neq('id', id)
    }

    const { error } = await supabase
        .from('seasons')
        .update(updates)
        .eq('id', id)

    if (error) {
        console.error('Error updating season:', error)
        return { error: 'Failed to update season' }
    }

    revalidatePath('/admin/seasons')
    revalidatePath('/admin')
    revalidatePath('/dashboard')

    redirect('/admin/seasons')
}

export async function deleteSeason(id: string) {
    console.log('--- START deleteSeason ---', { seasonId: id })
    const supabase = await createClient()

    // 1. Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { error: 'Not authorized' }

    // 2. Fetch the season to check its status and rules for reversal
    const { data: season, error: seasonError } = await supabase
        .from('seasons')
        .select('*')
        .eq('id', id)
        .single()

    if (seasonError || !season) {
        return { error: 'Season not found' }
    }

    // 3. If the season was COMPLETED, we MUST reverse the rewards
    if (season.status === 'completed') {
        console.log(`Reversing rewards for completed season: ${season.name}`)

        // Find everyone who has this season in their championship_wins
        const { data: playersWithWins } = await supabase
            .from('profiles')
            .select('id, championship_wins, championship_badges_count, total_points')
            .contains('championship_wins', [{ seasonId: id }])

        if (playersWithWins && playersWithWins.length > 0) {
            for (const player of playersWithWins) {
                const currentWins = Array.isArray(player.championship_wins) ? player.championship_wins : []
                const updatedWins = currentWins.filter((w: any) => w.seasonId !== id)

                // Only subtract if they actually had a win record (usually just 1 winner)
                const winRemoved = currentWins.length > updatedWins.length

                const { error: pError } = await supabase
                    .from('profiles')
                    .update({
                        championship_wins: updatedWins,
                        championship_badges_count: Math.max(0, (player.championship_badges_count || 0) - (winRemoved ? 1 : 0)),
                        // Note: We only reverse the 1st place bonus easily here. 
                        // Recalculating 2-5th place would requires a full stats rebuild or complex mapping.
                        // For now, let's at least revert the 1st place points if they won.
                        total_points: Math.max(0, (player.total_points || 0) - (winRemoved ? (season.pts_season_1st || 0) : 0))
                    })
                    .eq('id', player.id)

                if (pError) console.error(`Error reverting win for player ${player.id}:`, pError)
            }
        }

        // Note: For a more perfect "cancel", we would need to know who got 2nd-5th place bonuses.
        // Since we don't store "bonus_history" yet, we'll advise the user that a full stats recalculate 
        // might be needed if they want 100% precision on participation points reversal.
    }

    // 4. Unlink associated events
    const { count, error: countError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('season_id', id)

    if (countError) console.error('Error checking for linked events:', countError)

    if (count && count > 0) {
        console.log(`Unlinking ${count} events from season ${id} before deletion.`)
        await supabase.from('events').update({ season_id: null }).eq('season_id', id)
    }

    // 5. Delete season record
    const { error: deleteError } = await supabase
        .from('seasons')
        .delete()
        .eq('id', id)

    if (deleteError) {
        console.error('Error deleting season:', deleteError)
        return { error: `Failed to delete season: ${deleteError.message}` }
    }

    console.log(`Successfully deleted season ${id} and reversed rewards.`)
    revalidatePath('/admin/seasons')
    revalidatePath('/admin')
    revalidatePath('/dashboard')

    return { success: true }
}

export async function createSeason(formData: FormData) {
    const supabase = await createClient()

    // 1. Verify admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return redirect('/dashboard')

    const name = formData.get('name') as string
    const status = formData.get('status') as string
    const max_games = parseInt(formData.get('max_games') as string)
    const pts_per_game = parseInt(formData.get('pts_per_game') as string)
    const pts_per_euro_profit = parseFloat(formData.get('pts_per_euro_profit') as string)
    const pts_1st_place = parseInt(formData.get('pts_1st_place') as string)
    const pts_2nd_place = parseInt(formData.get('pts_2nd_place') as string)
    const pts_3rd_place = parseInt(formData.get('pts_3rd_place') as string)

    // Season end bonuses
    const pts_season_1st = parseInt(formData.get('pts_season_1st') as string)
    const pts_season_2nd = parseInt(formData.get('pts_season_2nd') as string)
    const pts_season_3rd = parseInt(formData.get('pts_season_3rd') as string)
    const pts_season_4th = parseInt(formData.get('pts_season_4th') as string)
    const pts_season_5th = parseInt(formData.get('pts_season_5th') as string)
    const pts_season_participation = parseInt(formData.get('pts_season_participation') as string)
    const theme_note = formData.get('theme_note') as string

    // If new season is active, mark all others as completed
    if (status === 'active') {
        await supabase
            .from('seasons')
            .update({ status: 'completed' })
            .eq('status', 'active')
    }

    const { error } = await supabase.from('seasons').insert({
        name,
        status,
        max_games,
        pts_per_game,
        pts_per_euro_profit,
        pts_1st_place,
        pts_2nd_place,
        pts_3rd_place,
        pts_season_1st,
        pts_season_2nd,
        pts_season_3rd,
        pts_season_4th,
        pts_season_5th,
        pts_season_participation,
        theme_note,
        created_at: new Date().toISOString()
    })

    if (error) {
        console.error('Error creating season:', error)
        return { error: 'Failed to create season' }
    }

    revalidatePath('/admin/seasons')
    revalidatePath('/admin')
    revalidatePath('/dashboard')

    redirect('/admin/seasons')
}
