import type { ResumeProfile, ExperienceBlock } from '../../resume/types';
import type { JobAnalysis, SavedJob } from '../types';

export const getScoreLabel = (score?: number) => {
    if (score === undefined || score === null) return 'Analysis Needed';
    if (score >= 90) return 'Exceptional Match';
    if (score >= 80) return 'Strong Match';
    if (score >= 70) return 'Good Match';
    if (score >= 60) return 'Fair Match';
    return 'Low Match';
};

export const getScoreColorClasses = (score?: number) => {
    const s = score ?? -1;
    if (s >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-emerald-500/5';
    if (s >= 60) return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 shadow-amber-500/5';
    return 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 shadow-rose-500/5';
};

export const getBestResume = (resumes: ResumeProfile[], analysis?: JobAnalysis) => {
    if (!resumes.length) return undefined;
    if (!analysis) return resumes[0];
    return resumes.find(r => r.id === analysis.bestResumeProfileId) || resumes[0];
};

export const copyResumeToClipboard = async (
    job: SavedJob,
    bestResume?: ResumeProfile
) => {
    if (!bestResume) return;
    const analysis = job.analysis;
    const lines: string[] = [];
    lines.push(bestResume.name || '');
    lines.push('');

    if (job.tailoredSummary) {
        lines.push('Summary');
        lines.push(job.tailoredSummary);
        lines.push('');
    }

    lines.push('Experience');
    bestResume.blocks
        .filter((b: ExperienceBlock) => analysis?.recommendedBlockIds ? analysis.recommendedBlockIds.includes(b.id) : b.isVisible)
        .forEach((block: ExperienceBlock) => {
            lines.push(`${block.title} | ${block.organization} | ${block.dateRange}`);
            const bullets = job.tailoredResumes?.[block.id] || block.bullets;
            bullets.forEach((bullet: string) => lines.push(`• ${bullet}`));
            lines.push('');
        });

    await navigator.clipboard.writeText(lines.join('\n'));
};
