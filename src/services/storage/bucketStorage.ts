import { supabase } from '../supabase';

export interface CanonicalRole {
    id: string; // The canonical title (e.g. 'Software Engineer')
    guidelines?: {
        promptAdvice?: string[];
        tailoringFocus?: string[];
        coverLetterStrategy?: string;
    };
    created_at?: string;
}

// Session-level cache — role guidelines rarely change
const bucketCache = new Map<string, CanonicalRole | null>();

export const BucketStorage = {
    async getBucket(title: string): Promise<CanonicalRole | null> {
        if (bucketCache.has(title)) return bucketCache.get(title)!;

        const { data, error } = await supabase
            .from('canonical_roles')
            .select('*')
            .eq('id', title)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching bucket:', error);
            return null;
        }

        bucketCache.set(title, data);
        return data;
    },

    // Upsert and return the record in one round trip, then cache it
    async ensureAndGetBucket(title: string): Promise<CanonicalRole | null> {
        if (bucketCache.has(title)) return bucketCache.get(title)!;

        const { data, error } = await supabase
            .from('canonical_roles')
            .upsert({ id: title }, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('Error ensuring bucket:', error);
            bucketCache.set(title, null);
            return null;
        }

        bucketCache.set(title, data);
        return data;
    },

    async searchBuckets(query: string): Promise<CanonicalRole[]> {
        const { data, error } = await supabase
            .from('canonical_roles')
            .select('*')
            .ilike('id', `%${query}%`)
            .limit(10);

        if (error) {
            console.error('Error searching buckets:', error);
            return [];
        }

        return data || [];
    }
};
