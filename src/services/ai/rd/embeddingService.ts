import { dataClient } from '../../../lib/data-client';
import { getEmbeddingModel } from '../aiCore';

export type EmbeddingSource = 'full_profile' | 'experience_block' | 'onboarding_goal' | 'job_role';

/**
 * Service for the Professional Latent Space (Phase 2 R&D).
 * Manages vector embeddings for high-dimensional modeling.
 */
export class RdEmbeddingService {
    /**
     * Vectorizes text and stores it in the isolated R&D table.
     */
    static async vectorizeAndStore(userId: string, text: string, sourceType: EmbeddingSource, sourceId?: string) {
        try {
            const model = await getEmbeddingModel({
                task: 'embedding',
                feature: 'role_model'
            });

            const embedding = await model.embedContent(text);

            const { error } = await dataClient
                .from('rd_user_embeddings')
                .upsert({
                    user_id: userId,
                    source_type: sourceType,
                    source_id: sourceId,
                    embedding: embedding,
                    metadata: { text_checksum: btoa(text).substring(0, 10) },
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id, source_type, source_id'
                });

            if (error) {
                console.error('[RdEmbeddingService] Error storing embedding:', error);
                return { success: false, error };
            }

            return { success: true, embedding };
        } catch (err) {
            console.error('[RdEmbeddingService] Unexpected error:', err);
            return { success: false, error: err };
        }
    }

    /**
     * Finds similar professional experiences or roles.
     * Use this for trajectory prediction.
     */
    static async searchSimilar(userId: string, vector: number[], limit: number = 5) {
        try {
            // Note: This requires a custom RPC in Supabase to perform vector comparison
            const { data, error } = await dataClient.rpc('match_rd_embeddings', {
                query_embedding: vector,
                match_limit: limit,
                p_user_id: userId
            });

            if (error) {
                console.error('[RdEmbeddingService] Search error:', error);
                return [];
            }

            return data;
        } catch (err) {
            console.error('[RdEmbeddingService] Unexpected search error:', err);
            return [];
        }
    }
}
