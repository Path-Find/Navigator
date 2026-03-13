import { describe, it, expect } from 'vitest';
import { ArchetypeUtils } from './archetypeUtils';
import type { SavedJob } from '../modules/job/types';

describe('ArchetypeUtils', () => {
    const mockJobs: Partial<SavedJob>[] = [
        {
            position: 'Senior Software Engineer',
            analysis: {
                distilledJob: {
                    category: 'technical',
                    canonicalTitle: 'Software Engineer'
                }
            } as any
        },
        {
            position: 'Sr. Backend Dev',
            analysis: {
                distilledJob: {
                    category: 'technical',
                    canonicalTitle: 'Software Engineer'
                }
            } as any
        },
        {
            position: 'Lead Researcher',
            analysis: {
                distilledJob: {
                    category: 'technical',
                    canonicalTitle: 'Data Scientist'
                }
            } as any
        }
    ];

    it('should calculate technical archetype for tech-heavy history', () => {
        const archetypes = ArchetypeUtils.calculateArchetypes(mockJobs as SavedJob[]);
        expect(archetypes.some(a => a.name === 'Technologist')).toBe(true);
    });

    it('should calculate specific role archetype for consistent titles', () => {
        const archetypes = ArchetypeUtils.calculateArchetypes(mockJobs as SavedJob[]);
        expect(archetypes.some(a => a.name === 'Software Engineer')).toBe(true);
    });

    it('should detect seniority lean', () => {
        const archetypes = ArchetypeUtils.calculateArchetypes(mockJobs as SavedJob[]);
        expect(archetypes.some(a => a.name === 'Strategic Lead')).toBe(true);
    });

    it('should return empty for no jobs', () => {
        const archetypes = ArchetypeUtils.calculateArchetypes([]);
        expect(archetypes).toEqual([]);
    });

    it('should detect rising professional for junior roles', () => {
        const juniorJobs: Partial<SavedJob>[] = [
            { position: 'Junior Developer' },
            { position: 'Jr. Analyst' }
        ];
        const archetypes = ArchetypeUtils.calculateArchetypes(juniorJobs as SavedJob[]);
        expect(archetypes.some(a => a.name === 'Rising Professional')).toBe(true);
    });
});
