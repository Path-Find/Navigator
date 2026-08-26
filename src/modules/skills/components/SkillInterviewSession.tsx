import { CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { InterviewChat } from '../../../components/common/InterviewChat';
import type { ChatMessage } from '../../../components/common/InterviewChat';

export const SkillInterviewSession = ({ messages, userAnswer, setUserAnswer, handleSubmitAnswer, isAnalyzing, currentQuestionIndex, totalQuestions }: any) => {
    return (
        <motion.div
            key="interview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
        >
            <div className="mb-4 flex items-center justify-between text-xs font-bold text-neutral-400">
                <span>Skills interview</span>
                <span>{Math.min(currentQuestionIndex + 1, totalQuestions)} of {totalQuestions}</span>
            </div>
            <InterviewChat
                messages={messages.map((msg: any, idx: number): ChatMessage => ({
                    id: `msg-${idx}`,
                    role: msg.role,
                    content: msg.content,
                    metadata: msg.role === 'ai' && msg.skillResults ? (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800"
                        >
                            <div className="flex flex-wrap gap-2">
                                {msg.skillResults.map((r: any) => (
                                    <span
                                        key={r.skill}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${r.demonstrated
                                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                            }`}
                                        title={r.note}
                                    >
                                        {r.demonstrated
                                            ? <CheckCircle2 className="w-3 h-3" />
                                            : <AlertCircle className="w-3 h-3" />
                                        }
                                        {r.skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ) : undefined,
                }))}
                inputValue={userAnswer}
                onInputChange={setUserAnswer}
                onSubmit={handleSubmitAnswer}
                isThinking={isAnalyzing}
                placeholder="Type your answer here..."
                accentGradient="from-emerald-500 to-teal-500"
                inputDisabled={isAnalyzing}
            />
        </motion.div>
    );
};
