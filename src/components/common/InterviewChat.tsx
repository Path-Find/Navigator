import React, { useRef, useEffect } from 'react';
import { Send, Sparkles, User, ArrowRight } from 'lucide-react';
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
    inputDisabled?: boolean;
    accentGradient?: string;
}

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
    inputDisabled = false,
    accentGradient = "from-indigo-600 to-violet-600"
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isThinking]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (inputValue.trim() && !inputDisabled) {
                onSubmit();
            }
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto rounded-[2.5rem] bg-white/40 dark:bg-neutral-900/40 backdrop-blur-xl border border-white/20 dark:border-neutral-800 shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/10 dark:border-neutral-800 flex items-center justify-between bg-white/20 dark:bg-neutral-950/20">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${accentGradient} flex items-center justify-center shadow-lg shadow-indigo-500/20 transform -rotate-6`}>
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-neutral-900 dark:text-white tracking-tight">AI Interview Advisor</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] uppercase tracking-widest font-black text-emerald-500/80">Active Session</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth custom-scrollbar"
            >
                {messages.length === 0 && !isThinking && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                        <MessageSquare className="w-12 h-12 mb-4" />
                        <p className="font-bold text-sm uppercase tracking-widest text-neutral-400">Waiting for first question...</p>
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
                            <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center shadow-md ${msg.role === 'ai'
                                    ? `bg-gradient-to-br ${accentGradient} text-white`
                                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                                    }`}>
                                    {msg.role === 'ai' ? <Sparkles className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                </div>
                                <div className="space-y-2">
                                    <div className={`rounded-2xl px-6 py-4 shadow-sm relative overflow-hidden ${msg.role === 'ai'
                                        ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-tl-none border border-neutral-100 dark:border-neutral-700'
                                        : `bg-gradient-to-br ${accentGradient} text-white rounded-tr-none shadow-lg shadow-indigo-500/10`
                                        }`}>
                                        <p className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    </div>

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
                                                <span className="text-[10px] uppercase tracking-widest font-black text-orange-500">Coach Insight</span>
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
                                                    <span className="text-[9px] uppercase tracking-widest font-black text-neutral-400 dark:text-neutral-500">{key}</span>
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
                        <div className="flex gap-4">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentGradient} text-white flex items-center justify-center animate-pulse`}>
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="bg-white dark:bg-neutral-800 p-4 rounded-2xl rounded-tl-none border border-neutral-100 dark:border-neutral-700 shadow-sm flex items-center gap-2">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce" />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400 ml-2">Advisor is thinking...</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-8 bg-white/30 dark:bg-neutral-950/30 border-t border-white/10 dark:border-neutral-800">
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-violet-500/5 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative flex flex-col gap-4">
                        <div className="relative">
                            <textarea
                                value={inputValue}
                                onChange={(e) => onInputChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={inputDisabled}
                                placeholder={placeholder}
                                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-[2rem] p-6 pr-24 text-neutral-900 dark:text-white font-medium placeholder:text-neutral-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all resize-none shadow-sm min-h-[140px] leading-relaxed"
                            />

                            <div className="absolute right-4 bottom-4 flex items-center gap-3">
                                {inputValue.length > 0 && (
                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                        {inputValue.length} characters
                                    </span>
                                )}
                                <button
                                    onClick={onSubmit}
                                    disabled={!inputValue.trim() || inputDisabled}
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-xl disabled:opacity-30 disabled:shadow-none hover:scale-110 active:scale-95 bg-gradient-to-r ${accentGradient} text-white shadow-indigo-500/20`}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] uppercase font-black tracking-widest text-neutral-400/80">{inputHint}</span>
                            </div>

                            {showNextButton && (
                                <motion.button
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={onNext}
                                    className={`flex items-center gap-2 px-6 py-2 bg-gradient-to-r ${accentGradient} text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all`}
                                >
                                    <span>Next Question</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MessageSquare = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);
