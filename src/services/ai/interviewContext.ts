import type { ExperienceBlock, ResumeProfile } from '../../types';

const STOP_WORDS = new Set([
    'about', 'after', 'also', 'before', 'being', 'candidate', 'could', 'from',
    'have', 'into', 'more', 'role', 'their', 'these', 'this', 'those', 'with',
]);

const terms = (value: string): Set<string> => new Set(
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .split(/\s+/)
        .filter(term => term.length >= 4 && !STOP_WORDS.has(term))
);

const blockText = (block: ExperienceBlock): string => [
    block.type,
    block.title,
    block.organization,
    block.dateRange,
    ...block.bullets,
    block.narrativeContext || '',
].join(' ');

const scoreBlock = (block: ExperienceBlock, referenceTerms: Set<string>): number => {
    const blockTerms = terms(blockText(block));
    const overlap = [...blockTerms].filter(term => referenceTerms.has(term)).length;
    const typeWeight = block.type === 'work' ? 2 : block.type === 'project' ? 1 : 0;
    return overlap * 3 + typeWeight;
};

/** Select only the resume evidence needed for a particular interview task. */
export const selectInterviewBlocks = (
    profile: ResumeProfile,
    reference = '',
    maxBlocks = 6,
): ExperienceBlock[] => {
    const visibleBlocks = profile.blocks.filter(block =>
        block.isVisible !== false && ['work', 'volunteer', 'project', 'education'].includes(block.type)
    );
    const referenceTerms = terms(reference);
    return visibleBlocks
        .map((block, index) => ({ block, index, score: scoreBlock(block, referenceTerms) }))
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .slice(0, maxBlocks)
        .map(({ block }) => ({
            ...block,
            // Keep the strongest evidence while limiting prompt growth.
            bullets: block.bullets.slice(0, 5),
            narrativeContext: block.narrativeContext?.slice(0, 1200),
        }));
};

export const formatInterviewBlocks = (profile: ResumeProfile, reference = ''): string =>
    selectInterviewBlocks(profile, reference)
        .map(block => `${block.title} at ${block.organization} (${block.dateRange}):\n${block.bullets.map(bullet => `- ${bullet}`).join('\n')}${block.narrativeContext ? `\nStory context: ${block.narrativeContext}` : ''}`)
        .join('\n\n');
