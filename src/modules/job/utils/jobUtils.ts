import type { ResumeProfile, ExperienceBlock } from '../../resume/types';
import type { JobAnalysis, SavedJob } from '../types';

export const SCORE_THRESHOLDS = {
    EXCEPTIONAL: 90,
    STRONG: 80,
    GOOD: 70,
    FAIR: 60,
} as const;

export const getScoreLabel = (score?: number | null): string => {
    if (score === undefined || score === null) return 'Not Analyzed';
    if (score >= SCORE_THRESHOLDS.EXCEPTIONAL) return 'Exceptional';
    if (score >= SCORE_THRESHOLDS.STRONG) return 'Strong';
    if (score >= SCORE_THRESHOLDS.GOOD) return 'Good';
    if (score >= SCORE_THRESHOLDS.FAIR) return 'Fair';
    return 'Low';
};

export const getScoreColorClasses = (score?: number | null): string => {
    const s = score ?? -1;
    if (s >= SCORE_THRESHOLDS.STRONG) {
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-emerald-500/5';
    }
    if (s >= SCORE_THRESHOLDS.FAIR) {
        return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 shadow-amber-500/5';
    }
    return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 shadow-rose-500/5';
};

export const getDeadlineInfo = (deadline: string | null | undefined) => {
    if (!deadline) return null;
    const date = new Date(deadline);
    if (isNaN(date.getTime())) return null;
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const formatted = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    if (daysUntil < 0) return { label: 'Closed', formatted, style: 'text-rose-500 dark:text-rose-400' };
    if (daysUntil <= 7) return { label: `Closes in ${daysUntil}d`, formatted, style: 'text-amber-500 dark:text-amber-400' };
    return { label: formatted, formatted, style: 'text-neutral-500 dark:text-neutral-400' };
};

export const getBestResume = (resumes: ResumeProfile[], analysis?: JobAnalysis) => {
    if (!resumes.length) return undefined;
    if (!analysis) return resumes[0];
    return resumes.find(r => r.id === analysis.bestResumeProfileId) || resumes[0];
};

const buildResumeClipboardText = (job: SavedJob, bestResume: ResumeProfile): string => {
    const analysis = job.analysis;
    const lines: string[] = [];

    lines.push(bestResume.name || '');
    lines.push('');

    if (job.tailoredSummary) {
        lines.push('Summary');
        lines.push(job.tailoredSummary);
        lines.push('');
    }

    const visibleBlocks = bestResume.blocks?.filter((b: ExperienceBlock) =>
        analysis?.recommendedBlockIds
            ? analysis.recommendedBlockIds.includes(b.id)
            : b.isVisible
    ) || [];

    const experienceBlocks = visibleBlocks.filter((b: ExperienceBlock) => b.type !== 'education');
    const educationBlocks = visibleBlocks.filter((b: ExperienceBlock) => b.type === 'education');

    const appendBlock = (block: ExperienceBlock) => {
        lines.push(`${block.title} | ${block.organization} | ${block.dateRange}`);
        const bullets = job.tailoredResumes?.[block.id] || block.bullets || [];
        bullets.forEach((bullet: string) => lines.push(`• ${bullet}`));
        lines.push('');
    };

    if (experienceBlocks.length > 0) {
        lines.push('Experience');
        experienceBlocks.forEach(appendBlock);
    }

    if (educationBlocks.length > 0) {
        lines.push('Education');
        educationBlocks.forEach(appendBlock);
    }

    return lines.join('\n');
};

export const copyResumeToClipboard = async (
    job: SavedJob,
    bestResume?: ResumeProfile
): Promise<boolean> => {
    if (!bestResume) return false;

    const text = buildResumeClipboardText(job, bestResume);

    if (!text.trim()) return false;

    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (err) {
        console.error('Failed to copy resume to clipboard:', err);
    }

    return false;
};
export const getCritiqueLabel = (decision?: string | null): string => {
    switch (decision) {
        case 'Exceptional': return 'Exceptional';
        case 'Strong': return 'Strong';
        case 'Average': return 'Good';
        case 'Weak': return 'Needs Work';
        case 'Reject': return 'Incomplete';
        default: return decision || 'Not Analyzed';
    }
};

export const getCritiqueColorClasses = (decision?: string | null): string => {
    switch (decision) {
        case 'Exceptional':
        case 'Strong':
            return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
        case 'Average':
            return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        case 'Weak':
        case 'Reject':
            return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        default:
            return 'bg-neutral-500/10 text-neutral-600 border-neutral-500/20';
    }
};
