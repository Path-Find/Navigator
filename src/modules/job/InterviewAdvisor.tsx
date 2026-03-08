import React, { useState } from 'react';
import {
    MessageSquare,
    Sparkles,
    Target,
    Zap,
    CheckCircle2,
    Loader2,
    AlertCircle,
    FileText,
    Copy,
    ShieldCheck,
    Check
} from 'lucide-react';
import { useJobContext } from './context/JobContext';
import { useResumeContext } from '../resume/context/ResumeContext';
import { useInterview } from './hooks/useInterview';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { motion } from 'framer-motion';
import { checkInterviewLimit } from '../../services/usageLimits';
import { BentoCard } from '../../components/ui/BentoCard';
import { FEATURE_COLORS } from '../../featureRegistry';
import { supabase } from '../../services/supabase';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { LoadingState } from '../../components/common/LoadingState';
import { useToast } from '../../contexts/ToastContext';
import { InterviewChat } from '../../components/common/InterviewChat';
import type { ChatMessage } from '../../components/common/InterviewChat';

export const InterviewAdvisor: React.FC = () => {
    const { jobs } = useJobContext();
    const {
        questions,
        currentQuestionIndex,
        currentQuestion,
        responses,
        isLoading,
        loadGeneralQuestions,
        loadTailoredQuestions,
        submitResponse,
        nextQuestion,
        isLastQuestion
    } = useInterview();

    const { resumes, handleUpdateResume } = useResumeContext();

    const [mode, setMode] = useState<'selection' | 'session'>('selection');
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [userResponse, setUserResponse] = useState('');
    const [limitError, setLimitError] = useState<string | null>(null);
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const navigate = useNavigate();

    const { isFocusedMode, setFocusedMode } = useGlobalUI();
    const { showError } = useToast();

    React.useEffect(() => {
        if (mode === 'session') {
            setFocusedMode(true);
        } else {
            setFocusedMode(false);
        }
        return () => setFocusedMode(false);
    }, [mode, setFocusedMode]);

    // Reset mode if focused mode is disabled externally (e.g., from Header 'Exit')
    React.useEffect(() => {
        if (mode === 'session' && !isFocusedMode) {
            setMode('selection');
        }
    }, [mode, isFocusedMode]);

    const [resumeSnippets, setResumeSnippets] = React.useState<{ text: string; source: string }[]>([]);

    const computeSnippets = () => {
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



    const handleStartTailored = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const limit = await checkInterviewLimit(user.id);
        if (!limit.allowed) {
            setLimitError(`Monthly interview limit reached (${limit.used}/${limit.limit})`);
            return;
        }

        const job = jobs.find(j => j.id === selectedJobId);
        if (job) {
            setResumeSnippets(computeSnippets());
            loadTailoredQuestions(job, resumes);
            setMode('session');
        } else {
            showError("Please select a target job first");
        }
    };

    const handleStartGeneral = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const limit = await checkInterviewLimit(user.id);
        if (!limit.allowed) {
            setLimitError(`Monthly interview limit reached (${limit.used}/${limit.limit})`);
            return;
        }

        setResumeSnippets(computeSnippets());
        loadGeneralQuestions(resumes);
        setMode('session');
    };

    const handleSubmit = async () => {
        if (!userResponse.trim()) return;
        const job = jobs.find(j => j.id === selectedJobId);
        await submitResponse(currentQuestion.id, userResponse, job);
        setUserResponse('');
    };

    const handleBankSuggestion = React.useCallback(async (suggestion: { type: string; suggestion: string; impact: string }) => {
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
    }, [resumes, handleUpdateResume]);

    const isSessionLoading = mode === 'session' && questions.length === 0 && isLoading;

    // Build flat ChatMessage[] from questions + responses for InterviewChat
    const chatMessages = React.useMemo((): ChatMessage[] => {
        if (mode !== 'session' || !questions || questions.length === 0) return [];

        const msgs: ChatMessage[] = [];
        const conversationHistory = questions.slice(0, currentQuestionIndex + 1);

        conversationHistory.forEach((q, qIdx) => {
            const isLastQ = qIdx === conversationHistory.length - 1;
            const resp = responses[q.id];

            // AI question
            msgs.push({
                id: `q-${q.id}`,
                role: 'ai',
                content: q.question,
                metadata: (
                    <>
                        {/* Resume snippets (only on the current unanswered question) */}
                        {isLastQ && !resp && resumeSnippets.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-4 pt-3 flex flex-wrap gap-2"
                            >
                                <div className="w-full text-[10px] font-black text-neutral-400 mb-1 flex items-center gap-1.5">
                                    <Target className="w-3 h-3" />
                                    You might want to think about...
                                </div>
                                {resumeSnippets.map((snippet, sIdx) => (
                                    <div
                                        key={sIdx}
                                        className="group flex items-center gap-2 px-3 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-sm hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all cursor-default max-w-xs"
                                        title={snippet.source}
                                    >
                                        <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 truncate">
                                            {snippet.text}
                                        </span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50" />
                                    </div>
                                ))}
                            </motion.div>
                        )}
                        {q.rationale && (
                            <div className="mt-3 text-xs text-neutral-500 italic bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg inline-block">
                                Rationale: {q.rationale}
                            </div>
                        )}
                    </>
                ),
            });
            if (resp) {
                msgs.push({
                    id: `r-${q.id}`,
                    role: 'user',
                    content: resp.response,
                    metadata: resp.analysis ? (
                        <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 space-y-3">
                            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                                <Sparkles className="w-4 h-4" />
                                <span>Verdict: {resp.analysis.decision}</span>
                            </div>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {resp.analysis.feedback}
                            </p>
                            {resp.analysis.betterVersion && (
                                <div className="text-xs text-neutral-500 dark:text-neutral-500 pt-2 border-t border-indigo-200 dark:border-indigo-800/30">
                                    <strong>Better:</strong> "{resp.analysis.betterVersion}"
                                </div>
                            )}

                            {/* Resume Suggestions */}
                            {resp.analysis.resumeSuggestions && resp.analysis.resumeSuggestions.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-indigo-200 dark:border-indigo-800/30 space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500">
                                        <FileText className="w-3 h-3" />
                                        <span>Resume Suggestions Based on your Answer</span>
                                    </div>
                                    <div className="space-y-2">
                                        {resp.analysis.resumeSuggestions.map((suggestion, sIdx) => {
                                            const isBanked = resumes[0]?.suggestedUpdates?.some(u => u.suggestion === suggestion.suggestion);

                                            return (
                                                <div key={sIdx} className="bg-white dark:bg-neutral-900/50 rounded-xl p-3 border border-indigo-100 dark:border-indigo-500/10 group/suggest">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[11px] font-bold text-neutral-900 dark:text-neutral-200">{suggestion.suggestion}</span>
                                                            </div>
                                                            <p className="text-[10px] text-neutral-500 leading-relaxed italic">{suggestion.impact}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <button
                                                                onClick={() => handleBankSuggestion(suggestion)}
                                                                disabled={isBanked}
                                                                className={`p-1.5 rounded-lg transition-all ${isBanked
                                                                    ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 cursor-default'
                                                                    : 'hover:bg-indigo-50 text-neutral-400 hover:text-indigo-600 dark:hover:bg-indigo-500/10'
                                                                    }`}
                                                                title={isBanked ? "Banked" : "Bank Suggestion"}
                                                            >
                                                                {isBanked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(suggestion.suggestion);
                                                                    setCopiedText(suggestion.suggestion);
                                                                    setTimeout(() => setCopiedText(null), 2000);
                                                                }}
                                                                className={`p-1.5 rounded-lg transition-colors ${copiedText === suggestion.suggestion
                                                                    ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10'
                                                                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-indigo-500'}`}
                                                                title="Copy to clipboard"
                                                            >
                                                                {copiedText === suggestion.suggestion ? (
                                                                    <Check className="w-3.5 h-3.5" />
                                                                ) : (
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : undefined,
                });
            }
        });

        return msgs;
    }, [questions, currentQuestionIndex, responses, mode, resumes, copiedText, resumeSnippets, handleBankSuggestion]);



    if (isSessionLoading) {
        return (
            <div className="min-h-screen bg-neutral-50 dark:bg-black flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full space-y-12">
                    <LoadingState
                        message="Preparing your session..."
                        subMessage="Tailoring questions to your unique background"
                    />

                    {resumeSnippets.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-2 justify-center">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                                <span className="text-[10px] font-black text-neutral-400">
                                    Reviewing your background
                                </span>
                            </div>

                            <div className="grid gap-3">
                                {resumeSnippets.map((snippet, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm"
                                    >
                                        <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed italic">
                                            "{snippet.text}"
                                        </p>
                                        <p className="text-[9px] font-bold text-indigo-500 mt-2 flex items-center gap-1">
                                            <Target className="w-2.5 h-2.5" />
                                            {snippet.source}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }








    if (mode === 'session') {
        // Safety check: ensure questions exist
        if (!questions || questions.length === 0) {
            return (
                <div className="min-h-screen bg-neutral-50 dark:bg-black flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
                </div>
            );
        }

        const currentQ = questions[currentQuestionIndex];
        const hasResponse = currentQ && !!responses[currentQ.id];

        return (
            <InterviewChat
                messages={chatMessages}
                inputValue={userResponse}
                onInputChange={setUserResponse}
                onSubmit={handleSubmit}
                isThinking={isLoading}
                placeholder={hasResponse ? 'Waiting for next question...' : 'Type your answer...'}
                inputHint={
                    hasResponse
                        ? (isLastQuestion ? 'Interview Complete' : 'Press Enter for Next Question')
                        : 'Press Enter to Submit'
                }
                showNextButton={hasResponse && !isLastQuestion}
                onNext={nextQuestion}
                inputDisabled={!currentQ || hasResponse || isLoading}
                accentGradient="from-indigo-500 to-violet-500"
            />
        );
    }



    return (
        <SharedPageLayout className="theme-job" spacing="compact" maxWidth="6xl">
            <PageHeader
                title="Interview Advisor"
                subtitle="Master your narrative with AI-powered mock sessions"
                variant="simple"
                className="mb-8"
            />

            {limitError && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-2xl flex items-center gap-3 text-orange-700 dark:text-orange-400 text-sm font-bold"
                >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{limitError}</span>
                    <button
                        onClick={() => navigate(ROUTES.PLANS)}
                        className="ml-auto px-4 py-1.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
                    >
                        Upgrade
                    </button>
                </motion.div>
            )}

            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {/* General Session Card */}
                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both">
                        <BentoCard
                            id="general"
                            icon={MessageSquare}
                            title="General Prep"
                            description="Broad behavioral questions applicable across roles. Master the STAR method."
                            color={FEATURE_COLORS.indigo}
                            actionLabel="Practice Now"
                            onAction={handleStartGeneral}
                            previewContent={
                                <ul className="space-y-3 pt-4 border-t border-neutral-100 dark:border-white/5">
                                    {[
                                        'Common behavioral questions',
                                        'STAR method training',
                                        'Instant AI feedback'
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-neutral-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            }
                        />
                    </div>

                    {/* Tailored Session Card */}
                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 fill-mode-both">
                        <BentoCard
                            id="tailored"
                            icon={Target}
                            title="Tailored Mock"
                            description="Generated based on a specific role you've analyzed. High-stakes precision."
                            color={FEATURE_COLORS.violet}
                            actionLabel="Launch Mock"
                            onAction={handleStartTailored}
                            className={!selectedJobId ? "opacity-90" : ""}
                            previewContent={
                                <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-white/5 min-h-[160px] flex flex-col">
                                    <label className="text-[10px] font-black text-neutral-400">
                                        Select Target Job
                                    </label>

                                    {jobs.filter(j => j.status !== 'feed' && j.analysis).length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar flex-grow">
                                            {jobs.filter(j => j.status !== 'feed' && j.analysis).map(job => (
                                                <button
                                                    key={job.id}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedJobId(job.id);
                                                    }}
                                                    className={`p-2.5 rounded-xl border transition-all text-left flex items-center justify-between group/item ${selectedJobId === job.id
                                                        ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30'
                                                        : 'bg-neutral-50 border-neutral-100 hover:border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-800'
                                                        }`}
                                                >
                                                    <div className="min-w-0">
                                                        <p className={`font-black text-[11px] truncate ${selectedJobId === job.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-700 dark:text-neutral-300'}`}>{job.position}</p>
                                                        <p className="text-[9px] font-bold truncate text-neutral-400">
                                                            {job.company}
                                                        </p>
                                                    </div>
                                                    {selectedJobId === job.id && (
                                                        <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 space-y-2 flex-grow flex flex-col justify-center">
                                            <div className="w-8 h-8 bg-white dark:bg-neutral-800 rounded-lg flex items-center justify-center mx-auto shadow-sm">
                                                <Sparkles className="w-4 h-4 text-neutral-300" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-black text-neutral-500">No analyzed jobs</p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(ROUTES.HISTORY);
                                                    }}
                                                    className="text-[9px] font-black text-indigo-500 hover:underline transition-all"
                                                >
                                                    View History
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            }
                        />
                    </div>

                    {/* Prep Tips Card */}
                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-both">
                        <BentoCard
                            id="tips"
                            icon={Zap}
                            title="Preparation Tips"
                            description="Logic and strategy to differentiate your narrative and maximize impact."
                            color={FEATURE_COLORS.amber}
                            previewContent={
                                <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-white/5">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <Target className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-neutral-900 dark:text-white">Master the 'Why'</p>
                                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">Focus on business impact, not tasks.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                                            <Zap className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-neutral-900 dark:text-white">Quantify Success</p>
                                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">Use numbers like 40% reduction.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-neutral-900 dark:text-white">STAR+ Method</p>
                                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">S-T-A-R + Learning/Impact.</p>
                                        </div>
                                    </div>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>
        </SharedPageLayout >
    );
};
