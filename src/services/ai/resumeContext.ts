import type { ExperienceBlock, ResumeProfile } from '../../types';
import { AI_CONTEXT_BUDGETS } from './contextBudgets';

const STOP_WORDS = new Set([
    'about', 'after', 'also', 'before', 'being', 'candidate', 'could', 'from',
    'have', 'into', 'more', 'role', 'their', 'these', 'this', 'those', 'with',
]);

const terms = (value: string): Set<string> => new Set(
    value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/)
        .filter(term => term.length >= 4 && !STOP_WORDS.has(term))
);

const blockText = (block: ExperienceBlock): string => [
    block.type, block.title, block.organization, block.dateRange,
    ...block.bullets, block.narrativeContext || '',
].join(' ');

const scoreBlock = (block: ExperienceBlock, referenceTerms: Set<string>): number => {
    const overlap = [...terms(blockText(block))].filter(term => referenceTerms.has(term)).length;
    const typeWeight = block.type === 'work' ? 2 : block.type === 'project' ? 1 : 0;
    return overlap * 3 + typeWeight;
};

export const selectRelevantResumeBlocks = (
    profile: ResumeProfile,
    reference = '',
    maxBlocks: number = AI_CONTEXT_BUDGETS.resumeBlocks,
): ExperienceBlock[] => {
    const visibleBlocks = profile.blocks.filter(block =>
        block.isVisible !== false && ['work', 'volunteer', 'project', 'education'].includes(block.type)
    );
    const referenceTerms = terms(reference);
    const scoredBlocks = visibleBlocks
        .map((block, index) => ({
            block,
            index,
            score: scoreBlock(block, referenceTerms),
            overlap: [...terms(blockText(block))].filter(term => referenceTerms.has(term)).length,
        }))
        .sort((a, b) => b.score - a.score || a.index - b.index);
    const relevantBlocks = reference.trim()
        ? scoredBlocks.filter(({ overlap }) => overlap > 0)
        : scoredBlocks;
    const selectedBlocks = relevantBlocks.length > 0 ? relevantBlocks : scoredBlocks.slice(0, 1);

    return selectedBlocks
        .slice(0, maxBlocks)
        .map(({ block }) => ({
            ...block,
            bullets: block.bullets.slice(0, AI_CONTEXT_BUDGETS.resumeBullets),
            narrativeContext: block.narrativeContext?.slice(0, AI_CONTEXT_BUDGETS.narrativeCharacters),
        }));
};

export const formatResumeBlocks = (
    profile: ResumeProfile,
    reference = '',
    maxBlocks: number = AI_CONTEXT_BUDGETS.resumeBlocks,
    includeBlockIds = false,
): string => selectRelevantResumeBlocks(profile, reference, maxBlocks)
    .map(block => `${includeBlockIds ? `BLOCK_ID: ${block.id}\n` : ''}TYPE: ${block.type}\nROLE: ${block.title}\nORG: ${block.organization}\n${block.credentialType ? `CREDENTIAL TYPE: ${block.credentialType}\n` : ''}DATE: ${block.dateRange}\nDETAILS:\n${block.bullets.map(bullet => `- ${bullet}`).join('\n')}${block.narrativeContext ? `\nSTORY CONTEXT:\n${block.narrativeContext}` : ''}`)
    .join('\n---\n');

export const serializeResumeBlocks = (
    profile: ResumeProfile,
    reference = '',
    maxBlocks: number = AI_CONTEXT_BUDGETS.resumeBlocks,
): string => JSON.stringify(selectRelevantResumeBlocks(profile, reference, maxBlocks)
    .map(({ type, title, organization, credentialType, dateRange, bullets, narrativeContext }) => ({
        type, title, organization, credentialType, dateRange, bullets,
        ...(narrativeContext ? { narrativeContext } : {}),
    })));

export const serializeResumeProfile = (
    profile: ResumeProfile,
    reference = '',
    maxBlocks: number = AI_CONTEXT_BUDGETS.resumeBlocks,
): string => JSON.stringify({
    name: profile.name,
    blocks: selectRelevantResumeBlocks(profile, reference, maxBlocks)
        .map(({ type, title, organization, credentialType, dateRange, bullets, narrativeContext }) => ({
            type, title, organization, credentialType, dateRange, bullets,
            ...(narrativeContext ? { narrativeContext } : {}),
        })),
});
