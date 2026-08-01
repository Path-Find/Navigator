import { dataClient } from '../../lib/data-client';

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

        const { data, error } = await dataClient
            .from('canonical_roles')
            .select('*')
            .eq('id', title)
            .limit(1);

        if (error) {
            console.error('[BucketStorage] Failed to fetch bucket:', error);
            return null;
        }

        const bucket = data?.[0] ?? null;
        bucketCache.set(title, bucket);
        return bucket;
    },

    // Upsert and return the record in one round trip, then cache it
    async ensureAndGetBucket(title: string): Promise<CanonicalRole | null> {
        if (bucketCache.has(title)) return bucketCache.get(title)!;

        const { data, error } = await dataClient
            .from('canonical_roles')
            .upsert({ id: title }, { onConflict: 'id' })
            .select();

        if (error) {
            console.error('[BucketStorage] Failed to create bucket:', error);
            bucketCache.set(title, null);
            return null;
        }

        const bucket = data?.[0] ?? null;
        bucketCache.set(title, bucket);
        return bucket;
    },

    async searchBuckets(query: string): Promise<CanonicalRole[]> {
        const { data, error } = await dataClient
            .from('canonical_roles')
            .select('*')
            .ilike('id', `%${query}%`)
            .limit(10);

        if (error) {
            console.error('[BucketStorage] Failed to search buckets:', error);
            return [];
        }

        return data || [];
    }
};
