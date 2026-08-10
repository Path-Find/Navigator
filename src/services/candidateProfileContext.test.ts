import { describe, expect, it } from 'vitest';
import { formatCandidateProfileContext, formatVerifiedSkills } from './candidateProfileContext';

describe('candidate profile prompt context', () => {
    it('keeps approved signals and only job-relevant stories', () => {
        const context = formatCandidateProfileContext({
            id: 'resume-1',
            name: 'Primary',
            blocks: [],
            candidateProfile: {
                signals: [{
                    id: 'signal-1',
                    key: 'career_stage',
                    value: 'Current student',
                    source: 'profile_interview',
                    approvedAt: 1,
                }],
                stories: [
                    { id: 'story-1', text: 'Built a planning project using ArcGIS.', tags: ['planning'], source: 'profile_interview', approvedAt: 1 },
                    { id: 'story-2', text: 'Led a retail team.', tags: ['retail'], source: 'general_interview', approvedAt: 1 },
                ],
            },
        }, 'student planning role ArcGIS');

        expect(context).toContain('Current student');
        expect(context).toContain('Built a planning project');
        expect(context).not.toContain('Led a retail team');
    });

    it('keeps only verified skills that match the job context', () => {
        const context = formatVerifiedSkills([
            { id: 'skill-1', user_id: 'user-1', name: 'ArcGIS', proficiency: 'comfortable', evidence: 'Verified in a skill interview', created_at: '', updated_at: '' },
            { id: 'skill-2', user_id: 'user-1', name: 'Baking', proficiency: 'expert', evidence: 'Verified in a skill interview', created_at: '', updated_at: '' },
        ], 'transportation planning ArcGIS');

        expect(context).toContain('ArcGIS');
        expect(context).not.toContain('Baking');
    });
});
