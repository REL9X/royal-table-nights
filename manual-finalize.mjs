import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function finalizeBeta() {
    console.log('--- Finalizing Beta Season ---')

    // 1. Get the Beta season
    const { data: season } = await supabase.from('seasons').select('*').eq('name', 'Beta').single()
    if (!season) return console.log('Beta season not found')
    console.log('Season ID:', season.id)

    // 2. Fetch final seasonal standings
    const { data: sPointsData, error: sPointsError } = await supabase
        .from('session_players')
        .select('player_id, points_earned, events!inner(season_id, status)')
        .eq('events.season_id', season.id)
        .eq('events.status', 'completed')

    if (sPointsError) return console.error('Points fetch error:', sPointsError)
    console.log(`Found ${sPointsData?.length || 0} valid session_player records`)

    const pointsMap = {}
    sPointsData?.forEach((sp) => {
        pointsMap[sp.player_id] = (pointsMap[sp.player_id] || 0) + (sp.points_earned || 0)
    })

    const standings = Object.entries(pointsMap)
        .sort((a, b) => b[1] - a[1]) // Sort by points descending

    // 3. Distribute Rewards
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
            .select('name, total_points, championship_badges_count')
            .eq('id', playerId)
            .single()

        if (playerProfile) {
            const updates = {
                total_points: (playerProfile.total_points || 0) + bonus
            }

            // Award badge for 1st place
            if (rank === 1) {
                updates.championship_badges_count = (playerProfile.championship_badges_count || 0) + 1
            }

            const { error: pError } = await supabase.from('profiles').update(updates).eq('id', playerId)
            if (pError) console.error(`Error updating ${playerProfile.name}:`, pError)
            else console.log(`Rewarded ${playerProfile.name} (Rank ${rank}) with ${bonus} RP.`)
        }
    }

    // 4. Mark season as completed
    const { error: updateError } = await supabase
        .from('seasons')
        .update({ status: 'completed' })
        .eq('id', season.id)

    if (updateError) {
        console.error('Error finishing season:', updateError)
    } else {
        console.log('Successfully marked season as COMPLETED!')
    }
}

finalizeBeta()
