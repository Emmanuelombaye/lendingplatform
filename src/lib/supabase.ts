import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

// Browser client — uses anon key, respects Row Level Security
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server client — uses service role key, bypasses RLS (server-side only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
