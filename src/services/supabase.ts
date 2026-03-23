import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.PROD) {
        throw new Error('Missing Supabase credentials: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
    }
    console.warn('Missing Supabase credentials. Cloud features will be disabled.');
}

// In dev without credentials, use a placeholder to prevent import-time crashes.
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder');

export const isSupabaseConfigured = () => {
    return !!supabaseUrl && !!supabaseAnonKey;
};
