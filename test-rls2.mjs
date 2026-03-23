import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// If we want to query pg_policies using the Supabase Javascript client, we need a DB function, or we just rely on psql.
// We can't query pg_policies via the Anon key REST endpoint because it's not exposed.
