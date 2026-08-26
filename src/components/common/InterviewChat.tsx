import React, { useRef, useEffect } from 'react';
import { Send, Sparkles, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ChatMessage {
    id: string;
    role: 'ai' | 'user';
    content: string;
    timestamp?: number;
    metrics?: {
        clarity?: number;
        impact?: number;
        confidence?: number;
    };
    feedback?: string;
    metadata?: React.ReactNode;
    suggestionPills?: {
        id: string;
        label: string;
        sublabel?: string;
        onClick: () => void;
        variant?: 'action' | 'suggestion';
    }[];
    isThinking?: boolean;
}

interface InterviewChatProps {
    messages: ChatMessage[];
    inputValue: string;
    onInputChange: (val: string) => void;
    onSubmit: () => void;
    isThinking?: boolean;
    placeholder?: string;
    inputHint?: string;
    showNextButton?: boolean;
    onNext?: () => void;
    secondaryAction?: {
        label: string;
        onClick: () => void;
        disabled?: boolean;
        completed?: boolean;
    };
    completionMessage?: string;
    completionSummary?: React.ReactNode;
    inputDisabled?: boolean;
    accentGradient?: string;
    hideInput?: boolean;
}

const MAX_INTERVIEW_ANSWER_LENGTH = 12_000;

export const InterviewChat: React.FC<InterviewChatProps> = ({
    messages,
    inputValue,
    onInputChange,
    onSubmit,
    isThinking = false,
    placeholder = "Type your response...",
    inputHint = "Press Enter to Submit",
    showNextButton = false,
    onNext,
    secondaryAction,
    completionMessage,
    completionSummary,
    inputDisabled = false,
    accentGradient = "from-neutral-700 to-neutral-500",
    hideInput = false
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Robust auto-scroll using ResizeObserver to handle content popping in (e.g. results/images)
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const observer = new ResizeObserver(() => {
            container.scrollTop = container.scrollHeight;
        });

        // Observe the child area where messages live
        const messageArea = container.firstElementChild;
        if (messageArea) {
            observer.observe(messageArea);
        }

        return () => observer.disconnect();
    }, []);

    // Also trigger on manual message changes to be safe
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages.length, isThinking]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (inputValue.trim() && !inputDisabled) {
                onSubmit();
            }
        }
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 w-full max-w-4xl mx-auto overflow-hidden">
            {/* Message Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-8 space-y-6 scroll-smooth custom-scrollbar"
            >
                {messages.length === 0 && !isThinking && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <MessageSquare className="w-12 h-12 mb-4" />
                        <p className="font-bold text-sm tracking-widest text-neutral-400">Waiting for first question...</p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center shadow-md ${msg.role === 'ai'
                                    ? `bg-gradient-to-br ${accentGradient} text-white`
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                                    }`}>
                                    {msg.role === 'ai' ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                </div>
                                <div className="space-y-3">
                                    <div className={`rounded-2xl px-4 py-3 shadow-sm relative overflow-hidden ${msg.role === 'ai'
                                        ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-tl-none border border-neutral-100 dark:border-neutral-700'
                                        : `bg-gradient-to-br ${accentGradient} text-white rounded-tr-none shadow-lg shadow-neutral-500/10`
                                        }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    </div>

                                    {/* Suggestion Pills */}
                                    {msg.suggestionPills && (
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {msg.suggestionPills.map((pill) => (
                                                <button
                                                    key={pill.id}
                                                    onClick={pill.onClick}
                                                    className={pill.variant === 'action'
                                                        ? `flex flex-col items-start px-5 py-3 rounded-2xl border shadow-sm transition-all group ${pill.id === 'continue-interview'
                                                            ? 'bg-neutral-600 border-neutral-600 text-white hover:bg-neutral-700'
                                                            : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:border-neutral-500'}`
                                                        : 'flex flex-col items-start px-3.5 py-1.5 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm transition-all group'}
                                                >
                                                    <span className={`font-bold group-hover:text-neutral-600 dark:group-hover:text-neutral-400 ${pill.variant === 'action' ? 'text-sm' : 'text-[11px]'} ${pill.id === 'continue-interview' ? 'text-white group-hover:text-white' : 'text-neutral-700 dark:text-neutral-200'}`}>
                                                        {pill.label}
                                                    </span>
                                                    {pill.sublabel && (
                                                        <span className={`text-[9px] ${pill.id === 'continue-interview' ? 'text-neutral-100' : 'text-neutral-400 dark:text-neutral-500'}`}>
                                                            {pill.sublabel}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Render optional metadata/extra content */}
                                    {msg.metadata}

                                    {/* Feedback for AI messages that contain evaluation */}
                                    {msg.feedback && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-3 p-4 bg-orange-500/5 dark:bg-orange-400/5 border border-orange-500/20 rounded-2xl"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                                                <span className="text-[10px] tracking-widest font-black text-orange-500">Coach Insight</span>
                                            </div>
                                            <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                                                "{msg.feedback}"
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* Evaluation Metrics */}
                                    {msg.metrics && msg.role === 'ai' && (
                                        <div className="flex gap-2 mt-2">
                                            {Object.entries(msg.metrics).map(([key, val]) => (
                                                <div key={key} className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800/50 rounded-full flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700">
                                                    <span className="text-[9px] tracking-widest font-black text-neutral-400 dark:text-neutral-500">{key}</span>
                                                    <span className="text-[10px] font-black text-neutral-700 dark:text-neutral-200">{val}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isThinking && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                    >
                        <div className="flex gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${accentGradient} text-white flex items-center justify-center animate-pulse`}>
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="bg-white dark:bg-neutral-800 p-3 rounded-xl rounded-tl-none border border-neutral-100 dark:border-neutral-700 shadow-sm flex items-center">
                                <div className="flex gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {(showNextButton || secondaryAction) && (
                    <div className="flex justify-end pt-2">
                        {secondaryAction && (
                            <motion.button
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={secondaryAction.onClick}
                                disabled={secondaryAction.disabled}
                                className={`mr-2 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-black tracking-wide border transition-all ${secondaryAction.completed
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-700 dark:hover:bg-neutral-800'}`}
                            >
                                <span>{secondaryAction.label}</span>
                            </motion.button>
                        )}
                        {showNextButton && (
                        <motion.button
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={onNext}
                            className="flex items-center gap-2 px-6 py-2.5 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full text-xs font-black tracking-widest shadow-lg shadow-neutral-500/20 active:scale-95 transition-all"
                        >
                            <span>Next Question</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </motion.button>
                        )}
                    </div>
                )}
                {completionMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300"
                    >
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>{completionMessage}</span>
                    </motion.div>
                )}
                {completionSummary}
            </div>

            {/* Input Area */}
            {!hideInput && (
                <div className="px-4 pb-6 pt-2 bg-transparent">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-neutral-500/5 to-neutral-500/5 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <div className="relative flex flex-col gap-4">
                            <div className="relative">
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => onInputChange(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={inputDisabled}
                                    placeholder={placeholder}
                                    maxLength={MAX_INTERVIEW_ANSWER_LENGTH}
                                    className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-3xl p-4 pr-20 text-sm text-neutral-900 dark:text-white font-medium placeholder:text-neutral-400 focus:ring-4 focus:ring-neutral-500/10 focus:border-neutral-500/30 disabled:opacity-50 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 transition-all shadow-sm min-h-[80px] leading-relaxed"
                                />

                                <div className="absolute right-2.5 bottom-2.5 flex items-center gap-3">
                                    <button
                                        onClick={onSubmit}
                                        disabled={!inputValue.trim() || inputDisabled}
                                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30 bg-neutral-600 hover:bg-neutral-700 text-white shadow-lg shadow-neutral-500/20 active:scale-95"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-6 mt-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-neutral-400/80 tracking-tight">{inputHint}</span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MessageSquare = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);
