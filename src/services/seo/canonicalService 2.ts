import { SEO_BUCKETS } from './seo-data';
import type { SEOMappingResult, SEORoleBucket } from './types';

export const CanonicalService = {
    /**
     * Maps a raw URL slug or user input to a canonical SEO bucket.
     * Example: "senior-react-developer" -> "software-engineer" bucket
     *          but keeps "Senior React Developer" as the display title.
     */
    getCanonicalRole: (slugOrTitle: string): SEOMappingResult => {
        const raw = slugOrTitle.toLowerCase().replace(/-/g, ' ');
        // cleanTitle was unused, removing it for now.

        // Find best match based on keywords
        let bestMatch: SEORoleBucket | undefined;
        let maxScore = 0;

        for (const bucket of SEO_BUCKETS) {
            if (bucket.id === 'general') continue;

            let score = 0;
            // Exact ID match? (e.g. /resume-for/nurse)
            if (bucket.slug === slugOrTitle) score += 100;

            // Keyword match?
            for (const keyword of bucket.keywords) {
                if (raw.includes(keyword)) score += 10;
            }

            if (score > maxScore) {
                maxScore = score;
                bestMatch = bucket;
            }
        }

        // Fallback to general bucket if no strong match
        const bucket = bestMatch || SEO_BUCKETS.find(b => b.id === 'general')!;

        // Formatter for display (e.g. "senior-react-developer" -> "Senior React Developer")
        const formatTitle = (s: string) => s
            .split('-')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

        return {
            bucket,
            originalQuery: formatTitle(slugOrTitle),
            isExactMatch: !!bestMatch
        };
    }
};
