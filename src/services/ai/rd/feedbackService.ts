import { getAccessToken } from '../../../lib/auth-client';

export type SignalType = 'explicit_approval' | 'explicit_correction' | 'implicit_usage';
export type FeedbackContext = 'tailoring' | 'match_logic' | 'cover_letter';

type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface ModelingFeedback {
    roleModelId?: string | null;
    signalType: SignalType;
    context: FeedbackContext;
    inputPromptVersion?: string | null;
    outputContent?: JsonValue;
    userCorrection?: JsonValue | null;
    impactScore?: number;
    metadata?: Record<string, JsonValue> | null;
}

export interface ModelingSignal extends ModelingFeedback {
    roleModelId: string | null;
    inputPromptVersion: string | null;
    outputContent: JsonValue;
    userCorrection: JsonValue | null;
    impactScore: number;
    metadata: Record<string, JsonValue> | null;
    createdAt?: string;
}

interface FeedbackStats {
    total: number;
    breakdown: Record<string, number>;
}

const getAuthHeaders = async (): Promise<HeadersInit | null> => {
    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : null;
};

const readError = async (response: Response): Promise<string> => {
    const body = await response.json().catch(() => null) as { error?: unknown } | null;
    return typeof body?.error === 'string' ? body.error : `Feedback request failed (${response.status}).`;
};

/**
 * NextGen's feedback transport. R&D signals use the same Neon Auth + Vercel
 * Function boundary as the rest of the migrated application.
 */
export class RdFeedbackService {
    static async captureSignal(_userId: string, feedback: ModelingFeedback): Promise<{ success: boolean; error?: string }> {
        void _userId;
        try {
            const headers = await getAuthHeaders();
            if (!headers) return { success: false, error: 'Authentication required.' };

            const response = await fetch('/api/rd-feedback', {
                method: 'POST',
                headers,
                body: JSON.stringify(feedback),
            });
            if (!response.ok) {
                const error = await readError(response);
                console.error('[RdFeedbackService] Error capturing signal:', error);
                return { success: false, error };
            }
            return { success: true };
        } catch (error) {
            console.error('[RdFeedbackService] Unexpected error:', error);
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }

    static async logImplicitSuccess(userId: string, roleModelId: string, context: FeedbackContext, content: JsonValue) {
        return this.captureSignal(userId, {
            roleModelId,
            context,
            signalType: 'implicit_usage',
            outputContent: content,
            impactScore: 1,
        });
    }

    static async captureOutcome(userId: string, jobId: string, outcome: string) {
        const isNegative = outcome === 'rejected' || outcome === 'ghosted';
        return this.captureSignal(userId, {
            signalType: isNegative ? 'explicit_correction' : 'explicit_approval',
            context: 'match_logic',
            impactScore: isNegative ? -1 : 5,
            metadata: { job_id: jobId, outcome },
        });
    }

    static async getRecentSignals(_userId: string, limit = 50): Promise<ModelingSignal[]> {
        void _userId;
        try {
            const headers = await getAuthHeaders();
            if (!headers) return [];
            const response = await fetch(`/api/rd-feedback?limit=${encodeURIComponent(String(limit))}`, { headers });
            if (!response.ok) {
                console.error('[RdFeedbackService] Error loading signals:', await readError(response));
                return [];
            }
            const body = await response.json() as { signals?: ModelingSignal[] };
            return body.signals || [];
        } catch (error) {
            console.error('[RdFeedbackService] Unexpected error loading signals:', error);
            return [];
        }
    }

    static async getSignalStats(_userId: string): Promise<FeedbackStats> {
        void _userId;
        try {
            const headers = await getAuthHeaders();
            if (!headers) return { total: 0, breakdown: {} };
            const response = await fetch('/api/rd-feedback?mode=stats', { headers });
            if (!response.ok) {
                console.error('[RdFeedbackService] Error loading signal stats:', await readError(response));
                return { total: 0, breakdown: {} };
            }
            return await response.json() as FeedbackStats;
        } catch (error) {
            console.error('[RdFeedbackService] Unexpected error loading signal stats:', error);
            return { total: 0, breakdown: {} };
        }
    }
}
