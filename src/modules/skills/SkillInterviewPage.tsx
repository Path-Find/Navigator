import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { CustomSkill } from '../../types';
import { generateUnifiedQuestions, analyzeUnifiedResponse } from '../../services/geminiService';
import { useSkillContext } from './context/SkillContext';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { checkInterviewLimit, getUsageStats } from '../../services/usageLimits';
import { supabase } from '../../services/supabase';
import {
    CheckCircle2, X,
    Sparkles, AlertCircle,
    Check
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '../../constants';
import { InterviewChat } from '../../components/common/InterviewChat';
import type { ChatMessage } from '../../components/common/InterviewChat';

type InterviewStep = 'intro' | 'interview' | 'summary';

interface UnifiedQuestion {
    question: string;
    targetSkills: string[];
}

interface InterviewMessage {
    role: 'ai' | 'user';
    content: string;
    overallPassed?: boolean;
    skillResults?: { skill: string; demonstrated: boolean; note: string }[];
}

const MAX_SKILLS_PER_SESSION = 8;

export const SkillInterviewPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { handleInterviewComplete } = useSkillContext();
    const { showInfo } = useToast();

    // Accept array of skills from router state, enforced cap for quality
    const rawSkills = (location.state?.skills as { name: string; proficiency: string }[]) || [];
    const skills = React.useMemo(() => rawSkills.slice(0, MAX_SKILLS_PER_SESSION), [rawSkills]);
    const isCapped = rawSkills.length > MAX_SKILLS_PER_SESSION;

    const [step, setStep] = useState<InterviewStep>('intro');
    const [isLoading, setIsLoading] = useState(false);

    // Interview state
    const [questions, setQuestions] = useState<UnifiedQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [messages, setMessages] = useState<InterviewMessage[]>([]);
    const [limitError, setLimitError] = useState<string | null>(null);
    const [usageInfo, setUsageInfo] = useState<{ used: number; total: number } | null>(null);

    // Track which skills have been demonstrated across all answers
    const [skillScores, setSkillScores] = useState<Record<string, { demonstrated: number; total: number }>>({});

    const { setFocusedMode } = useGlobalUI();

    useEffect(() => {
        setFocusedMode(true);
        return () => setFocusedMode(false);
    }, [setFocusedMode]);

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const stats = await getUsageStats(user.id);
                if (stats.isFallback) {
                    showInfo("Unable to verify assessment credits. You may be unable to start new sessions.");
                }
                setUsageInfo({ used: stats.monthInterviews, total: stats.interviewLimit });
            } catch (err) {
                console.error('Failed to fetch usage:', err);
            }
        };
        fetchUsage();
    }, []);

    useEffect(() => {
        if (skills.length === 0) {

            navigate('/career/skills');
        }
    }, [skills.length, navigate]);



    const handleStart = async () => {
        setIsLoading(true);
        setLimitError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/');
                return;
            }

            const limit = await checkInterviewLimit(user.id);
            if (!limit.allowed) {
                setLimitError(`Monthly assessment limit reached (${limit.used}/${limit.limit}). Upgrade for more sessions.`);
                setIsLoading(false);
                return;
            }

            const qs = await generateUnifiedQuestions(skills);
            setQuestions(qs);
            setStep('interview');

            // Initialize skill scores
            const initialScores: Record<string, { demonstrated: number; total: number }> = {};
            skills.forEach(s => { initialScores[s.name] = { demonstrated: 0, total: 0 }; });
            setSkillScores(initialScores);

            // Add greeting + first question
            setMessages([
                { role: 'ai', content: `Great, let's get started! I'll ask you ${qs.length} questions that cover your skills. Answer naturally — each question may touch on multiple skills at once.` },
            ]);

            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'ai', content: qs[0].question }]);
            }, 800);
        } catch (error) {
            console.error('Failed to generate questions:', error);
            setMessages([{ role: 'ai', content: "Unable to generate questions at this time. Please refresh and try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!userAnswer.trim() || isAnalyzing) return;

        const currentQ = questions[currentQuestionIndex];
        const answer = userAnswer;
        setUserAnswer('');
        setIsAnalyzing(true);

        setMessages(prev => [...prev, { role: 'user', content: answer }]);

        try {
            const analysis = await analyzeUnifiedResponse(
                currentQ.question,
                currentQ.targetSkills,
                answer
            );

            // Update skill scores
            let updatedScores: Record<string, { demonstrated: number; total: number }> = {};
            setSkillScores(prev => {
                const updated = { ...prev };
                analysis.skillResults.forEach(r => {
                    if (updated[r.skill]) {
                        updated[r.skill] = {
                            demonstrated: updated[r.skill].demonstrated + (r.demonstrated ? 1 : 0),
                            total: updated[r.skill].total + 1,
                        };
                    }
                });
                updatedScores = updated;
                return updated;
            });

            // Add AI feedback
            setMessages(prev => [...prev, {
                role: 'ai',
                content: analysis.feedback,
                overallPassed: analysis.overallPassed,
                skillResults: analysis.skillResults,
            }]);

            // Live Persistence: Save skills that are currently verified
            analysis.skillResults.forEach(r => {
                const score = updatedScores[r.skill];
                // Require at least 3 questions for a skill to be "Auto-verified" mid-session
                // This ensures we have a representative sample before saving.
                if (score && score.total >= 3 && (score.demonstrated / score.total) >= 0.5) {
                    const evidence = `Verified via unified AI interview. Demonstrated in ${score.demonstrated}/${score.total} questions.`;
                    const skill = skills.find(s => s.name === r.skill);
                    const proficiency = (skill?.proficiency || 'learning') as CustomSkill['proficiency'];
                    handleInterviewComplete(proficiency, evidence, r.skill);
                }
            });

            // Next question or finish
            if (currentQuestionIndex < questions.length - 1) {
                const nextIdx = currentQuestionIndex + 1;
                setCurrentQuestionIndex(nextIdx);
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'ai', content: questions[nextIdx].question }]);
                    setIsAnalyzing(false);
                }, 1200);
            } else {
                setTimeout(() => {
                    setStep('summary');
                    setIsAnalyzing(false);
                }, 1200);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            setIsAnalyzing(false);
            if (currentQuestionIndex < questions.length - 1) {
                const nextIdx = currentQuestionIndex + 1;
                setCurrentQuestionIndex(nextIdx);
                setMessages(prev => [...prev,
                { role: 'ai', content: "I couldn't analyze that response, but let's continue." },
                { role: 'ai', content: questions[nextIdx].question }
                ]);
            } else {
                setStep('summary');
            }
        }
    };


    const getVerifiedSkills = () => {
        return Object.entries(skillScores)
            .filter(([, score]) => score.total > 0 && (score.demonstrated / score.total) >= 0.5)
            .map(([name]) => name);
    };

    const handleFinish = async () => {
        const verified = getVerifiedSkills();

        // Batch update all verified skills
        for (const skillName of verified) {
            const score = skillScores[skillName];
            const evidence = `Verified via unified AI interview. Demonstrated in ${score.demonstrated}/${score.total} questions.`;
            const skill = skills.find(s => s.name === skillName);
            const proficiency = (skill?.proficiency || 'learning') as CustomSkill['proficiency'];
            await handleInterviewComplete(proficiency, evidence, skillName);
        }

        navigate('/career/skills');
    };

    const handleClose = () => navigate('/career/skills');

    if (skills.length === 0) return null;

    const verifiedSkills = step === 'summary' ? getVerifiedSkills() : [];
    const verifiedCount = verifiedSkills.length;

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] animate-in fade-in duration-500">
            {/* Main Content */}
            <div className="pt-24 min-h-screen flex flex-col relative overflow-hidden bg-neutral-50/50 dark:bg-black/50">
                <div className="fixed top-20 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="fixed bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className={`flex-1 w-full ${step === 'intro' ? 'max-w-5xl' : 'max-w-3xl'} mx-auto px-4 py-8 relative z-10 flex flex-col transition-all duration-500`}>
                    <AnimatePresence mode="wait">
                        {step === 'intro' && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="flex-1 flex flex-col justify-center pb-20"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
                                    {/* Left: Content */}
                                    <div className="space-y-8">
                                        <div>
                                            <h4 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight">
                                                Ready to verify your skills?
                                            </h4>
                                            <p className="text-lg lg:text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                                                I'll ask cross-cutting questions that cover multiple skills at once. Answer naturally — no need to treat each skill separately.
                                            </p>
                                        </div>

                                        {limitError && (
                                            <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-2xl flex items-center gap-3 text-orange-700 dark:text-orange-400 text-sm font-bold">
                                                <AlertCircle className="w-5 h-5 shrink-0" />
                                                <div className="flex-1">
                                                    <p>{limitError}</p>
                                                </div>
                                                <button
                                                    onClick={() => navigate(ROUTES.PLANS)}
                                                    className="px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shrink-0"
                                                >
                                                    Upgrade
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleStart}
                                            disabled={isLoading || !!limitError}
                                            className="w-full md:w-auto px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 flex flex-col items-center gap-1 disabled:opacity-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                {isLoading ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-5 h-5" />
                                                )}
                                                <span>{isLoading ? 'Preparing questions...' : 'Begin assessment'}</span>
                                            </div>
                                            {!isLoading && !limitError && usageInfo && (
                                                <span className="text-[10px] opacity-70 uppercase tracking-widest font-bold">
                                                    {usageInfo.total === Infinity
                                                        ? 'Unlimited credits'
                                                        : `${usageInfo.used} / ${usageInfo.total} credits used`}
                                                </span>
                                            )}
                                        </button>
                                    </div>

                                    {/* Right: Skills list */}
                                    <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-8 lg:p-10 rounded-[2.5rem] shadow-sm overflow-hidden relative group">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                            <Sparkles className="w-24 h-24 text-emerald-500" />
                                        </div>

                                        <div className="flex items-center justify-between mb-8">
                                            <div className="space-y-1">
                                                <div className="text-sm font-bold text-neutral-400 tracking-widest uppercase">
                                                    Skills to verify
                                                </div>
                                                {isCapped && (
                                                    <div className="text-[10px] text-amber-600 dark:text-amber-500 font-extrabold uppercase tracking-tight">
                                                        Capped at {MAX_SKILLS_PER_SESSION} for quality focus
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                                                {skills.length} items
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2.5">
                                            {[...skills].sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                                                <span
                                                    key={s.name}
                                                    className="px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-2xl text-sm font-semibold text-neutral-700 dark:text-neutral-300 shadow-sm"
                                                >
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 'interview' && (
                            <motion.div
                                key="interview"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 flex flex-col"
                            >
                                <InterviewChat
                                    messages={messages.map((msg, idx): ChatMessage => ({
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
                                                    {msg.skillResults.map(r => (
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
                        )}

                        {/* SUMMARY */}
                        {step === 'summary' && (
                            <motion.div
                                key="summary"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
                            >
                                <div className="relative mb-10">
                                    <div className={`absolute inset-0 ${verifiedCount > 0 ? 'bg-emerald-500' : 'bg-amber-500'} blur-[80px] opacity-20 rounded-full`} />
                                    <div className={`relative w-36 h-36 rounded-[3rem] ${verifiedCount > 0 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-amber-400 to-amber-600'} flex items-center justify-center shadow-2xl`}>
                                        <Sparkles className="w-16 h-16 text-white" />
                                    </div>
                                </div>

                                <h4 className="text-4xl font-bold text-neutral-900 dark:text-white mb-3 tracking-tight">
                                    {verifiedCount > 0 ? 'Mastery Achieved' : 'Practice Session Over'}
                                </h4>
                                <p className="text-lg text-neutral-500 dark:text-neutral-400 font-medium mb-10 max-w-lg">
                                    {verifiedCount > 0
                                        ? `You've successfully banked ${verifiedCount} skill${verifiedCount !== 1 ? 's' : ''} in your profile.`
                                        : `You didn't hit the verification threshold this time. Your progress was saved, but these skills need more proof.`
                                    }
                                </p>

                                {/* Skill results grid */}
                                <div className="w-full max-w-md mb-10 space-y-2">
                                    {skills.map(s => {
                                        const score = skillScores[s.name];
                                        const verified = verifiedSkills.includes(s.name);
                                        return (
                                            <div
                                                key={s.name}
                                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${verified
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                                    : 'bg-neutral-50 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${verified
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400'
                                                        }`}>
                                                        {verified ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                    </div>
                                                    <div className="text-left">
                                                        <span className={`font-bold text-sm block ${verified ? 'text-emerald-700 dark:text-emerald-300' : 'text-neutral-500'}`}>
                                                            {s.name}
                                                        </span>
                                                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                                            {verified ? 'Verified & Banked' : 'In Development'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {score && score.total > 0 && (
                                                    <span className="text-xs font-medium text-neutral-400">
                                                        {score.demonstrated}/{score.total}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleClose}
                                        className="px-8 py-4 rounded-2xl font-bold text-base text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
                                    >
                                        Close
                                    </button>
                                    {verifiedCount > 0 && (
                                        <button
                                            onClick={handleFinish}
                                            className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                                        >
                                            Return to Dashboard
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
