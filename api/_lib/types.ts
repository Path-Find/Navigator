// Shapes for data crossing the network boundary. `await req.json()` and
// `await response.json()` both return `unknown`, so every field here is optional
// on purpose — these describe what we *expect*, not what we're guaranteed. The
// runtime guards at each call site are what actually validate; these types just
// stop TypeScript from silently accepting `data.candidates[0].content.parts`.

export interface GeminiResponse {
    candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
    }>;
    embedding?: { values?: number[] };
    usageMetadata?: { totalTokenCount?: number } & Record<string, unknown>;
}

/** Pulls the concatenated text out of a Gemini generateContent response. */
export function extractText(data: GeminiResponse): string {
    const parts = data.candidates?.[0]?.content?.parts;
    if (!parts) return '';
    return parts.map((p) => p.text ?? '').join('');
}
