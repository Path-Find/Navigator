import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase credentials. Cloud features will be disabled.');
}

// Only create a real client if we have credentials, otherwise create a dummy
// to prevent synchronous crashes on import and runtime errors during init.
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder');

export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseAnonKey;
};
