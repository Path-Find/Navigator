import React, { useState } from 'react';
import { Sparkles, FileText, CheckCircle2, ShieldCheck, Check, Copy, Loader2, BookmarkPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { InterviewChat } from '../../../components/common/InterviewChat';
import type { ChatMessage } from '../../../components/common/InterviewChat';
import { handleBankSuggestion } from '../utils/interviewUtils';
import type { InterviewQuestion, InterviewResponseAnalysis, SavedJob } from '../types';
import type { ResumeProfile } from '../../resume/types';

type ResumeSuggestionItem = NonNullable<InterviewResponseAnalysis['resumeSuggestions']>[number];

const STAR_EXAMPLES = [
    'Our team was missing deadlines (Situation), and I was asked to improve the process (Task). I created a shared tracker and weekly check-ins (Action), which helped us deliver the next project on time (Result).',
    'A customer was frustrated by a delayed request (Situation), and I needed to resolve it while keeping them informed (Task). I mapped the issue, coordinated with the right team, and gave regular updates (Action), and the customer stayed with us (Result).',
    'I noticed new team members were struggling with the same system (Situation), so I took responsibility for making onboarding clearer (Task). I wrote a short guide and paired with each new teammate (Action), which shortened the time it took them to work independently (Result).',
];

const getAnswerFramework = (question: InterviewQuestion): { name: 'STAR' | 'ARC'; description: string } => {
    const normalized = question.question.toLowerCase();
    const isExperienceStory = /tell me about a time|describe a time|give me an example|walk me through a situation|experience where/.test(normalized);

    return isExperienceStory
        ? { name: 'STAR', description: 'Use a specific situation, your task, the actions you took, and the result.' }
        : { name: 'ARC', description: 'Answer directly, add the relevant context, and connect it to the role or question.' };
};

interface SessionProps {
    questions: InterviewQuestion[];
    currentQuestionIndex: number;
    responses: Record<string, { response: string; analysis?: InterviewResponseAnalysis; savedAsStory?: boolean }>;
    mode: string;
    sessionType: 'general' | 'tailored' | null;
    jobs: SavedJob[];
    selectedJobId: string | null;
    onJobSelected: (id: string) => void;
    resumes: ResumeProfile[];
    resumeSnippets: { text: string; source: string }[];
    isSessionLoading: boolean;
    isLoading: boolean;
    userResponse: string;
    setUserResponse: (v: string) => void;
    handleSubmit: () => void;
    nextQuestion: () => void;
    isLastQuestion: boolean;
    handleUpdateResume: (resume: ResumeProfile) => Promise<void>;
    onSaveStory: (questionId: string) => Promise<void>;
}

export const InterviewSessionScreen = ({
    questions, currentQuestionIndex, responses, mode, sessionType, jobs, selectedJobId, onJobSelected,
    resumes, resumeSnippets, isSessionLoading, isLoading, userResponse, setUserResponse, handleSubmit,
    nextQuestion, isLastQuestion, handleUpdateResume, onSaveStory
}: SessionProps) => {
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const [showStarHelp, setShowStarHelp] = useState(false);
    const [hasStartedInterview, setHasStartedInterview] = useState(false);
    const [starExample] = useState(() => STAR_EXAMPLES[Math.floor(Math.random() * STAR_EXAMPLES.length)]);

    const onBankSuggestion = React.useCallback(async (suggestion: ResumeSuggestionItem) => {
        await handleBankSuggestion(suggestion, resumes, handleUpdateResume);
    }, [resumes, handleUpdateResume]);

    const chatMessages = React.useMemo((): ChatMessage[] => {
        if (mode !== 'session') return [];

        const msgs: ChatMessage[] = [];
        const hasAnsweredAnyQuestion = Object.keys(responses).length > 0;
        const interviewHasStarted = hasStartedInterview || hasAnsweredAnyQuestion || currentQuestionIndex > 0;

        // Preparing state (in-chat loading)
        if (isSessionLoading) {
            msgs.push({
                id: 'preparing-session',
                role: 'ai',
                content: "One moment—I'm preparing your tailored interview questions based on your unique background...",
                isThinking: true
            });
            return msgs;
        }

        // Special case: Initial Job Selection for Tailored Interviews
        if (sessionType === 'tailored' && !selectedJobId) {
            const analyzedJobs = jobs.filter(j => j.status !== 'feed' && j.analysis).slice(0, 5);
            
            const pills: NonNullable<ChatMessage['suggestionPills']> = analyzedJobs.map(job => ({
                id: job.id,
                label: job.position,
                sublabel: job.company,
                onClick: () => onJobSelected(job.id)
            }));

            // We don't show an "Other" pill anymore. 
            // If jobs exist, the user picks from the pills. 
            // If no jobs exist, the input box is shown automatically.
            
            msgs.push({
                id: 'initial-job-selection',
                role: 'ai',
                content: "Welcome! Which job would you like to practice for today?",
                suggestionPills: pills.length > 0 ? pills : undefined
            });
            return msgs;
        }

        if (!questions || questions.length === 0) return [];

        const job = jobs.find(j => j.id === selectedJobId);
        const companyName = job?.company || '';
        const positionName = job?.position || 'this';

        const intro = sessionType === 'tailored' && job
            ? `Great pick! We'll practice for your ${positionName} role${companyName ? ` at ${companyName}` : ''}. I'll ask one question at a time, and after each answer I'll give you practical coaching to make it stronger.`
            : 'Welcome! We\'ll run this like a real behavioral interview. I\'ll ask one question at a time, and after each answer I\'ll give you practical coaching to help you improve.';
        const continueInterview = () => {
            setShowStarHelp(false);
            setHasStartedInterview(true);
        };

        msgs.push({
            id: 'intro-msg',
            role: 'ai',
            content: `${intro}${!showStarHelp && !interviewHasStarted ? '\n\nYou can ask for STAR guidance before you begin if you want a structure for your answer.' : ''}${interviewHasStarted ? '\n\nTake a moment, then answer as you would in the interview.' : ''}`,
            suggestionPills: !showStarHelp && !interviewHasStarted ? [
                    { id: 'continue-interview', label: 'Continue interview', onClick: continueInterview, variant: 'action' as const },
                    { id: 'star-help', label: "What's STAR?", onClick: () => setShowStarHelp(true), variant: 'action' as const },
                ] : undefined,
        });

        if (showStarHelp) {
            msgs.push({
                id: 'star-help',
                role: 'ai',
                content: `STAR is a simple structure for answering experience-based questions:\n\n• Situation — set the context.\n• Task — explain what needed to be done.\n• Action — focus on what you personally did.\n• Result — share what changed or what you learned.\n\nExample: “${starExample}”`,
                suggestionPills: [{ id: 'continue-interview', label: 'Continue interview', onClick: continueInterview, variant: 'action' as const }],
            });
        }

        if (!hasStartedInterview) return msgs;

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
                        {isLastQ && !resp && (() => {
                            const framework = getAnswerFramework(q);
                            return (
                                <div className="mt-3 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Suggested approach: {framework.name}</p>
                                    <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">{framework.description}</p>
                                </div>
                            );
                        })()}
                        {/* Resume snippets (only on the current unanswered question) */}
                        {isLastQ && !resp && resumeSnippets.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-4 pt-3 flex flex-wrap gap-2"
                            >
                                <div className="w-full text-[10px] font-black text-neutral-400 mb-1 flex items-center gap-1.5">
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
                                    </div>
                                ))}
                            </motion.div>
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
                        <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20 space-y-2">
                            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Verdict: {resp.analysis.decision}</span>
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {resp.analysis.feedback}
                            </p>
                                    {sessionType === 'general' && resp.analysis.decision !== 'Reject' && resp.response !== '[Skipped]' && (
                                <button
                                    onClick={() => { void onSaveStory(q.id); }}
                                    disabled={resp.savedAsStory}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors ${resp.savedAsStory
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20'}`}
                                >
                                    {resp.savedAsStory ? <Check className="w-3 h-3" /> : <BookmarkPlus className="w-3 h-3" />}
                                    {resp.savedAsStory ? 'Saved for future applications' : 'Save this story for future applications'}
                                </button>
                            )}
                            {resp.analysis.betterVersion && (
                                <div className="text-xs text-neutral-500 dark:text-neutral-500 pt-2 border-t border-indigo-200 dark:border-indigo-800/30">
                                    <strong>Better:</strong> "{resp.analysis.betterVersion}"
                                </div>
                            )}

                            {/* Resume Suggestions */}
                            {resp.analysis.resumeSuggestions && resp.analysis.resumeSuggestions.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-indigo-200 dark:border-indigo-800/30 space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500">
                                        <FileText className="w-3 h-3" />
                                        <span>Resume Suggestions Based on your Answer</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {resp.analysis.resumeSuggestions.map((suggestion: ResumeSuggestionItem, sIdx: number) => {
                                            const isBanked = resumes[0]?.suggestedUpdates?.some((u) => u.suggestion === suggestion.suggestion);

                                            return (
                                                <div key={sIdx} className="bg-white dark:bg-neutral-900/50 rounded-lg p-2 border border-indigo-100 dark:border-indigo-500/10 group/suggest">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[11px] font-bold text-neutral-900 dark:text-neutral-200">{suggestion.suggestion}</span>
                                                            </div>
                                                            <p className="text-[10px] text-neutral-500 leading-relaxed italic">{suggestion.impact}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <button
                                                                onClick={() => onBankSuggestion(suggestion)}
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
    }, [questions, currentQuestionIndex, responses, mode, resumes, copiedText, resumeSnippets, onBankSuggestion, onSaveStory, sessionType, selectedJobId, jobs, onJobSelected, isSessionLoading, showStarHelp, hasStartedInterview, starExample]);

    if (mode === 'session') {
        const isInitialJobSelection = sessionType === 'tailored' && !selectedJobId;
        const shouldDisableInput = !isInitialJobSelection && (!hasStartedInterview && Object.keys(responses).length === 0 && currentQuestionIndex === 0 || showStarHelp);

        // Safety check: ensure questions exist, unless we're in the initial job selection phase
        if (!isInitialJobSelection && (!questions || questions.length === 0)) {
            return (
                <div className="min-h-screen bg-neutral-50 dark:bg-black flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
                </div>
            );
        }

        const currentQ = questions?.[currentQuestionIndex];
        const hasResponse = currentQ && !!responses[currentQ.id];

        let placeholder = 'Type your answer...';
        let inputHint = 'Press Enter to Submit';
        
        if (isInitialJobSelection) {
            placeholder = "Pick a job or type its name...";
            inputHint = "Press Enter to Select Job";
        } else if (shouldDisableInput) {
            placeholder = 'Choose an option above to continue...';
            inputHint = 'Select an option above';
        } else if (hasResponse) {
            placeholder = 'Waiting for next question...';
            inputHint = isLastQuestion ? 'Interview Complete' : 'Press Enter for Next Question';
        }

        return (
            <div className="h-screen w-full flex flex-col items-center bg-neutral-50/50 dark:bg-black overflow-hidden">
                <div className="w-full max-w-4xl flex-1 min-h-0 flex flex-col pt-16">
                    <InterviewChat
                        messages={chatMessages}
                        inputValue={userResponse}
                        onInputChange={setUserResponse}
                        onSubmit={handleSubmit}
                        isThinking={isLoading}
                        placeholder={placeholder}
                        inputHint={inputHint}
                        showNextButton={hasResponse && !isLastQuestion}
                        onNext={nextQuestion}
                        inputDisabled={(!!currentQ && hasResponse) || isLoading || shouldDisableInput}
                        accentGradient="from-indigo-500 to-violet-500"
                    />
                </div>
            </div>
        );
    }

    return null;
};
