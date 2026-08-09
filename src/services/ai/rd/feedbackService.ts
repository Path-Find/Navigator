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

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const anonymizeText = (value: string, sensitiveValues: ReadonlyArray<string | null | undefined>): string => {
    const result = value
        .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[EMAIL]')
        .replace(/https?:\/\/[^\s)]+/gi, '[URL]')
        .replace(/(?:\+?\d[\s().-]?){7,}\d/g, '[PHONE]')
        .replace(/\b[0-9a-f]{8}-[0-9a-f-]{27,}\b/gi, '[ID]');

    return sensitiveValues.reduce<string>((sanitized, sensitiveValue) => {
        if (typeof sensitiveValue !== 'string' || sensitiveValue.trim().length < 2) return sanitized;
        return sanitized.replace(new RegExp(escapeRegExp(sensitiveValue.trim()), 'gi'), '[PRIVATE]');
    }, result);
};

const anonymizeJson = (value: JsonValue | undefined | null, sensitiveValues: ReadonlyArray<string | null | undefined>): JsonValue | null | undefined => {
    if (typeof value === 'string') return anonymizeText(value, sensitiveValues);
    if (Array.isArray(value)) return value.map(item => anonymizeJson(item, sensitiveValues) as JsonValue);
    if (value && typeof value === 'object') {
        const anonymizedObject: Record<string, JsonValue> = {};
        for (const [key, item] of Object.entries(value)) {
            anonymizedObject[key] = anonymizeJson(item, sensitiveValues) as JsonValue;
        }
        return anonymizedObject;
    }
    return value;
};

/**
 * NextGen's feedback transport. R&D signals use the same Neon Auth + Vercel
 * Function boundary as the rest of the migrated application.
 */
export class RdFeedbackService {
    static async captureSignal(_userId: string, feedback: ModelingFeedback, sensitiveValues: ReadonlyArray<string | null | undefined> = []): Promise<{ success: boolean; error?: string }> {
        void _userId;
        try {
            const headers = await getAuthHeaders();
            if (!headers) return { success: false, error: 'Authentication required.' };

            const anonymizedFeedback: ModelingFeedback = {
                ...feedback,
                outputContent: anonymizeJson(feedback.outputContent, sensitiveValues),
                userCorrection: anonymizeJson(feedback.userCorrection, sensitiveValues),
            };

            const response = await fetch('/api/rd-feedback', {
                method: 'POST',
                headers,
                body: JSON.stringify(anonymizedFeedback),
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
        const isPositive = outcome === 'interview' || outcome === 'offer';
        const isNegative = outcome === 'rejected';
        return this.captureSignal(userId, {
            // Applying or being ghosted tells us that the application reached
            // an employer, not whether the writing was effective.
            signalType: isPositive
                ? 'explicit_approval'
                : isNegative
                    ? 'explicit_correction'
                    : 'implicit_usage',
            context: 'match_logic',
            impactScore: isPositive ? (outcome === 'offer' ? 8 : 5) : isNegative ? -1 : 0,
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
