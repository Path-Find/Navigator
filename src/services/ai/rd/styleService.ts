import { getModel } from '../aiCore';
import { buildStyleDistillerPrompt } from './promptContext';
import { RdFeedbackService } from './feedbackService';

/**
 * Service for managing Personal Style Vectors (R&D).
 * Distills implicit and explicit signals into actionable prompt modifications.
 */
export class RdStyleService {
    /**
     * Analyzes recent feedback to generate a "Style Instruction" string.
     * This is the bridge between raw data and LLM behavior.
     */
    static async getPersonalizedStyle(userId: string, context: string): Promise<string | null> {
        try {
            // 1. Fetch recent signals and outcomes
            const rawSignals = await RdFeedbackService.getRecentSignals(userId, 50);
            if (rawSignals.length === 0) return null;

            const contextSignals = context === 'all'
                ? rawSignals
                : rawSignals.filter(s => s.context === context);

            // 2. Separate outcomes, artifact usage, and stylistic signals.
            const outcomes = rawSignals.filter(s => typeof s.metadata?.outcome === 'string');
            const artifactUsage = rawSignals.filter(s => s.metadata?.artifact_action && s.metadata?.artifact_hash);

            const winningArtifacts = new Map<string, 'interview' | 'offer'>();
            for (const outcome of outcomes) {
                const outcomeType = outcome.metadata?.outcome;
                if (outcomeType !== 'interview' && outcomeType !== 'offer') continue;

                const jobId = outcome.metadata?.job_id;
                if (typeof jobId !== 'string' || !outcome.createdAt) continue;

                const latestUsage = artifactUsage
                    .filter(signal => signal.metadata?.job_id === jobId
                        && signal.createdAt
                        && new Date(signal.createdAt).getTime() <= new Date(outcome.createdAt!).getTime())
                    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0];
                const artifactHash = latestUsage?.metadata?.artifact_hash;
                if (typeof artifactHash !== 'string') continue;

                const previous = winningArtifacts.get(artifactHash);
                if (!previous || (outcomeType === 'offer' && previous === 'interview')) {
                    winningArtifacts.set(artifactHash, outcomeType);
                }
            }

            const stylisticSignals = contextSignals
                .filter(s => !s.metadata?.outcome && !s.metadata?.artifact_action && s.outputContent != null)
                .slice(0, 25);

            // 3. Format signals for the LLM with weighting
            const signalSummary = stylisticSignals.map(s => {
                const type = s.signalType;
                const ctx = s.context;
                const artifactHash = typeof s.metadata?.artifact_hash === 'string' ? s.metadata.artifact_hash : null;
                const winningOutcome = artifactHash ? winningArtifacts.get(artifactHash) : undefined;

                const content = typeof s.outputContent === 'string'
                    ? s.outputContent.substring(0, 200)
                    : JSON.stringify(s.outputContent).substring(0, 200);

                const correction = s.userCorrection ? ` (User Edited To: ${JSON.stringify(s.userCorrection).substring(0, 200)})` : '';

                const weightLabel = winningOutcome
                    ? ` [ASSOCIATED WITH ${winningOutcome.toUpperCase()} - HIGH WEIGHT]`
                    : '';

                return `${weightLabel}[${type} in ${ctx}]: ${content}${correction}`;
            }).join('\n---\n');

            // 4. Call the Distiller Model
            const engine = await getModel({
                task: 'analysis',
                feature: 'style_distiller',
                generationConfig: {
                    temperature: 0.1, // Even lower for purely analytical extraction
                    maxOutputTokens: 200
                }
            });

            const prompt = buildStyleDistillerPrompt(signalSummary);

            const response = await engine.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });

            const styleGuide = response.response.text();

            if (!styleGuide) return "PERSONAL MODEL ACTIVE: Analyzing sensory data for signature style patterns...";

            return `USER STYLE MODEL [Active]: ${styleGuide}`;

        } catch (err) {
            console.error('[RdStyleService] Error distilling style:', err);
            return null;
        }
    }
}
