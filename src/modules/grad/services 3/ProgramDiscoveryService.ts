import { CANADIAN_MA_PROGRAMS } from '../data/canadianPrograms';
import type { Program, DiscoveryMatch } from '../types/discovery';
import type { Transcript } from '../types';
// import { getModel, callWithRetry, cleanJsonOutput } from '../../../services/ai/aiCore';

export class ProgramDiscoveryService {
    /**
     * Basic keyword search across the index
     */
    static searchPrograms(query: string): Program[] {
        const q = query.toLowerCase();
        return CANADIAN_MA_PROGRAMS.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.institution.toLowerCase().includes(q) ||
            p.keywords.some((k: string) => k.toLowerCase().includes(q))
        );
    }

    /**
     * Use AI to explain WHY these programs match a user's transcript and goals
     */
    static async getDiscoveryRecommendations(
        _transcript: Transcript,
        interests: string[]
    ): Promise<DiscoveryMatch[]> {
        // In a real implementation, we would call an AI service here.
        // For now, let's simulate the results based on our seed data.

        const searchTerms = interests.join(' ');
        const programs = this.searchPrograms(searchTerms);

        // Map to DiscoveryMatch with simulated AI reasoning
        return programs.map(p => ({
            ...p,
            fitScore: Math.floor(Math.random() * 40) + 60, // 60-100 range
            matchReason: `Your strong performance in courses related to ${p.keywords[0]} matches well with ${p.institution}'s focus on ${p.keywords[1]}.`
        }));
    }
}
