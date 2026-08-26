import { getModel, callWithRetry, cleanJsonOutput } from '../aiCore';
import { RdEmbeddingService } from './embeddingService';
import type { GrowthTrajectory } from './types';
import { ResumeStorage } from '../../storage/resumeStorage';
import { buildTrajectoryPrompt, type HistoricalSignal } from './promptContext';

export class RdTrajectoryService {
    /**
     * Generates a trajectory analysis for a user relative to a target role.
     * This is Level 2 of the Modeling Engine.
     */
    static async getTrajectoryProjection(userId: string, targetTitle: string): Promise<GrowthTrajectory | null> {
        try {
            // 1. Fetch current profile data
            const resumes = await ResumeStorage.getResumes();
            const currentProfile = resumes[0]; // Simplification for R&D

            if (!currentProfile) return null;

            // 2. Fetch history from embeddings table (Top 10 most relevant historical snippets)
            const historicalBlocks = await RdEmbeddingService.searchSimilar(userId, new Array(768).fill(0), 10);

            // 3. Prepare Prompt
            const prompt = buildTrajectoryPrompt(
                targetTitle,
                currentProfile,
                historicalBlocks as HistoricalSignal[]
            );

            // 4. Call AI
            return await callWithRetry(async (metadata) => {
                const model = await getModel({ task: 'generation', feature: 'role_model' });
                const response = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' },
                });
                metadata.token_usage = response.response.usageMetadata;
                return JSON.parse(cleanJsonOutput(response.response.text())) as GrowthTrajectory;
            }, { event_type: 'trajectory_projection', prompt, model: 'dynamic' });
        } catch (err) {
            console.error('[RdTrajectoryService] Unexpected error:', err);
            return null;
        }
    }
}
