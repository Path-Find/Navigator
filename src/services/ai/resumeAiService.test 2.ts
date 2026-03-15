import { describe, it, expect, vi, beforeEach, afterEach, type MockedFunction } from 'vitest';
import { parseResumeFile } from './resumeAiService';
import * as aiCore from './aiCore';

// Mock aiCore
vi.mock('./aiCore', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callWithRetry: vi.fn(async (fn: (arg: any) => Promise<unknown>) => fn({})),
    getModel: vi.fn(),
    cleanJsonOutput: vi.fn((text: string) => text),
    AI_MODELS: { EXTRACTION: 'gemini-1.5-flash' }
}));

describe('resumeAiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid' });

        // Mock window.pdfjsLib
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).pdfjsLib = {
            getDocument: vi.fn(() => ({
                promise: Promise.resolve({
                    numPages: 2,
                    getPage: vi.fn(async (i: number) => ({
                        getTextContent: vi.fn(async () => ({
                            items: [{ str: `Page ${i} Content` }]
                        }))
                    }))
                })
            }))
        };
    });

    afterEach(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).pdfjsLib;
    });

    it('parses PDF resume correctly and extracts text in order', async () => {
        const generateContentMock = vi.fn().mockResolvedValue({
            response: {
                text: () => JSON.stringify([{ id: '1', title: 'Software Engineer', organization: 'Tech Co', bullets: ['Bullet 1'], isVisible: true }])
            }
        });

        (aiCore.getModel as MockedFunction<typeof aiCore.getModel>).mockResolvedValue({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            generateContent: generateContentMock as any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);

        const base64 = 'dummyBase64';
        const mimeType = 'application/pdf';

        await parseResumeFile(base64, mimeType);

        expect(generateContentMock).toHaveBeenCalled();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const callArgs = generateContentMock.mock.calls[0][0] as any;
        const promptParts = callArgs.contents[0].parts;

        // Find the part with "RESUME CONTENT:"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resumeContentPart = promptParts.find((p: any) => p.text && p.text.includes('RESUME CONTENT:'));
        expect(resumeContentPart).toBeDefined();

        const extractedText = resumeContentPart.text;

        // Verify order of extracted text
        const index1 = extractedText.indexOf('Page 1 Content');
        const index2 = extractedText.indexOf('Page 2 Content');

        expect(index1).not.toBe(-1);
        expect(index2).not.toBe(-1);
        expect(index1).toBeLessThan(index2);
    });
});
