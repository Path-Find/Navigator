import { SkillInterviewIntro } from './components/SkillInterviewIntro';
import { SkillInterviewSession } from './components/SkillInterviewSession';
import { SkillInterviewSummary } from './components/SkillInterviewSummary';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router';
import type { CustomSkill } from '../../types';
import { generateUnifiedQuestion, analyzeUnifiedResponse } from '../../services/geminiService';
import { useSkillContext } from './context/SkillContext';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { checkInterviewLimit, getUsageStats } from '../../services/usageLimits';
import { authClient } from '../../lib/auth-client';
import { useToast } from '../../contexts/ToastContext';
import { useUser } from '../../contexts/UserContext';
import { ROUTES } from '../../constants';

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

const MAX_SKILLS_PER_SESSION = 5;
const MAX_QUESTIONS_PER_SESSION = 6;

export const SkillInterviewPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { handleInterviewComplete } = useSkillContext();
    const { showInfo } = useToast();
    const { isAdmin, isLoading: isUserLoading } = useUser();

    // Accept array of skills from router state, enforced cap for quality
    const locationSkills = location.state?.skills as { name: string; proficiency: string }[] | undefined;
    const skills = React.useMemo(() => locationSkills ?? [], [locationSkills]);
    const [selectedSkillNames, setSelectedSkillNames] = useState<string[]>(() => skills.slice(0, MAX_SKILLS_PER_SESSION).map(skill => skill.name));
    const selectedSkills = React.useMemo(() => skills.filter(skill => selectedSkillNames.includes(skill.name)), [skills, selectedSkillNames]);

    const [step, setStep] = useState<InterviewStep>('intro');
    const [isLoading, setIsLoading] = useState(false);

    // Interview state
    const [questions, setQuestions] = useState<UnifiedQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [messages, setMessages] = useState<InterviewMessage[]>([]);
    const [interviewHistory, setInterviewHistory] = useState<{ question: string; answer: string }[]>([]);
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
                const { data: { user } } = await authClient.getUser();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (skills.length === 0) {

            navigate('/career/skills');
        }
    }, [skills.length, navigate]);



    const handleStart = async () => {
        if (selectedSkills.length === 0) return;
        setIsLoading(true);
        setLimitError(null);

        try {
            const { data: { user } } = await authClient.getUser();
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

            const firstQuestion = await generateUnifiedQuestion(selectedSkills);
            setQuestions([firstQuestion]);
            setStep('interview');

            // Initialize skill scores
            const initialScores: Record<string, { demonstrated: number; total: number }> = {};
            selectedSkills.forEach(s => { initialScores[s.name] = { demonstrated: 0, total: 0 }; });
            setSkillScores(initialScores);

            // Add a short greeting, then reveal the first question.
            setMessages([
                { role: 'ai', content: "Great, let's get started. I'll ask one practical question at a time, give you feedback after each answer, and adapt the next question to what you tell me." },
            ]);
            setInterviewHistory([]);

            setTimeout(() => {
                setMessages(prev => [...prev, { role: 'ai', content: firstQuestion.question }]);
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
        const updatedHistory = [...interviewHistory, { question: currentQ.question, answer }];
        setInterviewHistory(updatedHistory);

        setMessages(prev => [...prev, { role: 'user', content: answer }]);

        try {
            const analysis = await analyzeUnifiedResponse(
                currentQ.question,
                currentQ.targetSkills,
                answer,
                {
                    selectedSkills: selectedSkills.map(skill => skill.name),
                    history: updatedHistory,
                    questionNumber: currentQuestionIndex + 1,
                    maxQuestions: MAX_QUESTIONS_PER_SESSION,
                },
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

            // The analysis response decides whether there is another question.
            if (analysis.shouldContinue && analysis.nextQuestion && currentQuestionIndex < MAX_QUESTIONS_PER_SESSION - 1) {
                const nextIdx = currentQuestionIndex + 1;
                const nextQuestion = {
                    question: analysis.nextQuestion,
                    targetSkills: analysis.nextTargetSkills,
                };
                setQuestions(prev => [...prev, nextQuestion]);
                setCurrentQuestionIndex(nextIdx);
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'ai', content: nextQuestion.question }]);
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
            setInterviewHistory(previous => previous.slice(0, -1));
            setUserAnswer(answer);
            setMessages(prev => [...prev, { role: 'ai', content: "I couldn't analyze that response. Please try submitting it again." }]);
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

    if (isUserLoading) return null;
    if (!isAdmin) return <Navigate to={ROUTES.FEATURES} replace />;
    if (skills.length === 0) return null;

    const verifiedSkills = step === 'summary' ? getVerifiedSkills() : [];
    const verifiedCount = verifiedSkills.length;

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] animate-in fade-in duration-500">
            {/* Main Content */}
            <div className="pt-24 min-h-screen flex flex-col relative overflow-hidden bg-neutral-50/50 dark:bg-black/50">
                <div className="fixed top-20 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="fixed bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 relative z-10 flex flex-col transition-all duration-500">
                    {step === 'intro' && (
                        <SkillInterviewIntro
                            isLoading={isLoading}
                            limitError={limitError}
                            usageInfo={usageInfo}
                            handleStart={handleStart}
                            skills={skills}
                            selectedSkillNames={selectedSkillNames}
                            onToggleSkill={(skillName: string) => setSelectedSkillNames(current => current.includes(skillName)
                                ? current.filter(name => name !== skillName)
                                : current.length < MAX_SKILLS_PER_SESSION ? [...current, skillName] : current)}
                            maxSelected={MAX_SKILLS_PER_SESSION}
                            MAX_SKILLS_PER_SESSION={MAX_SKILLS_PER_SESSION}
                        />
                    )}
                    {step === 'interview' && (
                        <SkillInterviewSession
                            messages={messages}
                            userAnswer={userAnswer}
                            setUserAnswer={setUserAnswer}
                            handleSubmitAnswer={handleSubmitAnswer}
                            isAnalyzing={isAnalyzing}
                            currentQuestionIndex={currentQuestionIndex}
                        />
                    )}
                    {step === 'summary' && (
                        <SkillInterviewSummary
                            verifiedCount={verifiedCount}
                            skills={selectedSkills}
                            skillScores={skillScores}
                            verifiedSkills={verifiedSkills}
                            handleClose={handleClose}
                            handleFinish={handleFinish}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
