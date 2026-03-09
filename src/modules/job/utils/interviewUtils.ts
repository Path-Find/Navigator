import type { ResumeProfile } from '../../resume/types';

export const computeSnippets = (resumes: ResumeProfile[]) => {
    if (!resumes || resumes.length === 0) return [];
    const primaryResume = resumes[0];
    const experienceBlocks = primaryResume.blocks?.filter(b => b.isVisible && (b.type === 'work' || b.type === 'volunteer' || b.type === 'project')) || [];
    return [...experienceBlocks]
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map(b => ({
            text: b.organization || b.title,
            source: b.title !== b.organization ? b.title : b.dateRange
        }));
};

export const handleBankSuggestion = async (
    suggestion: { type: string; suggestion: string; impact: string },
    resumes: ResumeProfile[],
    handleUpdateResume: (resume: ResumeProfile) => Promise<void>
) => {
    if (resumes.length === 0) return;

    // Apply to the first (primary) resume for now
    const primaryResume = resumes[0];
    const newSuggestion = {
        id: crypto.randomUUID(),
        type: suggestion.type as 'add' | 'update' | 'remove',
        suggestion: suggestion.suggestion,
        impact: suggestion.impact,
        source: 'Interview Advisor',
        dateAdded: Date.now()
    };

    const updatedResume = {
        ...primaryResume,
        suggestedUpdates: [
            ...(primaryResume.suggestedUpdates || []),
            newSuggestion
        ]
    };

    await handleUpdateResume(updatedResume);
};
