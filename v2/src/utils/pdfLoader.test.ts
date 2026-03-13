import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadPdfJS } from './pdfLoader';

describe('pdfLoader', () => {
    beforeEach(() => {
        vi.stubGlobal('document', {
            createElement: vi.fn(() => ({
                onload: null,
                onerror: null,
                src: '',
                integrity: '',
                crossOrigin: '',
                referrerPolicy: ''
            })),
            head: {
                appendChild: vi.fn()
            }
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (window as any).pdfjsLib;
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('returns existing pdfjsLib if already on window', async () => {
        const mockPdfjsLib = { some: 'lib' };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).pdfjsLib = mockPdfjsLib;

        const result = await loadPdfJS();
        expect(result).toBe(mockPdfjsLib);
    });

    it('creates a script tag and resolves when loaded', async () => {
        const mockScript: any = {
            set src(v: string) {},
            set integrity(v: string) {},
            set crossOrigin(v: string) {},
            set referrerPolicy(v: string) {},
        };
        
        vi.stubGlobal('document', {
            createElement: vi.fn(() => mockScript),
            head: {
                appendChild: vi.fn(() => {
                    // Simulate script load
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (window as any).pdfjsLib = { 
                        GlobalWorkerOptions: { workerSrc: '' } 
                    };
                    if (mockScript.onload) mockScript.onload();
                })
            }
        });

        const promise = loadPdfJS();
        const result = await promise;
        
        expect(result).toBeDefined();
        expect(result.GlobalWorkerOptions.workerSrc).toContain('pdf.worker.min.js');
    });
});
