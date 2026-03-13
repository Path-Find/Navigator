import type { SavedJob } from '../modules/job/types';

export interface CareerArchetype {
    id: string;
    name: string;
    description: string;
    category: 'role' | 'seniority' | 'industry' | 'vibe';
    color: string;
}

export class ArchetypeUtils {
    static calculateArchetypes(jobs: SavedJob[]): CareerArchetype[] {
        if (jobs.length === 0) return [];

        const archetypes: CareerArchetype[] = [];

        // 1. Category Analysis
        const categories = jobs.map(j => j.analysis?.distilledJob?.category).filter(Boolean) as string[];
        const categoryCounts = this.countOccurrences(categories);
        const topCategory = this.getTop(categoryCounts);

        if (topCategory && categoryCounts[topCategory] >= Math.max(2, jobs.length * 0.5)) {
            archetypes.push(this.getCategoryArchetype(topCategory));
        }

        // 2. Role Identity (Canonical Title)
        const titles = jobs.map(j => j.analysis?.distilledJob?.canonicalTitle).filter(Boolean) as string[];
        const titleCounts = this.countOccurrences(titles);
        const topTitle = this.getTop(titleCounts);

        if (topTitle && titleCounts[topTitle] >= Math.max(2, jobs.length * 0.4)) {
            archetypes.push({
                id: `role-${topTitle.toLowerCase().replace(/\s+/g, '-')}`,
                name: topTitle,
                description: `You consistently target ${topTitle} roles.`,
                category: 'role',
                color: 'indigo'
            });
        }

        // 3. Seniority Lean
        const rawTitles = jobs.map(j => j.position.toLowerCase());
        const seniority = this.detectSeniority(rawTitles);
        if (seniority) {
            archetypes.push(seniority);
        }

        return archetypes;
    }

    private static countOccurrences(items: string[]): Record<string, number> {
        return items.reduce((acc, item) => {
            acc[item] = (acc[item] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }

    private static getTop(counts: Record<string, number>): string | null {
        let top = null;
        let max = 0;
        for (const [key, val] of Object.entries(counts)) {
            if (val > max) {
                max = val;
                top = key;
            }
        }
        return top;
    }

    private static getCategoryArchetype(category: string): CareerArchetype {
        const map: Record<string, Partial<CareerArchetype>> = {
            technical: { name: 'Technologist', description: 'Your focus is primarily on technical and engineering roles.', color: 'indigo' },
            managerial: { name: 'Leader', description: 'You are targeting management and leadership positions.', color: 'amber' },
            creative: { name: 'Creative', description: 'Your applications lean towards design and creative fields.', color: 'pink' },
            healthcare: { name: 'Care Provider', description: 'You are focused on the healthcare sector.', color: 'emerald' },
            trades: { name: 'Specialist', description: 'You target skilled trades and specialized technical work.', color: 'orange' },
        };
        const template = map[category.toLowerCase()] || { name: 'Professional', description: 'You maintain a consistent professional focus.', color: 'blue' };
        return {
            id: `cat-${category.toLowerCase()}`,
            category: 'industry',
            ...template
        } as CareerArchetype;
    }

    private static detectSeniority(titles: string[]): CareerArchetype | null {
        const seniors = titles.filter(t => t.includes('senior') || t.includes('sr') || t.includes('lead') || t.includes('principal') || t.includes('staff'));
        const juniors = titles.filter(t => t.includes('junior') || t.includes('jr') || t.includes('entry') || t.includes('intern') || t.includes('associate'));

        if (seniors.length >= titles.length * 0.5 && seniors.length >= 2) {
            return {
                id: 'senior-lean',
                name: 'Strategic Lead',
                description: 'Your applications target high-seniority, leadership-focused roles.',
                category: 'seniority',
                color: 'violet'
            };
        }
        if (juniors.length >= titles.length * 0.5 && juniors.length >= 2) {
            return {
                id: 'junior-lean',
                name: 'Rising Professional',
                description: 'You are currently focusing on growth-oriented, entry to mid-level roles.',
                category: 'seniority',
                color: 'emerald'
            };
        }
        return null;
    }
}
