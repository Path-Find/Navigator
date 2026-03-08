import { supabase } from "../supabase";
import { getUserFriendlyError, getRetryMessage } from "../../utils/errorMessages";
import { API_CONFIG } from "../../constants";

export type RetryProgressCallback = (message: string, attempt: number, maxAttempts: number) => void;

export interface ModelParams {
    task: 'extraction' | 'analysis' | 'interview';
    generationConfig?: {
        temperature?: number;
        maxOutputTokens?: number;
        responseMimeType?: string;
        responseSchema?: Record<string, unknown>;
    };
    model?: string;
    /** Feature tag for server-side tier gating (e.g. 'cover_letter', 'resume_tailor', 'gap_analysis', 'roadmap', 'role_model') */
    feature?: string;
}

export const getModel = async (params: ModelParams) => {
    return {
        generateContent: async (payload: { contents: { role: string; parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] }[]; generationConfig?: Record<string, unknown> }) => {
            const { generationConfig: payloadGenerationConfig, ...contentsOnly } = payload;
            const { data, error } = await supabase.functions.invoke('gemini-proxy', {
                body: {
                    payload: contentsOnly,
                    task: params.task,
                    generationConfig: payloadGenerationConfig ?? params.generationConfig,
                    feature: params.feature
                }
            });

            if (error) throw new Error(`Proxy Error: ${error.message}`);
            if (data?.error) {
                if (data.error === 'upgrade_required') throw new Error(`upgrade_required: ${data.message}`);
                throw new Error(`AI Error: ${data.error}`);
            }
            if (data?.text == null) throw new Error('AI Error: empty response from proxy');

            return {
                response: {
                    text: () => data.text as string,
                    usageMetadata: data.usage
                }
            };
        }
    };
};

export const logToSupabase = async (params: {
    event_type: string;
    model_name: string;
    prompt_text: string;
    response_text?: string;
    latency_ms?: number;
    status: 'success' | 'error';
    error_message?: string;
    metadata?: Record<string, unknown>;
    job_id?: string;
}) => {
    const redactContent = (text?: string) => {
        if (!text) return text;
        return text
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_REDACTED]")
            .replace(/(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/g, "[PHONE_REDACTED]");
    };

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        await supabase.from('logs').insert({
            user_id: userId,
            job_id: params.job_id,
            event_type: params.event_type,
            model_name: params.model_name,
            prompt_text: redactContent(params.prompt_text),
            response_text: redactContent(params.response_text),
            latency_ms: params.latency_ms,
            status: params.status,
            error_message: params.error_message,
            metadata: params.metadata || {}
        });

        // Token usage is now tracked centrally in the Edge Function for proxy calls.
        // We only log it to the logs table here for visibility.

    } catch (err) {
        console.error("Failed to write log to Supabase:", err);
    }
};

export const callWithRetry = async <T>(
    fn: (executionMetadata: Record<string, unknown>) => Promise<T>,
    context: { event_type: string; prompt: string; model: string; metadata?: Record<string, unknown>; job_id?: string },
    retries: number = API_CONFIG.MAX_RETRIES,
    initialDelay = API_CONFIG.INITIAL_RETRY_DELAY_MS,
    onProgress?: RetryProgressCallback
): Promise<T> => {
    let currentDelay = initialDelay;
    const startTime = Date.now();

    for (let i = 0; i < retries; i++) {
        const executionMetadata: Record<string, unknown> = {};
        try {
            const result = await fn(executionMetadata);
            const latency = Date.now() - startTime;
            logToSupabase({
                event_type: context.event_type,
                model_name: context.model,
                prompt_text: context.prompt,
                response_text: typeof result === 'string' ? result : JSON.stringify(result),
                latency_ms: latency,
                status: 'success',
                metadata: { ...context.metadata, ...executionMetadata },
                job_id: context.job_id
            });
            return result;
        } catch (error: unknown) {
            const err = error as Error;
            // Log the full error to console for debugging "Connection issue"
            console.error("AI Service Error:", err);
            const errorMessage = err.message || '';
            const isDailyQuota = errorMessage.includes("PerDay");

            if (isDailyQuota) {
                logToSupabase({
                    event_type: context.event_type,
                    model_name: context.model,
                    prompt_text: context.prompt,
                    status: 'error',
                    error_message: errorMessage,
                    latency_ms: Date.now() - startTime,
                    job_id: context.job_id
                });
                throw new Error(getUserFriendlyError("DAILY_QUOTA_EXCEEDED"), { cause: error });
            }

            const isQuotaError = (
                errorMessage.includes("429") ||
                errorMessage.includes("Quota") ||
                errorMessage.includes("quota") ||
                errorMessage.includes("High traffic")
            );

            if (isQuotaError && i < retries - 1) {
                const delaySeconds = currentDelay / 1000;
                const retryMsg = getRetryMessage(i + 1, retries, delaySeconds);
                if (onProgress) onProgress(retryMsg, i + 1, retries);
                await new Promise(resolve => setTimeout(resolve, currentDelay));
                currentDelay = currentDelay * API_CONFIG.RETRY_BACKOFF_MULTIPLIER;
            } else {
                logToSupabase({
                    event_type: context.event_type,
                    model_name: context.model,
                    prompt_text: context.prompt,
                    status: 'error',
                    error_message: errorMessage,
                    latency_ms: Date.now() - startTime,
                    metadata: { attempt: i + 1 },
                    job_id: context.job_id
                });
                if (isQuotaError) throw new Error(getUserFriendlyError("RATE_LIMIT_EXCEEDED"), { cause: error });
                throw new Error(getUserFriendlyError(err), { cause: error });
            }
        }
    }
    throw new Error("Request failed after multiple attempts. Please try again later.");
};

export const cleanJsonOutput = (text: string): string => {
    let cleaned = text.trim();
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch) {
        cleaned = codeBlockMatch[1];
    } else {
        cleaned = cleaned.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '');
    }
    return cleaned.trim();
};
