import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Save, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { InterviewChat } from '../../../components/common/InterviewChat';
import type { ChatMessage } from '../../../components/common/InterviewChat';
import { useResumeContext } from '../../resume/context/ResumeContext';
import { summarizeCandidateProfile, type CandidateProfileDraft } from '../../../services/ai/interviewAiService';
import { createCandidateProfileInsight, createCandidateStory, deriveCandidateProfileInsights, getCandidateProfileSourceVersion } from '../../../services/candidateProfileContext';
import { ROUTES } from '../../../constants';
import { authClient } from '../../../lib/auth-client';
import { checkInterviewLimit } from '../../../services/usageLimits';
import { formatInterviewBlocks } from '../../../services/ai/interviewContext';
import type { CandidateProfileInsightStatus, CandidateProfileSignal, CandidateProfileInsightSuggestion, ResumeProfile } from '../../resume/types';

const PROFILE_QUESTIONS = [
    'What kinds of roles are you hoping to pursue next, and what interests you about them?',
    'Which experience should lead applications for the roles you want next?',
    'What should Navigator emphasize about your background when it is relevant?',
    'Is there anything Navigator should never claim, exaggerate, or present as completed?',
];

const REVIEW_QUESTIONS: Record<CandidateProfileInsightSuggestion['key'], string> = {
    current_education: 'Is this education still current?',
    possible_first_role: 'Should Navigator treat you as early-career?',
};

const stringifyResume = (profile: ResumeProfile): string => formatInterviewBlocks(profile);

interface CandidateProfileInterviewProps {
    onClose?: () => void;
}

