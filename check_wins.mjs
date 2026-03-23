import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkWins() {
    console.log('--- Checking Profiles ---')
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('id, name, championship_wins, total_points, championship_badges_count')
        .in('name', ['GM Berna', 'Berna', 'Tapas'])

    if (pError) console.error('Error fetching profiles:', pError)
    else profiles.forEach(p => console.log(`Player: ${p.name}, XP: ${p.total_points}, Badges: ${p.championship_badges_count}, Wins: ${JSON.stringify(p.championship_wins)}`))

    console.log('\n--- Checking Completed Seasons ---')
    const { data: seasons, error: sError } = await supabase
        .from('seasons')
        .select('*')
        .eq('status', 'completed')

    if (sError) {
        console.error('Error fetching seasons:', sError)
        return
    }

    for (const season of seasons) {
        console.log(`\nSeason: ${season.name} (ID: ${season.id})`)
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
        if (standings.length > 0) {
            const [winnerId, points] = standings[0]
            const { data: winnerProfile } = await supabase.from('profiles').select('name').eq('id', winnerId).single()
            console.log(`Winner: ${winnerProfile?.name} with ${points} points`)
            console.log(`Season Bonuses: 1st=${season.pts_season_1st}, 2nd=${season.pts_season_2nd}, etc.`)
        } else {
            console.log('No points found for this season.')
        }
    }
}

checkWins()
