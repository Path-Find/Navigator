import { Card } from '../../../components/ui/Card';

import { getCritiqueLabel, getCritiqueColorClasses } from '../utils/jobUtils';
import { toSentenceCase } from '../../../utils/stringUtils';
import type { SavedJob, CoverLetterCritique } from '../types';

interface CoverLetterSidebarProps {
    job: SavedJob;
}

export const CoverLetterSidebar: React.FC<CoverLetterSidebarProps> = ({ job }) => {
    const critique = job.coverLetterCritique && typeof job.coverLetterCritique === 'object' ? job.coverLetterCritique as CoverLetterCritique : null;
    const isStrong = critique?.decision === 'Exceptional' || critique?.decision === 'Strong';
    const hasPlaceholders = !!job.coverLetter && /\[[^\]]{10,}\]/.test(job.coverLetter);
    const tailoringFocus = job.analysis?.coverLetterTailoringInstructions || job.analysis?.tailoringInstructions || [];

    return (
        <Card variant="premium" className="p-8 border-indigo-500/10 shadow-indigo-500/10">
            <div className="mb-6">
                <h4 className="text-xs font-bold text-indigo-500 dark:text-indigo-400">Tailoring Strategy</h4>
            </div>

            {critique?.feedback && critique.feedback.length > 0 && (
                <div className="mb-8 space-y-4">
                    {critique.feedback.slice(0, 3).map((f: string, idx: number) => (
                        <div key={idx} className="flex gap-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/50 mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{toSentenceCase(f)}</span>
                        </div>
                    ))}
                </div>
            )}

            {tailoringFocus.length > 0 && (!critique?.feedback || critique.feedback.length === 0) && (
                <div className="mb-8 space-y-4">
                    {tailoringFocus.slice(0, 3).map((item: string, idx: number) => (
                        <div key={idx} className="flex gap-3 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/50 mt-1.5 shrink-0" />
                            <span className="leading-relaxed">{toSentenceCase(item)}</span>
                        </div>
                    ))}
                </div>
            )}

            {critique?.decision && (
                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800/50 mb-8">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-neutral-400 tracking-tight">Draft Strength</span>
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border ${getCritiqueColorClasses(critique.decision)}`}>
                            <div className={`w-1 h-1 rounded-full ${isStrong ? 'bg-emerald-500' : critique.decision === 'Average' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                            {getCritiqueLabel(critique.decision)}
                        </div>
                    </div>
                    <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                        {isStrong 
                            ? "This draft effectively aligns your experience with the core requirements of this role."
                            : "A solid start. Address the feedback below to make this application more impactful."
                        }
                    </p>
                </div>
            )}

            {hasPlaceholders && (
                <div className="flex flex-col gap-2 p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-500/10 mb-8">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-amber-600/70 dark:text-amber-400/50 tracking-tight">Review Required</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border border-amber-200 dark:border-amber-500/20 bg-amber-100/50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                            <div className="w-1 h-1 rounded-full bg-amber-500" />
                            Action Needed
                        </div>
                    </div>
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">
                        This draft contains <span className="text-amber-600 dark:text-amber-400 font-black">placeholders</span>. Please update all <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100/50 dark:bg-white/5 font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold">[bracketed text]</span> before finalizing.
                    </div>
                </div>
            )}

            {!critique?.decision && !hasPlaceholders && tailoringFocus.length === 0 && (
                <div className="text-xs text-neutral-500 italic py-4 text-center">
                    {job.coverLetter ? 'Click Review to get feedback on this draft.' : 'Generate a draft to enable review.'}
                </div>
            )}
        </Card>
    );
};