export const CandidateProfileInterview: React.FC<CandidateProfileInterviewProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const { resumes, handleUpdateResume } = useResumeContext();
    const [questionIndex, setQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [answers, setAnswers] = useState<Array<{ question: string; answer: string }>>([]);
    const [draft, setDraft] = useState<CandidateProfileDraft | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isAccessChecking, setIsAccessChecking] = useState(true);
    const [reviewedInsightKeys, setReviewedInsightKeys] = useState<CandidateProfileInsightSuggestion['key'][]>([]);
    const [isSavingReview, setIsSavingReview] = useState(false);

    const close = onClose || (() => navigate(ROUTES.INTERVIEWS));
    const currentQuestion = PROFILE_QUESTIONS[questionIndex];
    const primaryResume = resumes[0];
    const sourceVersion = getCandidateProfileSourceVersion(primaryResume);
    const reviewItems = useMemo(() => deriveCandidateProfileInsights(primaryResume).filter(insight => {
        if (reviewedInsightKeys.includes(insight.key)) return false;
        const savedInsight = primaryResume?.candidateProfile?.insights?.find(existing => existing.key === insight.key);
        return !savedInsight || savedInsight.sourceVersion !== sourceVersion;
    }), [primaryResume, reviewedInsightKeys, sourceVersion]);
    const reviewItem = reviewItems[0];
    const reviewReason = reviewItem?.key === 'current_education'
        ? 'The dates look current or ongoing.'
        : reviewItem?.reason;

    useEffect(() => {
        let mounted = true;
        const checkAccess = async () => {
            try {
                const { data: { user } } = await authClient.getUser();
                if (!user) {
                    if (mounted) {
                        setError('Please sign in to build your profile.');
                        setIsBlocked(true);
                    }
                    return;
                }
                const limit = await checkInterviewLimit(user.id);
                if (mounted && !limit.allowed) {
                    setError(`Monthly interview limit reached (${limit.used}/${limit.limit}).`);
                    setIsBlocked(true);
                }
            } catch {
                if (mounted) {
                    setError('We could not verify interview access. Please try again.');
                    setIsBlocked(true);
                }
            } finally {
                if (mounted) setIsAccessChecking(false);
            }
        };
        void checkAccess();
        return () => { mounted = false; };
    }, []);

    const messages = useMemo((): ChatMessage[] => {
        const result: ChatMessage[] = [];

        answers.forEach((item, index) => {
            result.push({ id: `profile-question-${index}`, role: 'ai', content: item.question });
            result.push({ id: `profile-answer-${index}`, role: 'user', content: item.answer });
        });

        if (!draft && currentQuestion && !isThinking) {
            result.push({ id: `profile-question-${questionIndex}`, role: 'ai', content: currentQuestion });
        }

        return result;
    }, [answers, currentQuestion, draft, isThinking, questionIndex]);

    const handleReviewDecision = async (status?: CandidateProfileInsightStatus) => {
        if (!reviewItem || !primaryResume || isSavingReview) return;

        setIsSavingReview(true);
        setError(null);
        try {
            if (status) {
                const context = primaryResume.candidateProfile;
                const savedInsight = createCandidateProfileInsight(
                    reviewItem,
                    status,
                    context?.insights?.find(existing => existing.key === reviewItem.key)?.id,
                    sourceVersion,
                );
                await handleUpdateResume({
                    ...primaryResume,
                    candidateProfile: {
                        signals: context?.signals || [],
                        stories: context?.stories || [],
                        facts: context?.facts || [],
                        education: context?.education,
                        availability: context?.availability,
                        currentBlockIds: context?.currentBlockIds || [],
                        insights: [...(context?.insights || []).filter(existing => existing.key !== reviewItem.key), savedInsight],
                        completedAt: context?.completedAt,
                    },
                });
            }
            setReviewedInsightKeys(current => [...current, reviewItem.key]);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unable to save that profile choice.');
        } finally {
            setIsSavingReview(false);
        }
    };

    const handleSubmit = async () => {
        const trimmed = answer.trim();
        if (!trimmed || !currentQuestion || isThinking) return;

        const answerValue = /^(skip|skip this|prefer not to say)$/i.test(trimmed) ? '[Skipped]' : trimmed;
        const nextAnswers = answers.length > questionIndex
            ? [...answers.slice(0, questionIndex), { question: currentQuestion, answer: answerValue }]
            : [...answers, { question: currentQuestion, answer: answerValue }];
        setAnswers(nextAnswers);
        setAnswer('');

        if (questionIndex < PROFILE_QUESTIONS.length - 1) {
            setQuestionIndex(index => index + 1);
            return;
        }

        setIsThinking(true);
        setError(null);
        try {
            const summary = await summarizeCandidateProfile(
                primaryResume ? stringifyResume(primaryResume) : '',
                nextAnswers
            );
            setDraft(summary);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unable to organize your profile right now.');
        } finally {
            setIsThinking(false);
        }
    };

    const handleSave = async () => {
        const primaryResume = resumes[0];
        if (!primaryResume || !draft) return;

        const approvedAt = Date.now();
        const newSignals: CandidateProfileSignal[] = draft.signals
            .filter(signal => signal.value.trim())
            .map(signal => ({
                id: crypto.randomUUID(),
                key: signal.key,
                value: signal.value.trim(),
                source: 'profile_interview',
                approvedAt,
            }));
        const newStories = draft.stories
            .filter(story => story.text.trim())
            .map(story => createCandidateStory(story.text, 'profile_interview', story.tags));
        const existing = primaryResume.candidateProfile;
        const signalsByKey = new Map((existing?.signals || []).map(signal => [signal.key, signal]));
        newSignals.forEach(signal => signalsByKey.set(signal.key, signal));
        const existingStoryText = new Set((existing?.stories || []).map(story => story.text.trim().toLowerCase()));
        const storiesToAdd = newStories.filter(story => !existingStoryText.has(story.text.toLowerCase()));

        await handleUpdateResume({
            ...primaryResume,
            candidateProfile: {
                signals: [...signalsByKey.values()],
                stories: [...(existing?.stories || []), ...storiesToAdd],
                facts: existing?.facts || [],
                education: existing?.education,
                availability: existing?.availability,
                currentBlockIds: existing?.currentBlockIds || [],
                insights: existing?.insights || [],
                completedAt: approvedAt,
            },
        });
        setSaved(true);
    };

    if (isBlocked) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-black px-4 py-16">
                <div className="max-w-xl mx-auto bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 text-center shadow-sm">
                    <h1 className="text-xl font-black text-neutral-900 dark:text-white mb-3">Profile interview unavailable</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">{error}</p>
                    <button onClick={close} className="rounded-2xl bg-neutral-600 text-white px-5 py-3 text-sm font-black">Back to interviews</button>
                </div>
            </div>
        );
    }

    if (draft) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-black px-4 py-16">
                <div className="max-w-2xl mx-auto">
                    <button onClick={close} className="inline-flex items-center gap-2 text-xs font-black text-neutral-500 hover:text-neutral-600 mb-8">
                        <ArrowLeft className="w-4 h-4" /> Back to interviews
                    </button>
                    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-5 h-5 text-neutral-500" />
                            <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Your reusable profile context</h1>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">Review this before saving. Navigator will only use it when it is relevant to an application.</p>

                        {draft.signals.length > 0 && (
                            <section className="mb-6">
                                <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-3">Signals</h2>
                                <div className="space-y-2">
                                    {draft.signals.map((signal, index) => <p key={`${signal.key}-${index}`} className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-500/10 rounded-xl px-4 py-3">{signal.value}</p>)}
                                </div>
                            </section>
                        )}

                        {draft.stories.length > 0 && (
                            <section className="mb-8">
                                <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-3">Application examples</h2>
                                <div className="space-y-2">
                                    {draft.stories.map((story, index) => <p key={`${story.text}-${index}`} className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3">{story.text}</p>)}
                                </div>
                            </section>
                        )}

                        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
                        {saved ? (
                            <button onClick={close} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-white py-3 text-sm font-black"><Check className="w-4 h-4" /> Saved to your profile</button>
                        ) : (
                            <button onClick={() => { void handleSave(); }} className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-neutral-600 hover:bg-neutral-700 text-white py-3 text-sm font-black"><Save className="w-4 h-4" /> Save to my profile</button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col items-center bg-neutral-50/50 dark:bg-black overflow-hidden">
            <div className="w-full max-w-4xl flex-1 min-h-0 flex flex-col pt-16">
                {reviewItem ? (
                    <div className="max-w-2xl w-full mx-auto px-5 py-10">
                        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-500/20 p-8 shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 dark:text-neutral-300 mb-3">Profile review</p>
                            <h1 className="text-2xl font-black text-neutral-900 dark:text-white mb-4">{REVIEW_QUESTIONS[reviewItem.key]}</h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">Based on your resume:</p>
                            <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-500/10 rounded-2xl px-4 py-3">{reviewItem.value}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">Why: {reviewReason}</p>
                            <div className="flex flex-wrap gap-3 mt-8">
                                <button type="button" onClick={() => { void handleReviewDecision('confirmed'); }} disabled={isSavingReview} className="rounded-2xl bg-neutral-600 hover:bg-neutral-700 disabled:opacity-50 text-white px-5 py-3 text-sm font-black">That’s right</button>
                                <button type="button" onClick={() => { void handleReviewDecision('dismissed'); }} disabled={isSavingReview} className="rounded-2xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 px-5 py-3 text-sm font-black">Not me</button>
                                <button type="button" onClick={() => { void handleReviewDecision(); }} disabled={isSavingReview} className="rounded-2xl text-neutral-500 px-4 py-3 text-sm font-bold">Skip</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="px-5 pb-2">
                        <div className="max-w-2xl mx-auto rounded-3xl border border-neutral-100 bg-neutral-50/70 px-6 py-5 dark:border-neutral-500/20 dark:bg-neutral-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-neutral-500" />
                                <h1 className="text-lg font-black text-neutral-900 dark:text-white">Build your application profile</h1>
                            </div>
                            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">Answer a few optional questions about your goals and experience. You can skip anything, review the summary, and approve what Navigator may reuse in future applications.</p>
                        </div>
                    </div>
                )}
                {!reviewItem && (
                    <InterviewChat
                        messages={messages}
                        inputValue={answer}
                        onInputChange={setAnswer}
                        onSubmit={() => { void handleSubmit(); }}
                        isThinking={isThinking}
                        placeholder="Type your answer, or say skip..."
                        inputHint={`Question ${questionIndex + 1} of ${PROFILE_QUESTIONS.length}`}
                        inputDisabled={isThinking || isAccessChecking}
                        accentGradient="from-neutral-500 to-neutral-500"
                    />
                )}
                {error && <p className="text-center text-sm text-red-600 pb-4">{error}</p>}
            </div>
        </div>
    );
};
