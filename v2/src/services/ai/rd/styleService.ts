import { supabase } from '../../supabase';
import { getModel } from '../aiCore';
import { MODELING_DISTILLER } from '../../../prompts/modeling';

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
            const { data: rawSignals, error } = await supabase
                .from('rd_modeling_feedback')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50); // Increased limit to find more context

            if (error || !rawSignals || rawSignals.length === 0) return null;

            // 2. Separate outcomes (interviews/offers) from stylistic signals
            const outcomes = rawSignals.filter(s => s.metadata?.outcome);
            const stylisticSignals = rawSignals.filter(s => !s.metadata?.outcome).slice(0, 25);

            const winningJobIds = new Set(
                outcomes
                    .filter(o => ['interview', 'offer', 'applied'].includes(o.metadata.outcome))
                    .map(o => o.metadata.job_id)
            );

            // 3. Format signals for the LLM with weighting
            const signalSummary = stylisticSignals.map(s => {
                const type = s.signal_type;
                const ctx = s.context;
                const jobId = s.metadata?.job_id;
                const isWinning = jobId && winningJobIds.has(jobId);

                const content = typeof s.output_content === 'string'
                    ? s.output_content.substring(0, 200)
                    : JSON.stringify(s.output_content).substring(0, 200);

                const correction = s.user_correction ? ` (User Edited To: ${JSON.stringify(s.user_correction).substring(0, 200)})` : '';

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

            const prompt = `
${MODELING_DISTILLER}

CONTEXT:
Some of the patterns below are marked as "WINNING PATTERNS." These correspond to resume/CL versions that directly resulted in an Interview or Offer. Prioritize these stylistic choices heavily.

USER SIGNALS:
${signalSummary}

STYLE GUIDE:
`.trim();

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
