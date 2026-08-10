import React from 'react';
import { ArrowRight, BookOpen, ChevronDown, Sparkles, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../contexts/ToastContext';
import { useUser } from '../../../contexts/UserContext';
import { useResumeContext } from '../../resume/context/ResumeContext';
import { ROUTES } from '../../../constants';
import { createCandidateProfileInsight, deriveCandidateProfileInsights } from '../../../services/candidateProfileContext';
import type { CandidateProfileInsight, CandidateProfileInsightStatus, CandidateProfileInsightSuggestion, CandidateProfileSignal, CandidateStory } from '../../resume/types';

const SIGNAL_LABELS: Record<CandidateProfileSignal['key'], string> = {
    career_stage: 'Career stage',
    career_direction: 'Career direction',
    education_status: 'Education',
    preferred_emphasis: 'What to emphasize',
    boundary: 'Boundary',
};

const SOURCE_LABELS: Record<CandidateStory['source'], string> = {
    resume_interview: 'Resume interview',
    general_interview: 'General interview',
    profile_interview: 'Profile interview',
};

type InsightCardStatus = CandidateProfileInsightStatus | 'pending';

export const CandidateProfileContextManager: React.FC = () => {
    const navigate = useNavigate();
    const { resumes, handleUpdateResume, isLoading } = useResumeContext();
    const { journey, coverLetterPreferences, updateProfile } = useUser();
    const { showSuccess, showError } = useToast();
    const [coverLetterPreferencesInput, setCoverLetterPreferencesInput] = React.useState(coverLetterPreferences || '');
    const primaryResume = resumes[0];
    const signals = primaryResume?.candidateProfile?.signals || [];
    const stories = primaryResume?.candidateProfile?.stories || [];
    const storedInsights = primaryResume?.candidateProfile?.insights || [];
    const inferredInsights = deriveCandidateProfileInsights(primaryResume);
    const insightCards: Array<CandidateProfileInsightSuggestion & { id: string; status: InsightCardStatus }> = [
        ...storedInsights
            .filter(insight => insight.status === 'confirmed')
            .map(insight => ({ id: insight.id, key: insight.key, value: insight.value, reason: insight.reason, source: insight.source, status: insight.status })),
        ...inferredInsights
            .filter(insight => !storedInsights.some(saved => saved.key === insight.key))
            .map(insight => ({ ...insight, id: `pending-${insight.key}`, status: 'pending' as const })),
    ];
    const hasContext = signals.length > 0 || stories.length > 0 || storedInsights.some(insight => insight.status === 'confirmed');

    // The profile loads asynchronously after the Settings screen mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    React.useEffect(() => { setCoverLetterPreferencesInput(coverLetterPreferences || ''); }, [coverLetterPreferences]);

    const handleSaveCoverLetterPreferences = () => {
        const trimmed = coverLetterPreferencesInput.trim();
        if (trimmed !== (coverLetterPreferences || '')) {
            void updateProfile({ cover_letter_preferences: trimmed || null }).catch(() => showError('Failed to save cover-letter preferences.'));
        }
    };

    const handleInsightDecision = async (insight: CandidateProfileInsightSuggestion, status: CandidateProfileInsightStatus) => {
        if (!primaryResume) return;

        const context = primaryResume.candidateProfile;
        const savedInsight: CandidateProfileInsight = createCandidateProfileInsight(
            insight,
            status,
            storedInsights.find(existing => existing.key === insight.key)?.id
        );
        const nextInsights = [...storedInsights.filter(existing => existing.key !== insight.key), savedInsight];

        await handleUpdateResume({
            ...primaryResume,
            candidateProfile: {
                signals: context?.signals || [],
                stories: context?.stories || [],
                insights: nextInsights,
                completedAt: context?.completedAt,
            },
        });
        showSuccess(status === 'confirmed' ? 'Confirmed and added to your reusable profile.' : 'Navigator will stop suggesting this observation.');
    };

    const removeContext = async (type: 'signal' | 'story', id: string) => {
        if (!primaryResume) return;

        const context = primaryResume.candidateProfile;
        const nextSignals = type === 'signal'
            ? signals.filter(signal => signal.id !== id)
            : signals;
        const nextStories = type === 'story'
            ? stories.filter(story => story.id !== id)
            : stories;

        await handleUpdateResume({
            ...primaryResume,
            candidateProfile: nextSignals.length || nextStories.length
                ? {
                    signals: nextSignals,
                    stories: nextStories,
                    completedAt: context?.completedAt,
                }
                : undefined,
        });
        showSuccess('Removed from your reusable profile.');
    };

    return (
        <section className="mt-12 bg-white dark:bg-neutral-900/50 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 p-8 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-violet-500/10 rounded-xl">
                        <Sparkles className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white tracking-tight">Your application profile</h4>
                        <p className="text-xs text-neutral-400 leading-relaxed mt-2 max-w-2xl">
                            Keep your direction here, along with details you approved for Navigator to reuse in interviews and applications when they fit.
                        </p>
                    </div>
                </div>
                <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => navigate(ROUTES.PROFILE_INTERVIEW)}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                    className="shrink-0 !text-indigo-600 dark:!text-indigo-400 !border-indigo-100 dark:!border-indigo-500/20"
                >
                    Build or refresh profile
                </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-indigo-100/70 dark:border-indigo-500/10">
                <div className="pb-6 border-b border-indigo-100/70 dark:border-indigo-500/10">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Cover-letter style</h5>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4 max-w-2xl">
                        Applies to every cover letter. Use this for tone, voice, or length—not facts about a specific job.
                    </p>
                    <textarea
                        value={coverLetterPreferencesInput}
                        onChange={(event) => setCoverLetterPreferencesInput(event.target.value)}
                        onBlur={handleSaveCoverLetterPreferences}
                        maxLength={1000}
                        rows={3}
                        placeholder="e.g. Keep letters concise, confident, and warm. Use Canadian spelling."
                        className="w-full bg-indigo-50/40 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-xl px-3 py-3 text-sm font-medium leading-relaxed text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                    />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Current focus</h5>
                        <p className="text-xs text-neutral-400 leading-relaxed mt-2 max-w-xl">
                            Helps Navigator understand the kind of support you want right now. You can change this whenever your direction changes.
                        </p>
                    </div>
                    <div className="relative group sm:w-56 shrink-0">
                        <select
                            value={journey || ''}
                            onChange={(event) => {
                                void updateProfile({ journey: event.target.value }).catch(() => showError('Failed to save current focus.'));
                            }}
                            className="w-full appearance-none bg-indigo-50/60 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-xl px-4 py-3 text-sm font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer pr-10"
                        >
                            {[
                                { id: 'job-hunter', label: 'Job Search' },
                                { id: 'career-changer', label: 'Career Change' },
                                { id: 'exploring', label: 'Just Exploring' },
                            ].map((option) => (
                                <option key={option.id} value={option.id}>{option.label}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {insightCards.length > 0 && (
                <div className="mt-8 pt-6 border-t border-violet-100/70 dark:border-violet-500/10">
                    <div className="mb-3">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Navigator’s observations</h5>
                        <p className="text-xs text-neutral-400 leading-relaxed mt-2 max-w-2xl">
                            These are cautious patterns noticed in your resume—not facts. Confirm only what feels accurate; confirmed observations may be used when relevant.
                        </p>
                    </div>
                    <div className="space-y-3">
                        {insightCards.map(insight => (
                            <div key={insight.id} className="rounded-2xl bg-violet-50/70 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 px-4 py-4">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-wide text-violet-500 dark:text-violet-300">
                                                {insight.status === 'confirmed' ? 'Confirmed' : 'Suggested'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{insight.value}</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">Why: {insight.reason}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {insight.status === 'confirmed' ? (
                                            <Button
                                                variant="ghost"
                                                size="xs"
                                                onClick={() => { void handleInsightDecision(insight, 'dismissed'); }}
                                                className="!text-neutral-500 hover:!text-rose-500"
                                            >
                                                Stop using
                                            </Button>
                                        ) : (
                                            <>
                                                <Button
                                                    variant="subtle"
                                                    size="xs"
                                                    onClick={() => { void handleInsightDecision(insight, 'confirmed'); }}
                                                    className="!text-violet-600 dark:!text-violet-300 !border-violet-200 dark:!border-violet-500/20"
                                                >
                                                    Confirm
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    onClick={() => { void handleInsightDecision(insight, 'dismissed'); }}
                                                    className="!text-neutral-500 hover:!text-rose-500"
                                                >
                                                    Not me
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isLoading ? (
                <p className="text-sm text-neutral-400 mt-8">Loading your saved context…</p>
            ) : !hasContext ? (
                <div className="mt-8 rounded-2xl bg-violet-50/70 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 px-5 py-4">
                    <div className="flex items-start gap-3">
                        <BookOpen className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">
                            Nothing saved yet. Build your profile once and Navigator can use the useful pieces only when an application calls for them.
                        </p>
                    </div>
                </div>
            ) : !signals.length && !stories.length ? null : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {signals.length > 0 && (
                        <div>
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">Signals</h5>
                            <div className="space-y-3">
                                {signals.map(signal => (
                                    <div key={signal.id} className="flex items-start gap-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-4 py-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] font-black uppercase tracking-wide text-indigo-500 dark:text-indigo-300">{SIGNAL_LABELS[signal.key]}</p>
                                            <p className="text-sm text-neutral-700 dark:text-neutral-200 mt-1">{signal.value}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { void removeContext('signal', signal.id); }}
                                            aria-label={`Remove ${SIGNAL_LABELS[signal.key]} signal`}
                                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-white/70 dark:hover:bg-neutral-900/50 transition-colors shrink-0"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {stories.length > 0 && (
                        <div>
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">Stories</h5>
                            <div className="space-y-3">
                                {stories.map(story => (
                                    <div key={story.id} className="flex items-start gap-3 rounded-2xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-4 py-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-neutral-700 dark:text-neutral-200">{story.text}</p>
                                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-300">{SOURCE_LABELS[story.source]}</span>
                                                {story.tags.map(tag => <span key={tag} className="text-[10px] text-neutral-400">· {tag}</span>)}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { void removeContext('story', story.id); }}
                                            aria-label="Remove saved story"
                                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-white/70 dark:hover:bg-neutral-900/50 transition-colors shrink-0"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};
