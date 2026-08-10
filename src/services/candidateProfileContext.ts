import type { CandidateProfileContext, CandidateProfileInsight, CandidateProfileInsightSuggestion, CandidateStory, ResumeProfile } from '../modules/resume/types';
import type { CustomSkill } from '../modules/skills/types';

const STOP_WORDS = new Set([
    'about', 'after', 'also', 'before', 'between', 'candidate', 'experience',
    'from', 'have', 'into', 'more', 'role', 'that', 'their', 'this', 'with',
]);

const normalize = (value: string): string[] => value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter(term => term.length >= 4 && !STOP_WORDS.has(term));

const hashContext = (value: string): string => {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
};

export const getCandidateProfileSourceVersion = (profile?: ResumeProfile | null): string => {
    if (!profile) return 'none';
    const source = JSON.stringify(profile.blocks
        .filter(block => block.isVisible !== false)
        .map(({ id, type, title, organization, dateRange, bullets, narrativeContext }) => ({
            id,
            type,
            title,
            organization,
            dateRange,
            bullets,
            narrativeContext,
        })));
    return `${profile.importRevision || 0}:${hashContext(source)}`;
};

const storyMatchesJob = (story: CandidateStory, jobContext: string): boolean => {
    if (!jobContext.trim()) return true;
    const jobTerms = new Set(normalize(jobContext));
    return story.tags.some(tag => jobTerms.has(normalize(tag)[0] || ''))
        || normalize(story.text).some(term => jobTerms.has(term));
};

export const getCandidateProfileContext = (profile?: ResumeProfile | null): CandidateProfileContext | null => {
    const context = profile?.candidateProfile;
    if (!context) return null;
    if (context.signals.length === 0 && context.stories.length === 0 && !(context.insights || []).some(insight => insight.status === 'confirmed')) return null;
    return context;
};

/**
 * Finds cautious, reusable observations from visible resume structure. These
 * are suggestions for the user to review, not facts for an AI prompt.
 */
export const deriveCandidateProfileInsights = (profile?: ResumeProfile | null): CandidateProfileInsightSuggestion[] => {
    if (!profile) return [];

    const sourceVersion = getCandidateProfileSourceVersion(profile);
    const visibleBlocks = profile.blocks.filter(block => block.isVisible !== false);
    const hasWorkExperience = visibleBlocks.some(block => block.type === 'work');
    const hasAcademicEvidence = visibleBlocks.some(block => block.type === 'education' || block.type === 'project');
    const hasCurrentEducation = visibleBlocks.some(block => {
        if (block.type !== 'education') return false;
        const educationText = [block.dateRange, block.title, ...block.bullets].filter(Boolean).join(' ');
        const currentYear = new Date().getFullYear();
        return /present|current|ongoing|in progress|expected/i.test(educationText)
            || new RegExp(`\\b${currentYear}(?:[-–]\\d{4})?\\b`).test(educationText);
    });

    const insights: CandidateProfileInsightSuggestion[] = [];
    if (!hasWorkExperience && hasAcademicEvidence) {
        insights.push({
            key: 'possible_first_role',
            value: 'You may be early in your career or preparing for your first professional role.',
            reason: 'Your visible resume includes education or project evidence but no work-experience block.',
            source: 'resume',
            sourceVersion,
        });
    }
    if (hasCurrentEducation) {
        insights.push({
            key: 'current_education',
            value: 'You may currently be studying or completing an education program.',
            reason: 'Your resume includes education dates that appear current or ongoing.',
            source: 'resume',
            sourceVersion,
        });
    }
    return insights;
};

/**
 * Formats only approved, reusable candidate context for an AI call. Stories are
 * filtered against the job signal so a strong answer from another context does
 * not become unnecessary prompt weight.
 */
export const formatCandidateProfileContext = (
    profile?: ResumeProfile | null,
    jobContext = '',
    maxStories = 3
): string => {
    const context = getCandidateProfileContext(profile);
    if (!context) return '';
    const sourceVersion = getCandidateProfileSourceVersion(profile);

    const signals = context.signals
        .map(signal => `- ${signal.key}: ${signal.value}`)
        .join('\n');
    const confirmedInsights = (context.insights || [])
        .filter((insight: CandidateProfileInsight) => insight.status === 'confirmed' && insight.sourceVersion === sourceVersion)
        .map(insight => `- ${insight.key}: ${insight.value}`)
        .join('\n');
    const stories = context.stories
        .filter(story => storyMatchesJob(story, jobContext))
        .slice(0, maxStories)
        .map(story => `- ${story.text}${story.tags.length ? ` [tags: ${story.tags.join(', ')}]` : ''}`)
        .join('\n');

    return [
        signals ? `APPROVED CANDIDATE SIGNALS:\n${signals}` : '',
        confirmedInsights ? `CONFIRMED CANDIDATE INSIGHTS:\n${confirmedInsights}` : '',
        stories ? `APPROVED CANDIDATE STORIES:\n${stories}` : '',
    ].filter(Boolean).join('\n\n');
};

export const formatVerifiedSkills = (skills: CustomSkill[], jobContext = ''): string => {
    const jobTerms = new Set(normalize(jobContext));
    const relevantSkills = skills
        .filter(skill => {
            const skillTerms = normalize(`${skill.name} ${skill.evidence || ''}`);
            return !jobContext.trim() || skillTerms.some(term => jobTerms.has(term));
        })
        .slice(0, 8);

    if (relevantSkills.length === 0) return '';
    return [
        'VERIFIED SKILLS:',
        ...relevantSkills.map(skill => `- ${skill.name} (${skill.proficiency})${skill.evidence ? `: ${skill.evidence}` : ''}`),
    ].join('\n');
};

export const formatJourneyContext = (journey?: string | null): string => {
    const labels: Record<string, string> = {
        student: 'The user has identified as a student; use academic and project evidence when relevant.',
        'career-changer': 'The user has identified as changing careers; explain transferable evidence and avoid pretending the transition is already complete.',
        employed: 'The user has identified as employed and exploring growth; emphasize progression and scope when supported.',
        exploring: 'The user is exploring career options; avoid overcommitting to one career path.',
        'job-hunter': 'The user is actively job searching; keep the application focused and practical.',
    };
    return journey && labels[journey] ? `USER JOURNEY SIGNAL:\n- ${labels[journey]}` : '';
};

export const createCandidateStory = (
    text: string,
    source: CandidateStory['source'],
    tags: string[],
    question?: string
): CandidateStory => ({
    id: crypto.randomUUID(),
    text: text.trim(),
    tags: [...new Set(tags.map(tag => tag.trim().toLowerCase()).filter(Boolean))],
    source,
    ...(question ? { question } : {}),
    approvedAt: Date.now(),
});

export const createCandidateProfileInsight = (
    suggestion: CandidateProfileInsightSuggestion,
    status: CandidateProfileInsight['status'],
    existingId?: string,
    sourceVersion = suggestion.sourceVersion
): CandidateProfileInsight => ({
    ...suggestion,
    id: existingId || crypto.randomUUID(),
    status,
    updatedAt: Date.now(),
    sourceVersion,
});
