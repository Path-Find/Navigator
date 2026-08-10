import React from 'react';
import { ArrowRight, BookOpen, ChevronDown, GraduationCap, Sparkles, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../contexts/ToastContext';
import { useUser } from '../../../contexts/UserContext';
import { useResumeContext } from '../../resume/context/ResumeContext';
import { ROUTES } from '../../../constants';
import { Storage } from '../../../services/storageService';
import { createCandidateEducationContext, createCandidateProfileFact, createCandidateProfileInsight, deriveCandidateProfileInsights, getCandidateProfileSourceVersion } from '../../../services/candidateProfileContext';
import type { CandidateProfileFact, CandidateProfileInsight, CandidateProfileInsightStatus, CandidateProfileInsightSuggestion, CandidateProfileSignal, CandidateStory } from '../../resume/types';
import type { Transcript } from '../../grad/types';

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

const FACT_SOURCE_LABELS: Record<CandidateProfileFact['source'], string> = {
    linkedin: 'LinkedIn',
    game_plan: 'Game plan',
    york_class_list: 'York class list',
    resume: 'Resume',
    profile_interview: 'Profile interview',
    user_setting: 'Your settings',
};

type InsightCardStatus = CandidateProfileInsightStatus | 'pending' | 'needs_review';
type InsightCard = CandidateProfileInsightSuggestion & { id: string; status: InsightCardStatus };

export const CandidateProfileContextManager: React.FC = () => {
    const navigate = useNavigate();
    const { resumes, handleUpdateResume, isLoading } = useResumeContext();
    const { journey, coverLetterPreferences, updateProfile } = useUser();
    const { showSuccess, showError } = useToast();
    const [coverLetterPreferencesInput, setCoverLetterPreferencesInput] = React.useState(coverLetterPreferences || '');
    const [transcript, setTranscript] = React.useState<Transcript | null>(null);
    const [factInput, setFactInput] = React.useState('');
    const [factTagsInput, setFactTagsInput] = React.useState('');
    const [factCategory, setFactCategory] = React.useState<CandidateProfileFact['category']>('direction');
    const [factSource, setFactSource] = React.useState<CandidateProfileFact['source']>('linkedin');
    const primaryResume = resumes[0];
    const signals = primaryResume?.candidateProfile?.signals || [];
    const stories = primaryResume?.candidateProfile?.stories || [];
    const storedFacts = primaryResume?.candidateProfile?.facts || [];
    const facts = storedFacts.filter(fact => fact.status === 'confirmed');
    // A newly uploaded transcript is the freshest compact education source.
    // Fall back to saved profile education when no transcript is available.
    const educationContext = transcript
        ? createCandidateEducationContext(transcript)
        : primaryResume?.candidateProfile?.education;
    const storedInsights = primaryResume?.candidateProfile?.insights || [];
    const inferredInsights = deriveCandidateProfileInsights(primaryResume);
    const sourceVersion = getCandidateProfileSourceVersion(primaryResume);
    const insightCards: InsightCard[] = [
        ...inferredInsights
            .flatMap((insight): InsightCard[] => {
                const saved = storedInsights.find(existing => existing.key === insight.key);
                if (saved?.status === 'dismissed' && saved.sourceVersion === sourceVersion) return [];
                if (saved?.status === 'confirmed' && saved.sourceVersion === sourceVersion) {
                    return [{ ...saved, status: 'confirmed' as const }];
                }
                return [{ ...insight, id: saved?.id || `pending-${insight.key}`, status: saved ? 'needs_review' as const : 'pending' as const }];
            }),
        ...storedInsights
            .filter(insight => insight.status === 'confirmed' && insight.sourceVersion !== sourceVersion)
            .filter(insight => !inferredInsights.some(current => current.key === insight.key))
            .map(insight => ({ ...insight, status: 'needs_review' as const })),
    ];
    const hasContext = signals.length > 0
        || stories.length > 0
        || facts.length > 0
        || Boolean(educationContext?.courses.length)
        || storedInsights.some(insight => insight.status === 'confirmed');

    // The profile loads asynchronously after the Settings screen mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    React.useEffect(() => { setCoverLetterPreferencesInput(coverLetterPreferences || ''); }, [coverLetterPreferences]);

    React.useEffect(() => {
        let mounted = true;
        void Storage.getTranscript().then(savedTranscript => {
            if (mounted) setTranscript(savedTranscript);
        });
        return () => { mounted = false; };
    }, []);

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
            storedInsights.find(existing => existing.key === insight.key)?.id,
            sourceVersion
        );
        const nextInsights = [...storedInsights.filter(existing => existing.key !== insight.key), savedInsight];

        await handleUpdateResume({
            ...primaryResume,
            candidateProfile: {
                signals: context?.signals || [],
                stories: context?.stories || [],
                facts: context?.facts || [],
                education: context?.education,
                insights: nextInsights,
                completedAt: context?.completedAt,
            },
        });
        showSuccess(status === 'confirmed' ? 'Confirmed and added to your reusable profile.' : 'Navigator will stop suggesting this observation.');
    };

    const handleAddFact = async () => {
        if (!primaryResume || !factInput.trim()) return;

        const context = primaryResume.candidateProfile;
        const fact = createCandidateProfileFact(
            factInput,
            factCategory,
            factTagsInput.split(','),
            factSource,
            FACT_SOURCE_LABELS[factSource],
            `${factSource}:${new Date().toISOString().slice(0, 10)}`,
        );
        await handleUpdateResume({
            ...primaryResume,
            candidateProfile: {
                signals: context?.signals || [],
                stories: context?.stories || [],
                facts: [...(context?.facts || []), fact],
                education: context?.education,
                insights: context?.insights || [],
                completedAt: context?.completedAt,
            },
        });
        setFactInput('');
        setFactTagsInput('');
        showSuccess('Added to your confirmed profile facts.');
    };

    const handleClearSavedInsights = async () => {
        if (!primaryResume || storedInsights.length === 0) return;

        const context = primaryResume.candidateProfile;
        await handleUpdateResume({
            ...primaryResume,
            candidateProfile: signals.length || stories.length
                || storedFacts.length
                || educationContext
                ? {
                    signals,
                    stories,
                    facts: storedFacts,
                    education: context?.education,
                    completedAt: context?.completedAt,
                }
                : undefined,
        });
        showSuccess('Saved observation choices cleared.');
    };

    const removeContext = async (type: 'signal' | 'story' | 'fact', id: string) => {
        if (!primaryResume) return;

        const context = primaryResume.candidateProfile;
        const nextSignals = type === 'signal'
            ? signals.filter(signal => signal.id !== id)
            : signals;
        const nextStories = type === 'story'
            ? stories.filter(story => story.id !== id)
            : stories;
        const nextFacts = type === 'fact'
            ? storedFacts.filter(fact => fact.id !== id)
            : storedFacts;

        await handleUpdateResume({
            ...primaryResume,
            candidateProfile: nextSignals.length || nextStories.length || nextFacts.length || educationContext
                ? {
                    signals: nextSignals,
                    stories: nextStories,
                    facts: nextFacts,
                    education: context?.education,
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

            {educationContext?.courses.length ? (
                <div className="mt-8 pt-6 border-t border-indigo-100/70 dark:border-indigo-500/10">
                    <div className="flex items-start gap-3 mb-4">
                        <GraduationCap className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <div>
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Education context</h5>
                            <p className="text-xs text-neutral-400 leading-relaxed mt-2 max-w-2xl">
                                Course status is kept explicit: a recorded grade means completed, a blank grade means upcoming, and a withdrawal is not used as completed evidence.
                            </p>
                            <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100 mt-3">
                                {educationContext.program || 'Education program'}{educationContext.university ? ` · ${educationContext.university}` : ''}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(['completed', 'upcoming'] as const).map(status => {
                            const courses = educationContext.courses.filter(course => course.status === status);
                            if (courses.length === 0) return null;
                            return (
                                <div key={status} className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-4 py-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-300">
                                        {status === 'completed' ? 'Completed courses' : 'Upcoming courses'}
                                    </p>
                                    <div className="space-y-2 mt-3">
                                        {courses.map(course => (
                                            <div key={course.id} className="flex items-start justify-between gap-3 text-xs text-neutral-700 dark:text-neutral-200">
                                                <span><strong>{course.code}</strong> · {course.title}</span>
                                                {status === 'completed' && course.grade ? <span className="font-bold text-emerald-600 dark:text-emerald-300 shrink-0">{course.grade}</span> : null}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : null}

            {facts.length > 0 ? (
                <div className="mt-8 pt-6 border-t border-indigo-100/70 dark:border-indigo-500/10">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-3">Confirmed profile facts</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {facts.map(fact => (
                            <div key={fact.id} className="flex items-start gap-3 rounded-2xl bg-sky-50/70 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 px-4 py-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-neutral-700 dark:text-neutral-200">{fact.value}</p>
                                    <p className="text-[10px] text-sky-600 dark:text-sky-300 mt-2">{FACT_SOURCE_LABELS[fact.source]} · {fact.category}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { void removeContext('fact', fact.id); }}
                                    aria-label="Remove confirmed profile fact"
                                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-white/70 dark:hover:bg-neutral-900/50 transition-colors shrink-0"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            <div className="mt-8 pt-6 border-t border-indigo-100/70 dark:border-indigo-500/10">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2">Add a confirmed profile fact</h5>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4 max-w-2xl">
                    Add a fact from a source you reviewed. Navigator will only use it when its tags match the job context.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                        value={factInput}
                        onChange={event => setFactInput(event.target.value)}
                        placeholder="e.g. Interested in transit planning and municipal work"
                        className="md:col-span-2 w-full bg-sky-50/40 dark:bg-sky-500/5 border border-sky-100 dark:border-sky-500/20 rounded-xl px-3 py-3 text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                    />
                    <input
                        value={factTagsInput}
                        onChange={event => setFactTagsInput(event.target.value)}
                        placeholder="Tags, separated by commas"
                        className="w-full bg-sky-50/40 dark:bg-sky-500/5 border border-sky-100 dark:border-sky-500/20 rounded-xl px-3 py-3 text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                    />
                    <select
                        value={factCategory}
                        onChange={event => setFactCategory(event.target.value as CandidateProfileFact['category'])}
                        className="w-full bg-sky-50/40 dark:bg-sky-500/5 border border-sky-100 dark:border-sky-500/20 rounded-xl px-3 py-3 text-sm font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                    >
                        {(['direction', 'availability', 'experience', 'skill', 'preference', 'story', 'education'] as const).map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    <select
                        value={factSource}
                        onChange={event => setFactSource(event.target.value as CandidateProfileFact['source'])}
                        className="w-full bg-sky-50/40 dark:bg-sky-500/5 border border-sky-100 dark:border-sky-500/20 rounded-xl px-3 py-3 text-sm font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                    >
                        {(Object.keys(FACT_SOURCE_LABELS) as CandidateProfileFact['source'][]).map(source => (
                            <option key={source} value={source}>{FACT_SOURCE_LABELS[source]}</option>
                        ))}
                    </select>
                    <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => { void handleAddFact(); }}
                        disabled={!factInput.trim()}
                        className="md:col-span-2 !text-sky-600 dark:!text-sky-300 !border-sky-100 dark:!border-sky-500/20"
                    >
                        Add confirmed fact
                    </Button>
                </div>
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
                    <div className="flex items-start justify-between gap-4 mb-3">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Navigator’s observations</h5>
                        {storedInsights.length > 0 && (
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => { void handleClearSavedInsights(); }}
                                className="!text-neutral-400 hover:!text-rose-500 shrink-0"
                            >
                                Clear saved choices
                            </Button>
                        )}
                    </div>
                    <div className="mb-3">
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
                                                {insight.status === 'confirmed' ? 'Confirmed' : insight.status === 'needs_review' ? 'Needs review' : 'Suggested'}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{insight.value}</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">Why: {insight.reason}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {insight.status === 'confirmed' || (insight.status === 'needs_review' && insight.sourceVersion !== sourceVersion) ? (
                                            <Button
                                                variant="ghost"
                                                size="xs"
                                                onClick={() => { void handleInsightDecision(insight, 'dismissed'); }}
                                                className="!text-neutral-500 hover:!text-rose-500"
                                            >
                                                {insight.status === 'confirmed' ? 'Stop using' : 'Stop using'}
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
            ) : !signals.length && !stories.length && !facts.length && !educationContext ? null : (
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
