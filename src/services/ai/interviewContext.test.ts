import { describe, expect, it } from 'vitest';
import { formatInterviewBlocks, selectInterviewBlocks } from './interviewContext';
import type { ResumeProfile } from '../../types';

const profile = {
    blocks: [
        {
            id: 'planning', type: 'work', isVisible: true, title: 'Planning Assistant', organization: 'City Hall', dateRange: '2024-present',
            bullets: ['Supported zoning research and development applications.'],
        },
        {
            id: 'claims', type: 'work', isVisible: true, title: 'Claims Examiner', organization: 'Canada Life', dateRange: '2021-2024',
            bullets: ['Adjudicated claims and reviewed policy documentation.'],
        },
        {
            id: 'education', type: 'education', isVisible: true, title: 'Environmental Studies', organization: 'York University', dateRange: '2021-present',
            bullets: ['Studied urban planning and spatial analysis.'],
        },
    ],
} as unknown as ResumeProfile;

describe('interview context selection', () => {
    it('selects blocks that overlap with the current job context', () => {
        const selected = selectInterviewBlocks(profile, 'claims policy adjudication', 1);
        expect(selected).toHaveLength(1);
        expect(selected[0].title).toBe('Claims Examiner');
    });

    it('limits prompt growth by trimming block detail', () => {
        const longProfile = {
            blocks: [{
                ...profile.blocks[0],
                bullets: Array.from({ length: 8 }, (_, index) => `Bullet ${index}`),
                narrativeContext: 'x'.repeat(2000),
            }],
        } as unknown as ResumeProfile;
        const formatted = formatInterviewBlocks(longProfile);
        expect(formatted.match(/^- /gm)).toHaveLength(5);
        expect(formatted.length).toBeLessThan(1500);
    });
});
