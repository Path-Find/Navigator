import Anthropic from '@anthropic-ai/sdk';

// Claude path for the AI proxy. The browser still sends Gemini-shaped requests
// (`contents` / `parts` / `inlineData` / `generationConfig`), so this file
// translates them to Anthropic's format and returns the same `{ text, usage }`
// the client already expects. Nothing outside the proxy needs to change.

type GeminiPart = { text?: string; inlineData?: { mimeType: string; data: string } };
type GeminiContent = { role?: string; parts?: GeminiPart[] };

export interface ClaudeCallInput {
    model: string;
    payload?: Record<string, unknown>;
    generationConfig?: Record<string, unknown>;
    system?: string;
    task: string;
}

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic());

function toBlocks(parts: GeminiPart[]): Anthropic.ContentBlockParam[] {
    const blocks: Anthropic.ContentBlockParam[] = [];
    for (const part of parts) {
        if (part.inlineData) {
            const { mimeType, data } = part.inlineData;
            if (mimeType === 'application/pdf') {
                blocks.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data } });
            } else if (mimeType.startsWith('image/')) {
                blocks.push({
                    type: 'image',
                    source: { type: 'base64', media_type: mimeType as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp', data },
                });
            } else {
                throw new Error(`Unsupported attachment type: ${mimeType}`);
            }
        } else if (part.text) {
            blocks.push({ type: 'text', text: part.text });
        }
    }
    return blocks;
}

export async function callClaude(input: ClaudeCallInput): Promise<{ text: string; usage: { totalTokenCount: number; inputTokens: number; outputTokens: number } }> {
    const contents = (input.payload?.contents ?? []) as GeminiContent[];
    const messages: Anthropic.MessageParam[] = contents.map((c) => ({
        role: c.role === 'model' ? 'assistant' : 'user',
        content: toBlocks(c.parts ?? []),
    }));

    const wantsJson = input.generationConfig?.responseMimeType === 'application/json';
    const system = [
        input.system,
        wantsJson ? 'Respond with a single valid JSON value only. No prose and no markdown code fences.' : undefined,
    ].filter(Boolean).join('\n\n') || undefined;

    // Haiku and Sonnet 5.5 reject non-default temperature, so it is deliberately not forwarded.
    const maxTokens = Math.min(Number(input.generationConfig?.maxOutputTokens) || 8192, 16000);

    const response = await getClient().messages.create({
        model: input.model,
        max_tokens: maxTokens,
        ...(system ? { system } : {}),
        // Bulk parsing needs little reasoning; scoring and writing get a middle setting.
        output_config: { effort: input.task === 'extraction' ? 'low' : 'medium' },
        messages,
    });

    if (response.stop_reason === 'refusal') {
        throw new Error('Claude declined this request.');
    }

    const text = response.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    return { text, usage: { totalTokenCount: inputTokens + outputTokens, inputTokens, outputTokens } };
}
