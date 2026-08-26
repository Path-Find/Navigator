import React, { useState, useCallback } from 'react';
import { X, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InterviewChat } from '../../../components/common/InterviewChat';
import type { ChatMessage } from '../../../components/common/InterviewChat';
import {
    generateResumeInterviewQuestions,
    summarizeResumeInterview,
    type ResumeInterviewQA
} from '../../../services/ai/interviewAiService';
import { checkInterviewLimit } from '../../../services/usageLimits';
import { authClient } from '../../../lib/auth-client';
import type { ExperienceBlock } from '../types';

interface ResumeInterviewModalProps {
    block: ExperienceBlock;
    onSave: (narrativeContext: string) => void;
    onClose: () => void;
}

type Phase = 'loading' | 'blocked' | 'interviewing' | 'saving' | 'done';

export const ResumeInterviewModal: React.FC<ResumeInterviewModalProps> = ({ block, onSave, onClose }) => {
    const [phase, setPhase] = useState<Phase>('loading');
    const [questions, setQuestions] = useState<string[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [qaPairs, setQaPairs] = useState<ResumeInterviewQA[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [savedContext, setSavedContext] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Load questions on mount
    React.useEffect(() => {
        const load = async () => {
            try {
                const { data: { user } } = await authClient.getUser();
                if (user) {
                    const limit = await checkInterviewLimit(user.id);
                    if (!limit.allowed) {
                        setPhase('blocked');
                        return;
                    }
                }

                const qs = await generateResumeInterviewQuestions(
                    block.type,
                    block.title,
                    block.organization,
                    block.bullets.filter(b => b.trim())
                );
                setQuestions(qs);
                setMessages([
                    {
                        id: 'intro',
                        role: 'ai',
                        content: `Let's capture the story behind your time at ${block.organization}. I'll ask you a few questions — just answer in your own words, as much detail as you like.`,
                    },
                    {
                        id: 'q0',
                        role: 'ai',
                        content: qs[0],
                    }
                ]);
                setPhase('interviewing');
            } catch {
                setError('Failed to generate questions. Please try again.');
                setPhase('interviewing');
            }
        };
        load();
    }, [block.title, block.organization, block.bullets]);

    const handleSubmit = useCallback(async () => {
        if (!inputValue.trim() || isThinking) return;

        const answer = inputValue.trim();
        setInputValue('');

        const userMsg: ChatMessage = {
            id: `user-${currentQ}`,
            role: 'user',
            content: answer,
        };

        const newPairs = [...qaPairs, { question: questions[currentQ], answer }];
        setQaPairs(newPairs);
        setMessages(prev => [...prev, userMsg]);

        const nextQ = currentQ + 1;

        if (nextQ < questions.length) {
            setIsThinking(true);
            setTimeout(() => {
                setIsThinking(false);
                setMessages(prev => [...prev, {
                    id: `q${nextQ}`,
                    role: 'ai',
                    content: questions[nextQ],
                }]);
                setCurrentQ(nextQ);
            }, 600);
        } else {
            // All questions answered — synthesize
            setIsThinking(true);
            setPhase('saving');
            try {
                const context = await summarizeResumeInterview(
                    block.type,
                    block.title,
                    block.organization,
                    block.bullets.filter(b => b.trim()),
                    newPairs
                );
                setSavedContext(context);
                onSave(context);
                setIsThinking(false);
                setMessages(prev => [...prev, {
                    id: 'done',
                    role: 'ai',
                    content: "Got it — I've saved the story behind this experience. It'll be used automatically when generating cover letters.",
                }]);
                setPhase('done');
            } catch {
                setIsThinking(false);
                setError('Failed to save your story. Please try again.');
                setPhase('interviewing');
            }
        }
    }, [inputValue, isThinking, currentQ, qaPairs, questions, block, onSave]);

    const progressPct = questions.length > 0
        ? Math.round((Math.min(currentQ, questions.length) / questions.length) * 100)
        : 0;

    return (
        <div className="fixed inset-0 z-50 h-screen w-full flex flex-col items-center bg-neutral-50/50 dark:bg-black overflow-hidden">
            <div className="w-full max-w-4xl flex-1 min-h-0 flex flex-col pt-16">
                <div className="flex items-start justify-between gap-4 px-5 pb-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-1">Resume story interview</p>
                        <h1 className="text-2xl font-black text-neutral-900 dark:text-white">{block.title}</h1>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{block.organization}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-2xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-800 transition-colors"
                        aria-label="Close interview"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress bar */}
                {phase !== 'loading' && questions.length > 0 && (
                    <div className="h-1 bg-neutral-100 dark:bg-neutral-800 shrink-0">
                        <motion.div
                            className="h-full bg-gradient-to-r from-neutral-500 to-neutral-500"
                            animate={{ width: `${phase === 'done' ? 100 : progressPct}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 min-h-0 flex flex-col">
                    <AnimatePresence mode="wait">
                        {phase === 'loading' && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 flex items-center justify-center gap-3 text-neutral-400"
                            >
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="text-sm font-bold">Preparing your questions...</span>
                            </motion.div>
                        )}

                        {phase === 'blocked' && (
                            <motion.div
                                key="blocked"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center"
                            >
                                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-900/40 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-neutral-900 dark:text-white mb-1">Resume Interview is a Pro feature</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">Upgrade to capture the story behind your experience and get stronger cover letters.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-neutral-600 hover:bg-neutral-500 text-white rounded-2xl text-xs font-black transition-all"
                                >
                                    Upgrade to Pro
                                </button>
                            </motion.div>
                        )}

                        {(phase === 'interviewing' || phase === 'saving' || phase === 'done') && (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 min-h-0 flex flex-col"
                            >
                                {error && (
                                    <div className="mx-6 mt-4 px-4 py-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-2xl text-sm font-bold text-rose-600 dark:text-rose-400">
                                        {error}
                                    </div>
                                )}

                                <InterviewChat
                                    messages={messages}
                                    inputValue={inputValue}
                                    onInputChange={setInputValue}
                                    onSubmit={handleSubmit}
                                    isThinking={isThinking}
                                    placeholder="Answer in your own words..."
                                    inputHint={phase === 'done' ? '' : `Question ${Math.min(currentQ + 1, questions.length)} of ${questions.length}`}
                                    inputDisabled={phase === 'saving' || phase === 'done'}
                                    hideInput={phase === 'done'}
                        accentGradient="from-neutral-700 to-neutral-500"
                                />

                                {phase === 'done' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="px-6 pb-6 shrink-0 space-y-3"
                                    >
                                        {savedContext && (
                                            <div className="p-4 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-100 dark:border-neutral-800/30 rounded-2xl">
                                                <p className="text-[10px] font-black text-neutral-500 tracking-widest mb-2">SAVED STORY</p>
                                                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">{savedContext}</p>
                                            </div>
                                        )}
                                        <button
                                            onClick={onClose}
                                            className="w-full py-3 bg-neutral-600 hover:bg-neutral-500 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Done
                                        </button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
