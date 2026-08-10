import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RdFeedbackService } from './feedbackService';

const { mockGetAccessToken, mockFetch } = vi.hoisted(() => ({
    mockGetAccessToken: vi.fn(),
    mockFetch: vi.fn(),
}));

vi.mock('../../../lib/auth-client', () => ({
    getAccessToken: mockGetAccessToken,
}));

describe('RdFeedbackService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockGetAccessToken.mockResolvedValue('test-token');
        vi.stubGlobal('fetch', mockFetch);
    });

    it('records an interview as a positive outcome through the Neon API', async () => {
        mockFetch.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 201 }));

        const result = await RdFeedbackService.captureOutcome('user-1', 'job-1', 'interview');

        expect(result).toEqual({ success: true });
        expect(mockFetch).toHaveBeenCalledWith('/api/rd-feedback', expect.objectContaining({
            method: 'POST',
            headers: { Authorization: 'Bearer test-token', 'Content-Type': 'application/json' },
        }));
        expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
            signalType: 'explicit_approval',
            context: 'match_logic',
            impactScore: 5,
            metadata: { job_id: 'job-1', outcome: 'interview' },
        });
    });

    it('redacts known personal values and common identifiers from modeling content', async () => {
        mockFetch.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 201 }));

        await RdFeedbackService.captureSignal('user-1', {
            signalType: 'explicit_approval',
            context: 'cover_letter',
            outputContent: 'Contact Ryan at ryan@example.com or https://example.com/123.',
            userCorrection: 'Call 416-555-1234.',
        }, ['Ryan']);

        expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toMatchObject({
            outputContent: 'Contact [PRIVATE] at [EMAIL] or [URL]',
            userCorrection: 'Call [PHONE].',
        });
    });

    it('records copy usage as a metadata-only pointer to the exact letter version', async () => {
        mockFetch.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 201 }));

        await RdFeedbackService.captureArtifactUsage('user-1', {
            jobId: 'job-1',
            roleModelId: 'software-engineer',
            promptVersion: 'v2',
            styleCategory: 'storytelling',
            styleLabel: 'Narrative & Mission-Led',
            content: 'Contact Ryan at ryan@example.com.',
            action: 'copy',
            sensitiveValues: ['Ryan'],
        });

        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.outputContent).toBeUndefined();
        expect(body.metadata).toMatchObject({
            job_id: 'job-1',
            artifact_action: 'copy',
            artifact_type: 'cover_letter',
            style_category: 'storytelling',
            style_label: 'Narrative & Mission-Led',
        });
        expect(body.metadata.artifact_hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('treats an offer as the strongest positive outcome', async () => {
        mockFetch.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 201 }));

        await RdFeedbackService.captureOutcome('user-1', 'job-1', 'offer');

        expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toMatchObject({
            signalType: 'explicit_approval',
            impactScore: 8,
            metadata: { job_id: 'job-1', outcome: 'offer' },
        });
    });

    it('keeps applied and ghosted outcomes neutral', async () => {
        mockFetch.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 201 }));

        await RdFeedbackService.captureOutcome('user-1', 'job-1', 'applied');
        await RdFeedbackService.captureOutcome('user-1', 'job-2', 'ghosted');

        expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toMatchObject({
            signalType: 'implicit_usage',
            impactScore: 0,
            metadata: { outcome: 'applied' },
        });
        expect(JSON.parse(mockFetch.mock.calls[1][1].body)).toMatchObject({
            signalType: 'implicit_usage',
            impactScore: 0,
            metadata: { outcome: 'ghosted' },
        });
    });

    it('records a rejection as a weak negative outcome', async () => {
        mockFetch.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 201 }));

        await RdFeedbackService.captureOutcome('user-1', 'job-1', 'rejected');

        expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toMatchObject({
            signalType: 'explicit_correction',
            impactScore: -1,
            metadata: { outcome: 'rejected' },
        });
    });

    it('loads recent signals through the authenticated Neon API', async () => {
        const signals = [{
            signalType: 'explicit_approval',
            context: 'match_logic',
            metadata: { job_id: 'job-1', outcome: 'offer' },
        }];
        mockFetch.mockResolvedValue(new Response(JSON.stringify({ signals }), { status: 200 }));

        await expect(RdFeedbackService.getRecentSignals('user-1', 25)).resolves.toEqual(signals);
        expect(mockFetch).toHaveBeenCalledWith('/api/rd-feedback?limit=25', expect.objectContaining({
            headers: { Authorization: 'Bearer test-token', 'Content-Type': 'application/json' },
        }));
    });
});
