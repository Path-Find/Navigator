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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async getPersonalizedStyle(userId: string, _context: string): Promise<string | null> {
        try {
            // 1. Fetch recent signals and outcomes
            const rawSignals = await RdFeedbackService.getRecentSignals(userId, 50);
            if (rawSignals.length === 0) return null;

            // 2. Separate outcomes (interviews/offers) from stylistic signals
            const outcomes = rawSignals.filter(s => typeof s.metadata?.outcome === 'string');
            const stylisticSignals = rawSignals.filter(s => !s.metadata?.outcome).slice(0, 25);

            const winningJobIds = new Set(
                outcomes
                    .filter(o => ['interview', 'offer'].includes(String(o.metadata?.outcome)))
                    .map(o => o.metadata?.job_id)
                    .filter((jobId): jobId is string => typeof jobId === 'string')
            );

            // 3. Format signals for the LLM with weighting
            const signalSummary = stylisticSignals.map(s => {
                const type = s.signalType;
                const ctx = s.context;
                const jobId = typeof s.metadata?.job_id === 'string' ? s.metadata.job_id : null;
                const isWinning = jobId && winningJobIds.has(jobId);

                const content = typeof s.outputContent === 'string'
                    ? s.outputContent.substring(0, 200)
                    : JSON.stringify(s.outputContent).substring(0, 200);

                const correction = s.userCorrection ? ` (User Edited To: ${JSON.stringify(s.userCorrection).substring(0, 200)})` : '';

                const weightLabel = isWinning ? ' [WINNING PATTERN - HIGH WEIGHT]' : '';

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
