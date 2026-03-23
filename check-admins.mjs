import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAdmins() {
    const { data: admins } = await supabase
        .from('profiles')
        .select('id, name, role')
        .eq('role', 'admin')

    console.log('Registered Admins:', admins)
}

checkAdmins()
