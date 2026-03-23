import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function backfill() {
    console.log('--- START Backfill ---')

    // 0. Login as admin to have update permissions
    console.log('Logging in as admin...')
    const { error: loginError } = await supabase.auth.signInWithPassword({
        email: 'bernardodurancouto@gmail.com',
        password: 'berna1'
    })

    if (loginError) {
        console.error('Login failed:', loginError.message)
        // We'll try anyway, maybe RLS is loose or we are already authed
    }

    // 1. Get all completed seasons
    const { data: seasons, error: sError } = await supabase
        .from('seasons')
        .select('*')
        .eq('status', 'completed')

    if (sError) {
        console.error('Error fetching seasons:', sError)
        return
    }

    console.log(`Found ${seasons.length} completed seasons.`)

    for (const season of seasons) {
        console.log(`\nProcessing Season: ${season.name} (ID: ${season.id})`)

        // 2. Fetch all points for this season
        const { data: sPointsData } = await supabase
            .from('session_players')
            .select('player_id, points_earned, events!inner(season_id, status)')
            .eq('events.season_id', season.id)
            .eq('events.status', 'completed')

        const pointsMap = {}
        sPointsData?.forEach((sp) => {
            pointsMap[sp.player_id] = (pointsMap[sp.player_id] || 0) + (sp.points_earned || 0)
        })

        const standings = Object.entries(pointsMap).sort((a, b) => b[1] - a[1])
        console.log(`Standings: ${standings.length} players.`)

        for (let i = 0; i < standings.length; i++) {
            const [playerId, seasonPoints] = standings[i]
            const rank = i + 1

            // Only fixing 1st place for now for wins, but could fix badges too
            if (rank === 1) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', playerId).single()
                if (!profile) continue

                console.log(`Winner identified: ${profile.name}`)

                const currentWins = Array.isArray(profile.championship_wins) ? profile.championship_wins : []
                const alreadyRecorded = currentWins.some(w => w.seasonId === season.id)

                if (!alreadyRecorded) {
                    console.log(`Adding win record for ${profile.name}...`)
                    const newWin = {
                        seasonId: season.id,
                        seasonName: season.name,
                        rank: 1,
                        awardedAt: new Date().toISOString()
                    }

                    // Also check if they need the bonus points
                    // For Tapas Season 1, bonus was 5000. Current XP is 859.
                    // This is a strong indicator they never got it.
                    let bonusToApply = 0
                    if (rank === 1) bonusToApply = season.pts_season_1st || 0
                    // ... could add more ranks if needed

                    const updates = {
                        championship_wins: [...currentWins, newWin]
                    }

                    // Heuristic: If their total points are less than the bonus, they definitely didn't get it.
                    // Or we just trust the user that it's broken and apply it?
                    // Safe approach: check if they already have any win record for THIS season.
                    // If not, we assume the finalize failed/was partially done.

                    console.log(`Player currently has ${profile.total_points} XP.`)
                    console.log(`Applying ${bonusToApply} XP bonus and win record.`)

                    updates.total_points = (profile.total_points || 0) + bonusToApply
                    // Ensure badge count is at least the number of wins we now have
                    updates.championship_badges_count = Math.max(profile.championship_badges_count || 0, currentWins.length + 1)

                    const { error: uError } = await supabase.from('profiles').update(updates).eq('id', playerId)
                    if (uError) console.error(`Failed to update ${profile.name}:`, uError)
                    else console.log(`Successfully updated ${profile.name}!`)
                } else {
                    console.log(`Win record already exists for ${profile.name}.`)
                }
            }
        }
    }

    console.log('\n--- Backfill Complete ---')
}

backfill()
