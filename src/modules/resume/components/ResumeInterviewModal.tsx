import React, { useState, useCallback } from 'react';
import { X, CheckCircle2, Loader2, BookOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InterviewChat } from '../../../components/common/InterviewChat';
import type { ChatMessage } from '../../../components/common/InterviewChat';
import {
    generateResumeInterviewQuestions,
    summarizeResumeInterview,
    type ResumeInterviewQA
} from '../../../services/ai/interviewAiService';
import { checkInterviewLimit } from '../../../services/usageLimits';
import { supabase } from '../../../services/supabase';
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
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const limit = await checkInterviewLimit(user.id);
                    if (!limit.allowed) {
                        setPhase('blocked');
                        return;
                    }
                }

                const qs = await generateResumeInterviewQuestions(
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-100 dark:border-neutral-800 flex flex-col overflow-hidden"
                style={{ height: '600px' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-neutral-900 dark:text-white tracking-tight">{block.title}</p>
                            <p className="text-[10px] font-bold text-neutral-400">{block.organization}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress bar */}
                {phase !== 'loading' && questions.length > 0 && (
                    <div className="h-1 bg-neutral-100 dark:bg-neutral-800 shrink-0">
                        <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500"
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
                                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-neutral-900 dark:text-white mb-1">Resume Interview is a Pro feature</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">Upgrade to capture the story behind your experience and get stronger cover letters.</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black transition-all"
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
                                    accentGradient="from-indigo-600 to-violet-600"
                                />

                                {phase === 'done' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="px-6 pb-6 shrink-0 space-y-3"
                                    >
                                        {savedContext && (
                                            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl">
                                                <p className="text-[10px] font-black text-indigo-500 tracking-widest mb-2">SAVED STORY</p>
                                                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">{savedContext}</p>
                                            </div>
                                        )}
                                        <button
                                            onClick={onClose}
                                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2"
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
            </motion.div>
        </div>
    );
};
