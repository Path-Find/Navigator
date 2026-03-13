import type { ResumeProfile } from '../../resume/types';

type BankSuggestionType = 'add' | 'update' | 'remove';

export const computeSnippets = (resumes: ResumeProfile[]) => {
    if (!resumes || resumes.length === 0) return [];

    const primaryResume = resumes[0];
    const experienceBlocks =
        primaryResume.blocks?.filter(
            (b) => b.isVisible && (b.type === 'work' || b.type === 'volunteer' || b.type === 'project')
        ) || [];

    if (experienceBlocks.length === 0) return [];

    const indices = new Set<number>();
    while (indices.size < Math.min(2, experienceBlocks.length)) {
        indices.add(Math.floor(Math.random() * experienceBlocks.length));
    }

    return Array.from(indices).map((index) => {
        const block = experienceBlocks[index];
        return {
            text: block.organization || block.title,
            source: block.title !== block.organization ? block.title : block.dateRange
        };
    });
};

export const handleBankSuggestion = async (
    suggestion: { type: BankSuggestionType; suggestion: string; impact: string },
    resumes: ResumeProfile[],
    handleUpdateResume: (resume: ResumeProfile) => Promise<void>
) => {
    if (resumes.length === 0) return;

    const primaryResume = resumes[0];
    const newSuggestion = {
        id: crypto.randomUUID(),
        type: suggestion.type,
        suggestion: suggestion.suggestion,
        impact: suggestion.impact,
        source: 'Interview Advisor',
        dateAdded: Date.now()
    };

    const updatedResume: ResumeProfile = {
        ...primaryResume,
        suggestedUpdates: [
            ...(primaryResume.suggestedUpdates || []),
            newSuggestion
        ]
    };

    await handleUpdateResume(updatedResume);
};
