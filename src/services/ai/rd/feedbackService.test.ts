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

    it('records positive application outcomes through the Neon API', async () => {
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
