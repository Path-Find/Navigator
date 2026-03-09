import { getModel } from '../aiCore';
import { TRAJECTORY_MAPPER_PROMPT } from '../../../prompts/modeling';
import { RdEmbeddingService } from './embeddingService';
import type { GrowthTrajectory } from './types';
import { ResumeStorage } from '../../storage/resumeStorage';

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

            const summaryBlock = currentProfile.blocks.find(b => b.type === 'summary');
            const summary = summaryBlock ? summaryBlock.bullets.join('\n') : '';

            // 2. Fetch history from embeddings table (Top 10 most relevant historical snippets)
            const historicalBlocks = await RdEmbeddingService.searchSimilar(userId, new Array(768).fill(0), 10);

            // 3. Prepare Prompt
            const prompt = `
${TRAJECTORY_MAPPER_PROMPT}

USER CONTEXT:
Target Role: ${targetTitle}

CURRENT PROFILE:
${JSON.stringify({
                name: currentProfile.name,
                summary: summary,
                blocks: currentProfile.blocks.map(b => ({ title: b.title, organization: b.organization, bullets: b.bullets }))
            }, null, 2)}

HISTORICAL SIGNALS (EXCERPTS):
${historicalBlocks.map((h: any) => `- [${h.source_type}]: ${h.metadata?.text_checksum}...`).join('\n')}
            `;

            // 4. Call AI
            const model = await getModel({
                task: 'generation',
                feature: 'role_model'
            });
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });
            const response = await result.response;
            const text = response.text();

            // 5. Parse JSON
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]) as GrowthTrajectory;
                }
            } catch (e) {
                console.error('[RdTrajectoryService] Failed to parse trajectory JSON:', e);
            }

            return null;
        } catch (err) {
            console.error('[RdTrajectoryService] Unexpected error:', err);
            return null;
        }
    }
}
