import React from 'react';
import { ArrowRight, BookOpen, ChevronDown, GraduationCap, Sparkles, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../contexts/ToastContext';
import { useUser } from '../../../contexts/UserContext';
import { useResumeContext } from '../../resume/context/ResumeContext';
import { ROUTES } from '../../../constants';
import { Storage } from '../../../services/storageService';
import { createCandidateEducationContext, deriveCandidateProfileInsights, getCandidateProfileSourceVersion } from '../../../services/candidateProfileContext';
import type { CandidateAvailability, CandidateEmploymentType, CandidateProfileSignal, CandidateRelocationPreference, CandidateStartTiming, CandidateStory, CandidateWorkArrangement } from '../../resume/types';
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

const RELOCATION_OPTIONS: Array<{ value: CandidateRelocationPreference; label: string }> = [
    { value: 'not_open', label: 'Not open to relocating' },
    { value: 'within_region', label: 'Within my region' },
    { value: 'within_country', label: 'Within my country' },
    { value: 'open_to_relocation', label: 'Open to relocating' },
    { value: 'depends', label: 'Depends on the role' },
];

const WORK_ARRANGEMENT_OPTIONS: Array<{ value: CandidateWorkArrangement; label: string }> = [
    { value: 'on_site', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'remote', label: 'Remote' },
    { value: 'no_preference', label: 'No preference' },
];

const EMPLOYMENT_TYPE_OPTIONS: Array<{ value: CandidateEmploymentType; label: string }> = [
    { value: 'full_time', label: 'Full-time' },
    { value: 'part_time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'co_op', label: 'Co-op' },
    { value: 'seasonal', label: 'Seasonal' },
];

const START_TIMING_OPTIONS: Array<{ value: CandidateStartTiming; label: string }> = [
    { value: 'immediately', label: 'Immediately' },
    { value: 'within_one_month', label: 'Within one month' },
    { value: 'specific_date', label: 'On a specific date' },
    { value: 'flexible', label: 'Flexible' },
];

const toggleOption = <T,>(values: T[], value: T): T[] => values.includes(value)
    ? values.filter(item => item !== value)
    : [...values, value];

export const CandidateProfileContextManager: React.FC = () => {
    const navigate = useNavigate();
    const { resumes, handleUpdateResume, isLoading } = useResumeContext();
    const { journey, coverLetterPreferences, updateProfile } = useUser();
    const { showSuccess, showError } = useToast();
    const [coverLetterPreferencesInput, setCoverLetterPreferencesInput] = React.useState(coverLetterPreferences || '');
    const [transcript, setTranscript] = React.useState<Transcript | null>(null);
    const [availabilityCity, setAvailabilityCity] = React.useState('');
    const [relocation, setRelocation] = React.useState<CandidateRelocationPreference>('depends');
    const [workArrangements, setWorkArrangements] = React.useState<CandidateWorkArrangement[]>([]);
    const [employmentTypes, setEmploymentTypes] = React.useState<CandidateEmploymentType[]>([]);
    const [startTiming, setStartTiming] = React.useState<CandidateStartTiming>('flexible');
    const [startDate, setStartDate] = React.useState('');
    const [isProfileExpanded, setIsProfileExpanded] = React.useState(true);
    const primaryResume = resumes[0];
    const signals = primaryResume?.candidateProfile?.signals || [];
    const stories = primaryResume?.candidateProfile?.stories || [];
    const storedFacts = primaryResume?.candidateProfile?.facts || [];
    const currentBlockIds = primaryResume?.candidateProfile?.currentBlockIds || [];
    const facts = storedFacts.filter(fact => fact.status === 'confirmed');
    // A newly uploaded transcript is the freshest compact education source.
    // Fall back to saved profile education when no transcript is available.
    const educationContext = transcript
        ? createCandidateEducationContext(transcript)
        : primaryResume?.candidateProfile?.education;
    const storedInsights = primaryResume?.candidateProfile?.insights || [];
    const inferredInsights = deriveCandidateProfileInsights(primaryResume);
    const sourceVersion = getCandidateProfileSourceVersion(primaryResume);
    const reviewCount = inferredInsights.filter(insight => {
        const saved = storedInsights.find(existing => existing.key === insight.key);
        return !saved || saved.sourceVersion !== sourceVersion;
    }).length;
    const hasContext = signals.length > 0
        || stories.length > 0
        || facts.length > 0
        || Boolean(educationContext?.courses.length)
        || Boolean(primaryResume?.candidateProfile?.availability)
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

    React.useEffect(() => {
        const saved = primaryResume?.candidateProfile?.availability;
        if (saved) {
            setAvailabilityCity(saved.city || '');
            setRelocation(saved.relocation);
            setWorkArrangements(saved.workArrangements);
            setEmploymentTypes(saved.employmentTypes);
            setStartTiming(saved.startTiming);
            setStartDate(saved.startDate || '');
        }
    }, [primaryResume?.id, primaryResume?.candidateProfile?.availability]);

    const handleSaveCoverLetterPreferences = () => {
        const trimmed = coverLetterPreferencesInput.trim();
        if (trimmed !== (coverLetterPreferences || '')) {
            void updateProfile({ cover_letter_preferences: trimmed || null }).catch(() => showError('Failed to save cover-letter preferences.'));
        }
    };

    const handleSaveAvailability = async () => {
        if (!primaryResume) return;

        const context = primaryResume.candidateProfile;
        const availability: CandidateAvailability = {
            ...(availabilityCity.trim() ? { city: availabilityCity.trim() } : {}),
            relocation,
            workArrangements,
            employmentTypes,
            startTiming,
            ...(startTiming === 'specific_date' && startDate ? { startDate } : {}),
            updatedAt: Date.now(),
        };
        await handleUpdateResume({
            ...primaryResume,
            candidateProfile: {
                signals: context?.signals || [],
                stories: context?.stories || [],
                facts: context?.facts || [],
                education: context?.education,
                availability,
                currentBlockIds: context?.currentBlockIds || [],
                insights: context?.insights || [],
                completedAt: context?.completedAt,
            },
        });
        showSuccess('Saved structured availability preferences.');
    };

    const handleClearSavedInsights = async () => {
        if (!primaryResume || storedInsights.length === 0) return;

        const context = primaryResume.candidateProfile;
        await handleUpdateResume({
            ...primaryResume,
            candidateProfile: signals.length || stories.length
                || storedFacts.length
                || educationContext
                || context?.availability
                ? {
                    signals,
                    stories,
                    facts: storedFacts,
                    education: context?.education,
                    availability: context?.availability,
                    currentBlockIds,
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
            candidateProfile: nextSignals.length || nextStories.length || nextFacts.length || educationContext || context?.availability
                ? {
                    signals: nextSignals,
                    stories: nextStories,
                    facts: nextFacts,
                    education: context?.education,
                    availability: context?.availability,
                    currentBlockIds,
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

                <div className="flex flex-wrap gap-2 shrink-0">
                    <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => navigate(ROUTES.PROFILE_INTERVIEW)}
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                        className="!text-indigo-600 dark:!text-indigo-400 !border-indigo-100 dark:!border-indigo-500/20"
                    >
                        Review profile
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsProfileExpanded(current => !current)}
                        icon={<ChevronDown className={`w-3.5 h-3.5 transition-transform ${isProfileExpanded ? 'rotate-180' : ''}`} />}
                        className="!text-neutral-500 dark:!text-neutral-400"
                    >
                        {isProfileExpanded ? 'Hide details' : 'Edit details'}
                    </Button>
                </div>
            </div>

            {isProfileExpanded && <>
            <div className="mt-8 pt-6 border-t border-indigo-100/70 dark:border-indigo-500/10">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <h5 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Availability</h5>
                        <p className="text-xs text-neutral-400 leading-relaxed mt-2 max-w-2xl">
                            These choices help Navigator filter and frame applications. City is the only short text field; the rest stay structured.
                        </p>
                    </div>
                    <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => { void handleSaveAvailability(); }}
                        className="shrink-0 !text-indigo-600 dark:!text-indigo-300 !border-indigo-100 dark:!border-indigo-500/20"
                    >
                        Save availability
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                        Current city
                        <input
                            value={availabilityCity}
                            onChange={event => setAvailabilityCity(event.target.value)}
                            placeholder="e.g. Toronto"
                            maxLength={80}
                            className="mt-2 w-full bg-indigo-50/40 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-xl px-3 py-3 text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        />
                    </label>
                    <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                        Relocation
                        <select
                            value={relocation}
                            onChange={event => setRelocation(event.target.value as CandidateRelocationPreference)}
                            className="mt-2 w-full bg-indigo-50/40 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-xl px-3 py-3 text-sm font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        >
                            {RELOCATION_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                    </label>
                    <fieldset>
                        <legend className="text-xs font-bold text-neutral-600 dark:text-neutral-300 mb-2">Work arrangement</legend>
                        <div className="flex flex-wrap gap-2">
                            {WORK_ARRANGEMENT_OPTIONS.map(option => (
                                <label key={option.value} className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-500/5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={workArrangements.includes(option.value)}
                                        onChange={() => setWorkArrangements(current => toggleOption(current, option.value))}
                                        className="accent-indigo-600"
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend className="text-xs font-bold text-neutral-600 dark:text-neutral-300 mb-2">Employment type</legend>
                        <div className="flex flex-wrap gap-2">
                            {EMPLOYMENT_TYPE_OPTIONS.map(option => (
                                <label key={option.value} className="inline-flex items-center gap-2 rounded-xl border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-500/5 px-3 py-2 text-xs text-neutral-700 dark:text-neutral-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={employmentTypes.includes(option.value)}
                                        onChange={() => setEmploymentTypes(current => toggleOption(current, option.value))}
                                        className="accent-indigo-600"
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    </fieldset>
                    <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                        Start timing
                        <select
                            value={startTiming}
                            onChange={event => setStartTiming(event.target.value as CandidateStartTiming)}
                            className="mt-2 w-full bg-indigo-50/40 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-xl px-3 py-3 text-sm font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                        >
                            {START_TIMING_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                    </label>
                    {startTiming === 'specific_date' ? (
                        <label className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                            Available from
                            <input
                                type="date"
                                value={startDate}
                                onChange={event => setStartDate(event.target.value)}
                                className="mt-2 w-full bg-indigo-50/40 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-xl px-3 py-3 text-sm font-medium text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            />
                        </label>
                    ) : null}
                </div>
            </div>

            {educationContext?.courses.length ? (
                <div className="mt-8 pt-6 border-t border-indigo-100/70 dark:border-indigo-500/10">
                    <div className="flex items-start gap-3 mb-4">
                        <GraduationCap className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <div>
                            <h5 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Education context</h5>
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
                    <h5 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Additional profile details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {facts.map(fact => (
                            <div key={fact.id} className="flex items-start gap-3 rounded-2xl bg-sky-50/70 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 px-4 py-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm text-neutral-700 dark:text-neutral-200">{fact.value}</p>
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
                <div className="pb-6 border-b border-indigo-100/70 dark:border-indigo-500/10">
                    <h5 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Cover-letter style</h5>
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
                        <h5 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Current focus</h5>
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

            {reviewCount > 0 || storedInsights.length > 0 ? (
                <div className="mt-8 pt-6 border-t border-violet-100/70 dark:border-violet-500/10 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-neutral-400">
                        {reviewCount > 0 ? `${reviewCount} profile observation${reviewCount === 1 ? '' : 's'} ready to review.` : 'Profile review is up to date.'}
                    </p>
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
            ) : null}

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
                            <h5 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Signals</h5>
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
                            <h5 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">Stories</h5>
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
            </>}
        </section>
    );
};
