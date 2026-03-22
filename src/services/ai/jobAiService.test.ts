import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanCoverLetterOutput } from './jobAiService';

// Heavy AI/external deps — isolate so we can test pure logic without network calls
vi.mock('./aiCore', () => ({
    getModel: vi.fn(),
    callWithRetry: vi.fn(),
    cleanJsonOutput: vi.fn((s: string) => s.trim()),
}));

vi.mock('../storage/bucketStorage', () => ({
    BucketStorage: { getBucket: vi.fn().mockResolvedValue(null) },
}));

vi.mock('../../prompts/index', () => ({
    JOB_ANALYSIS_PROMPTS: {
        JOB_FIT_ANALYSIS: { DEFAULT: vi.fn(() => 'mock-prompt') },
        TAILORED_SUMMARY: vi.fn(() => 'mock-summary-prompt'),
    },
    COVER_LETTER_PROMPTS: {
        COVER_LETTER: {
            VARIANTS: { v1_direct: 'v1_direct' },
            GENERATE: vi.fn(() => 'mock-cl-prompt'),
        },
        CRITIQUE_COVER_LETTER: vi.fn(() => 'mock-critique-prompt'),
    },
}));

describe('cleanCoverLetterOutput', () => {
    it('strips markdown code block with json tag', () => {
        const input = '```json\n{"cover_letter": "Hello world"}\n```';
        expect(cleanCoverLetterOutput(input)).toBe('Hello world');
    });

    it('strips generic markdown code block', () => {
        const input = '```\nDear Hiring Manager,\n\nI am writing...\n```';
        expect(cleanCoverLetterOutput(input)).toBe('Dear Hiring Manager,\n\nI am writing...');
    });

    it('strips markdown code block with text tag', () => {
        const input = '```text\nSome letter content\n```';
        expect(cleanCoverLetterOutput(input)).toBe('Some letter content');
    });

    it('handles dangling opening backticks', () => {
        const input = '```json\nDear Manager,';
        expect(cleanCoverLetterOutput(input)).toBe('Dear Manager,');
    });

    it('handles dangling closing backticks', () => {
        const input = 'Dear Manager,\n```';
        expect(cleanCoverLetterOutput(input)).toBe('Dear Manager,');
    });

    it('returns plain text unchanged', () => {
        const input = 'Dear Hiring Manager,\n\nThank you for the opportunity.';
        expect(cleanCoverLetterOutput(input)).toBe(input);
    });

    it('extracts cover_letter key from JSON', () => {
        const input = '{"cover_letter": "My letter here."}';
        expect(cleanCoverLetterOutput(input)).toBe('My letter here.');
    });

    it('extracts text key from JSON', () => {
        const input = '{"text": "My text here."}';
        expect(cleanCoverLetterOutput(input)).toBe('My text here.');
    });

    it('extracts content key from JSON', () => {
        const input = '{"content": "My content here."}';
        expect(cleanCoverLetterOutput(input)).toBe('My content here.');
    });

    it('returns raw JSON if it has no known keys', () => {
        const input = '{"unknown_key": "value"}';
        expect(cleanCoverLetterOutput(input)).toBe(input);
    });

    it('trims surrounding whitespace', () => {
        const input = '  \n  Dear Manager,\n  \n  ';
        expect(cleanCoverLetterOutput(input)).toBe('Dear Manager,');
    });
});
