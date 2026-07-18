import { NeonPostgrestClient, fetchWithToken } from '@neondatabase/postgrest-js';
import { getAccessToken } from './auth-client';

// Neon's Data API — a PostgREST-compatible endpoint (same protocol Supabase's
// client uses) with RLS enforced via the Neon Auth JWT (auth.uid() in policies,
// same as Supabase's auth.uid()). This is why `.from('table').select()...` calls
// throughout the storage layer barely need to change — same underlying library
// (@neondatabase/postgrest-js wraps @supabase/postgrest-js directly).
export const dataClient = new NeonPostgrestClient({
    dataApiUrl: import.meta.env.VITE_NEON_DATA_API_URL,
    options: {
        global: {
            fetch: fetchWithToken(getAccessToken),
        },
    },
});
