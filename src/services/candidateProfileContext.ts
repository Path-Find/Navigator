import type { CandidateProfileContext, CandidateStory, ResumeProfile } from '../modules/resume/types';
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

const storyMatchesJob = (story: CandidateStory, jobContext: string): boolean => {
    if (!jobContext.trim()) return true;
    const jobTerms = new Set(normalize(jobContext));
    return story.tags.some(tag => jobTerms.has(normalize(tag)[0] || ''))
        || normalize(story.text).some(term => jobTerms.has(term));
};

export const getCandidateProfileContext = (profile?: ResumeProfile | null): CandidateProfileContext | null => {
    const context = profile?.candidateProfile;
    if (!context) return null;
    if (context.signals.length === 0 && context.stories.length === 0) return null;
    return context;
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

    const signals = context.signals
        .map(signal => `- ${signal.key}: ${signal.value}`)
        .join('\n');
    const stories = context.stories
        .filter(story => storyMatchesJob(story, jobContext))
        .slice(0, maxStories)
        .map(story => `- ${story.text}${story.tags.length ? ` [tags: ${story.tags.join(', ')}]` : ''}`)
        .join('\n');

    return [
        signals ? `APPROVED CANDIDATE SIGNALS:\n${signals}` : '',
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
