import { RdEmbeddingService } from './embeddingService';
import { dataClient } from '../../../lib/data-client';

export interface SimilarityResult {
    score: number;
    explanation: string;
    matchedBlocks: Array<{
        title: string;
        score: number;
    }>;
}

/**
 * Service for Vector-Based Similarity Analysis (Level 4 R&D).
 * Bridges the gap between keyword matching and semantic alignment.
 */
export class RdSimilarityService {
    /**
     * Calculates the cosine similarity between two vectors.
     */
    static cosineSimilarity(vecA: number[], vecB: number[]): number {
        let dotProduct = 0;
        let mA = 0;
        let mB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            mA += vecA[i] * vecA[i];
            mB += vecB[i] * vecB[i];
        }
        mA = Math.sqrt(mA);
        mB = Math.sqrt(mB);
        const similarity = dotProduct / (mA * mB);
        return Math.max(0, Math.min(1, similarity));
    }

    /**
     * Scores a job description against the user's master profile vector space.
     */
    static async calculateSemanticMatch(userId: string, jobDescription: string): Promise<SimilarityResult> {
        try {
            // 1. Vectorize the job description
            const jobVector = await RdEmbeddingService.vectorizeAndStore(
                userId,
                jobDescription,
                'job_role',
                'current_analysis'
            );

            if (!jobVector.success || !jobVector.embedding) {
                throw new Error('Failed to vectorize job description');
            }

            // 2. Fetch the user's experience blocks (embeddings)
            const { data: userEmbeddings, error } = await dataClient
                .from('rd_user_embeddings')
                .select('*')
                .eq('user_id', userId)
                .eq('source_type', 'experience_block');

            if (error || !userEmbeddings || userEmbeddings.length === 0) {
                return {
                    score: 0,
                    explanation: "No professional embeddings found. Please 'Map Latent Space' in settings.",
                    matchedBlocks: []
                };
            }

            // 3. Calculate similarity for each block
            const blockScores = userEmbeddings.map(row => {
                const score = this.cosineSimilarity(jobVector.embedding!, row.embedding);
                return {
                    title: row.source_id, // We'll need to join or fetch titles later for better UX
                    score: score
                };
            });

            // 4. Calculate aggregate score (weighted towards best matches)
            blockScores.sort((a, b) => b.score - a.score);
            const topScores = blockScores.slice(0, 3);
            const averageTopScore = topScores.reduce((acc, s) => acc + s.score, 0) / (topScores.length || 1);

            // Normalize: 0.8+ is excellent, <0.4 is poor
            const normalizedScore = Math.round(averageTopScore * 100);

            return {
                score: normalizedScore,
                explanation: `Semantic alignment based on ${userEmbeddings.length} professional vectors. Best match: ${Math.round(topScores[0]?.score * 100)}% similarity.`,
                matchedBlocks: topScores
            };
        } catch (err) {
            console.error('[RdSimilarityService] Match error:', err);
            return {
                score: 0,
                explanation: "Failed to calculate semantic distance.",
                matchedBlocks: []
            };
        }
    }
}
