import { bench, describe, vi } from 'vitest';
import { extractPdfText } from './resumeAiService';

// Implement sequential version for comparison
const extractPdfTextSequential = async (base64: string): Promise<string> => {
    try {
        const pdfjsLib = (window as unknown as { pdfjsLib: { getDocument: (opts: { data: string }) => { promise: Promise<{ numPages: number; getPage: (i: number) => Promise<{ getTextContent: () => Promise<{ items: { str: string }[] }> }> }> } } }).pdfjsLib;
        if (!pdfjsLib) return "";
        const loadingTask = pdfjsLib.getDocument({ data: atob(base64) });
        const pdf = await loadingTask.promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item: { str: string }) => item.str).join(' ') + '\n';
        }
        return fullText;
    } catch {
        return "";
    }
}

describe('PDF Extraction Performance', () => {
    const mockPdf = {
        numPages: 10,
        getPage: vi.fn(async (i: number) => {
            await new Promise(resolve => setTimeout(resolve, 10)); // simulate 10ms delay per page
            return {
                getTextContent: vi.fn(async () => {
                    await new Promise(resolve => setTimeout(resolve, 5)); // simulate 5ms delay per content extraction
                    return {
                        items: [{ str: `Page ${i} Content` }]
                    };
                })
            };
        })
    };

    const mockPdfjsLib = {
        getDocument: vi.fn(() => ({
            promise: Promise.resolve(mockPdf)
        }))
    };

    // Setup mocks
    if (typeof window === 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).window = { pdfjsLib: mockPdfjsLib };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).atob = (s: string) => s;
    } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).pdfjsLib = mockPdfjsLib;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(window as any).atob) (window as any).atob = (s: string) => s;
    }

    // Also stub global atob if missing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof atob === 'undefined') (globalThis as any).atob = (s: string) => s;

    const dummyBase64 = 'dummyBase64';

    bench('Concurrent Extraction (Promise.all)', async () => {
        await extractPdfText(dummyBase64);
    });

    bench('Sequential Extraction (Loop)', async () => {
        await extractPdfTextSequential(dummyBase64);
    });
});
