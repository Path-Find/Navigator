import { supabase } from '../../supabase';

export type SignalType = 'explicit_approval' | 'explicit_correction' | 'implicit_usage';
export type FeedbackContext = 'tailoring' | 'match_logic' | 'cover_letter';

interface ModelingFeedback {
    roleModelId?: string;
    signalType: SignalType;
    context: FeedbackContext;
    inputPromptVersion?: string;
    outputContent: any;
    userCorrection?: any;
    impactScore?: number;
    metadata?: Record<string, any>;
}

/**
 * Service for capturing high-fidelity R&D feedback.
 * This service is intended to be sequestered from production usage.
 */
export class RdFeedbackService {
    /**
     * Captures a success or correction signal for the Modeling Engine.
     */
    static async captureSignal(userId: string, feedback: ModelingFeedback) {
        try {
            const { error } = await supabase
                .from('rd_modeling_feedback')
                .insert({
                    user_id: userId,
                    role_model_id: feedback.roleModelId,
                    signal_type: feedback.signalType,
                    context: feedback.context,
                    input_prompt_version: feedback.inputPromptVersion,
                    output_content: feedback.outputContent,
                    user_correction: feedback.userCorrection,
                    impact_score: feedback.impactScore || 0,
                    metadata: feedback.metadata || {}
                });

            if (error) {
                console.error('[RdFeedbackService] Error capturing signal:', error);
                return { success: false, error };
            }

            return { success: true };
        } catch (err) {
            console.error('[RdFeedbackService] Unexpected error:', err);
            return { success: false, error: err };
        }
    }

    /**
     * Convenience method to log implicit success when a user saves something.
     */
    /**
     * Convenience method to log implicit success when a user saves something.
     */
    static async logImplicitSuccess(userId: string, roleModelId: string, context: FeedbackContext, content: any) {
        return this.captureSignal(userId, {
            roleModelId,
            context,
            signalType: 'implicit_usage',
            outputContent: content,
            impactScore: 1
        });
    }

    /**
     * Captures an outcome signal (Success/Failure) to correlate with modeling data.
     */
    static async captureOutcome(userId: string, jobId: string, outcome: string) {
        const { error } = await supabase
            .from('rd_modeling_feedback')
            .insert({
                user_id: userId,
                signal_type: outcome === 'rejected' ? 'explicit_correction' : 'explicit_approval',
                context: 'match_logic',
                impact_score: outcome === 'rejected' ? -1 : 5,
                metadata: { job_id: jobId, outcome }
            });

        return { success: !error, error };
    }
    /**
     * Fetches counts of signals captured for a user.
     */
    static async getSignalStats(userId: string) {
        const { data, error } = await supabase
            .from('rd_modeling_feedback')
            .select('signal_type', { count: 'exact' })
            .eq('user_id', userId);

        if (error) return { total: 0, breakdown: {} };

        const stats = (data || []).reduce((acc: any, signal: any) => {
            acc[signal.signal_type] = (acc[signal.signal_type] || 0) + 1;
            return acc;
        }, {});

        return {
            total: data.length,
            breakdown: stats
        };
    }
}
