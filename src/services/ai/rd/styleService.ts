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
    static async getPersonalizedStyle(userId: string, _context: string): Promise<string | null> {
        try {
            // 1. Fetch recent signals
            const { data: signals, error } = await supabase
                .from('rd_modeling_feedback')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(25);

            if (error || !signals || signals.length === 0) return null;

            // 2. Format signals for the LLM
            const signalSummary = (signals as any[]).map(s => {
                const type = s.signal_type;
                const ctx = s.context;
                const content = typeof s.output_content === 'string'
                    ? s.output_content.substring(0, 200)
                    : JSON.stringify(s.output_content).substring(0, 200);
                const correction = s.user_correction ? ` (User Edited To: ${JSON.stringify(s.user_correction).substring(0, 200)})` : '';

                return `[${type} in ${ctx}]: ${content}${correction}`;
            }).join('\n---\n');

            // 3. Call the Distiller Model
            const engine = await getModel({
                task: 'analysis',
                feature: 'style_distiller',
                generationConfig: {
                    temperature: 0.2, // Low temp for consistency
                    maxOutputTokens: 150
                }
            });

            const prompt = `${MODELING_DISTILLER}\n\nUSER SIGNALS:\n${signalSummary}\n\nSTYLE GUIDE:`;

            const response = await engine.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });

            const styleGuide = response.response.text();

            if (!styleGuide) return "PERSONAL MODEL ACTIVE: Insufficient signals to resolve specific style nuances yet.";

            return `USER STYLE MODEL [Active]: ${styleGuide}`;

        } catch (err) {
            console.error('[RdStyleService] Error distilling style:', err);
            return null;
        }
    }
}
