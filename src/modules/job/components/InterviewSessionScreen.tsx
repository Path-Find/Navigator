import React, { useState } from 'react';
import { Sparkles, Target, FileText, CheckCircle2, ShieldCheck, Check, Copy, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LoadingState } from '../../../components/common/LoadingState';
import { InterviewChat } from '../../../components/common/InterviewChat';
import type { ChatMessage } from '../../../components/common/InterviewChat';
import { handleBankSuggestion } from '../utils/interviewUtils';

export const InterviewSessionScreen = ({
    questions, currentQuestionIndex, responses, mode, resumes, resumeSnippets, 
    isSessionLoading, isLoading, userResponse, setUserResponse, handleSubmit, 
    nextQuestion, isLastQuestion, handleUpdateResume
}: any) => {
    const [copiedText, setCopiedText] = useState<string | null>(null);

    const onBankSuggestion = React.useCallback(async (suggestion: any) => {
        await handleBankSuggestion(suggestion, resumes, handleUpdateResume);
    }, [resumes, handleUpdateResume]);

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
    }, [questions, currentQuestionIndex, responses, mode, resumes, copiedText, resumeSnippets, onBankSuggestion]);



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



    
};
