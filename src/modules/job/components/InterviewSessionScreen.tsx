import React, { useState } from 'react';
import { Sparkles, FileText, CheckCircle2, ShieldCheck, Check, Copy, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { InterviewChat } from '../../../components/common/InterviewChat';
import type { ChatMessage } from '../../../components/common/InterviewChat';
import { handleBankSuggestion } from '../utils/interviewUtils';
import type { InterviewQuestion, InterviewResponseAnalysis, SavedJob } from '../types';
import type { ResumeProfile } from '../../resume/types';
import type { CustomSkill } from '../../skills/types';

type ResumeSuggestionItem = NonNullable<InterviewResponseAnalysis['resumeSuggestions']>[number];

const STAR_EXAMPLES = [
    'Our team was missing deadlines (Situation), and I was asked to improve the process (Task). I created a shared tracker and weekly check-ins (Action), which helped us deliver the next project on time (Result).',
    'A customer was frustrated by a delayed request (Situation), and I needed to resolve it while keeping them informed (Task). I mapped the issue, coordinated with the right team, and gave regular updates (Action), and the customer stayed with us (Result).',
    'I noticed new team members were struggling with the same system (Situation), so I took responsibility for making onboarding clearer (Task). I wrote a short guide and paired with each new teammate (Action), which shortened the time it took them to work independently (Result).',
];

type AnswerHelpTopic = 'STAR' | 'ARC';

const getAnswerFramework = (question: InterviewQuestion): { name: 'STAR' | 'ARC'; description: string } => {
    if (question.answerFramework) {
        return question.answerFramework === 'STAR'
            ? { name: 'STAR', description: 'Use a specific situation, your task, the actions you took, and the result.' }
            : { name: 'ARC', description: 'Answer directly, add the relevant context, and connect it to the role or question.' };
    }

    const normalized = question.question.toLowerCase();
    const isExperienceStory = /tell me about a time|describe a time|(?:give|share) (?:me )?(?:a )?specific (?:example|instance)|(?:give|share) (?:me )?an example|walk me through (?:a situation|an example|a specific)|experience where|time you|situation where|obstacle|roadblock|mistake|conflict|de-escalat|mentor(?:ed|ing)?|lead(?:ing)? a team/.test(normalized);

    return isExperienceStory
        ? { name: 'STAR', description: 'Use a specific situation, your task, the actions you took, and the result.' }
        : { name: 'ARC', description: 'Answer directly, add the relevant context, and connect it to the role or question.' };
};

const buildResumeGroundedIntroduction = (resumes: ResumeProfile[], verifiedSkills: CustomSkill[], job?: SavedJob): string | null => {
    const profile = resumes[0];
    if (!profile) return null;

    const blocks = profile.blocks.filter(block => block.isVisible);
    const experience = blocks.find(block => ['work', 'volunteer', 'project'].includes(block.type)) || blocks.find(block => block.type === 'education');
    if (!experience) return null;

    const role = experience.title || 'professional';
    const organization = experience.organization ? ` at ${experience.organization}` : '';
    const strongestBullet = experience.bullets.find(bullet => bullet.trim());
    const otherExperience = blocks
        .filter(block => block.id !== experience.id && ['work', 'volunteer', 'project'].includes(block.type))
        .slice(0, 2)
        .map(block => `${block.title}${block.organization ? ` at ${block.organization}` : ''}`)
        .join(' and ');

    const parts = [`I’m a ${role}${organization}.`];
    if (strongestBullet) {
        const detail = strongestBullet.trim().replace(/[.]$/, '').replace(/^([A-Z])/, (_, letter: string) => letter.toLowerCase());
        const isNonActionBullet = /^(proven|strong|demonstrated|responsible|experience|ability|knowledge|familiar)/i.test(detail);
        parts.push(isNonActionBullet
            ? `My experience includes ${detail}.`
            : `In that role, I ${detail}.`);
    }
    if (otherExperience) parts.push(`My background also includes ${otherExperience}.`);
    const skillNames = verifiedSkills.map(skill => skill.name.trim()).filter(Boolean).slice(0, 3);
    if (skillNames.length > 0) {
        const expertise = skillNames.length === 1
            ? skillNames[0]
            : `${skillNames.slice(0, -1).join(', ')}, and ${skillNames[skillNames.length - 1]}`;
        parts.push(`My expertise includes ${expertise}.`);
    }
    if (job?.position) parts.push(`I’m interested in this ${job.position} opportunity because it builds on that experience.`);
    return parts.join(' ');
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
    verifiedSkills: CustomSkill[];
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
    resumes, verifiedSkills, resumeSnippets, isSessionLoading, isLoading, userResponse, setUserResponse, handleSubmit,
    nextQuestion, isLastQuestion, handleUpdateResume, onSaveStory
}: SessionProps) => {
    const [copiedText, setCopiedText] = useState<string | null>(null);
    const [helpTopics, setHelpTopics] = useState<AnswerHelpTopic[]>([]);
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
            setHasStartedInterview(true);
        };
        const requestHelp = (topic: AnswerHelpTopic) => {
            setHelpTopics(current => current.includes(topic) ? current : [...current, topic]);
        };

        msgs.push({
            id: 'intro-msg',
            role: 'ai',
            content: `${intro}\n\nYou can ask for STAR for experience-based stories or ARC for direct, role-focused answers.`,
            suggestionPills: helpTopics.length === 0 && !interviewHasStarted ? [
                    { id: 'continue-interview', label: 'Continue interview', onClick: continueInterview, variant: 'action' as const },
                    { id: 'star-help', label: "What's STAR?", onClick: () => requestHelp('STAR'), variant: 'action' as const },
                    { id: 'arc-help', label: "What's ARC?", onClick: () => requestHelp('ARC'), variant: 'action' as const },
                ] : undefined,
        });

        helpTopics.forEach(topic => {
            const isStar = topic === 'STAR';
            const otherTopic = isStar ? 'ARC' : 'STAR';
            msgs.push({
                id: `${topic.toLowerCase()}-help`,
                role: 'ai',
                content: isStar
                    ? `STAR is a simple structure for answering experience-based questions:\n\n• Situation — set the context.\n• Task — explain what needed to be done.\n• Action — focus on what you personally did.\n• Result — share what changed or what you learned.\n\nExample: “${starExample}”`
                    : 'ARC works well for direct questions. Answer the question clearly, add the relevant context, and connect your answer back to the role or situation.',
                suggestionPills: [
                    ...(!helpTopics.includes(otherTopic) ? [{ id: `${otherTopic.toLowerCase()}-help`, label: `What's ${otherTopic}?`, onClick: () => requestHelp(otherTopic), variant: 'action' as const }] : []),
                    ...(!interviewHasStarted ? [{ id: 'continue-interview', label: 'Continue interview', onClick: continueInterview, variant: 'action' as const }] : []),
                ],
            });
        });

        if (!hasStartedInterview) return msgs;

        msgs.push({
            id: 'interview-ready',
            role: 'ai',
            content: 'Take a moment, then answer as you would in the interview.',
        });

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
                                <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                                    <span className="font-black uppercase tracking-widest text-neutral-500">Suggested approach:</span>
                                    <span className="font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300">{framework.name}</span>
                                    <span>{framework.description}</span>
                                </div>
                            );
                        })()}
                        {/* Resume snippets (only on the current unanswered question) */}
                        {isLastQ && !resp && resumeSnippets.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mt-3 pt-1 flex flex-wrap items-center gap-2"
                            >
                                <div className="text-[10px] font-black text-neutral-400 mr-1">
                                    Think about:
                                </div>
                                {resumeSnippets.map((snippet, sIdx) => (
                                    <div
                                        key={sIdx}
                                        className="group flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-full shadow-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all cursor-default max-w-[12rem]"
                                        title={snippet.source}
                                    >
                                        <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 truncate">
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
                const isIntroQuestion = /^tell me about yourself\b/i.test(q.question.trim());
                const isRejectedOrSkipped = resp.analysis?.decision === 'Reject' || resp.response === '[Skipped]' || /^(no|skip|prefer not to say)$/i.test(resp.response.trim());
                const betterVersion = isIntroQuestion
                    ? buildResumeGroundedIntroduction(resumes, verifiedSkills, job)
                    : resp.analysis?.betterVersion && !/\[[^\]]+\]/.test(resp.analysis.betterVersion)
                        ? resp.analysis.betterVersion
                        : null;
                msgs.push({
                    id: `r-${q.id}`,
                    role: 'user',
                    content: resp.response,
                    metadata: resp.analysis ? (
                        <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-900/10 rounded-xl border border-neutral-100 dark:border-neutral-500/20 space-y-2">
                            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-400 font-bold text-xs">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Verdict: {resp.analysis.decision}</span>
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {resp.analysis.feedback}
                            </p>
                            {!isRejectedOrSkipped && betterVersion && (
                                <div className="text-xs text-neutral-500 dark:text-neutral-500 pt-2 border-t border-neutral-200 dark:border-neutral-800/30">
                                    <strong>Better:</strong> "{betterVersion}"
                                </div>
                            )}

                            {/* Resume Suggestions */}
                            {resp.analysis.resumeSuggestions && resp.analysis.resumeSuggestions.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-800/30 space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                                        <FileText className="w-3 h-3" />
                                        <span>Resume suggestion</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {resp.analysis.resumeSuggestions.map((suggestion: ResumeSuggestionItem, sIdx: number) => {
                                            const isBanked = resumes[0]?.suggestedUpdates?.some((u) => u.suggestion === suggestion.suggestion);

                                            return (
                                                <div key={sIdx} className="rounded-lg p-2 bg-neutral-50/70 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-800/60 group/suggest">
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
                                                                                                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${isBanked
                                                                                                            ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 cursor-default'
                                                                                                            : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800'
                                                                                                            }`}
                                                                                                        title={isBanked ? "Saved suggestion" : "Save suggestion"}
                                                                                                    >
                                                                                                        {isBanked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                                                                                        <span>{isBanked ? 'Saved' : 'Save suggestion'}</span>
                                                                                                    </button>
                                                                                                    <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(suggestion.suggestion);
                                                                    setCopiedText(suggestion.suggestion);
                                                                    setTimeout(() => setCopiedText(null), 2000);
                                                                }}
                                                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${copiedText === suggestion.suggestion
                                                                    ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10'
                                                                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-500'}`}
                                                                title="Copy text"
                                                            >
                                                                {copiedText === suggestion.suggestion ? (
                                                                    <Check className="w-3.5 h-3.5" />
                                                                ) : (
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                )}
                                                                <span>{copiedText === suggestion.suggestion ? 'Copied' : 'Copy text'}</span>
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
    }, [questions, currentQuestionIndex, responses, mode, resumes, copiedText, resumeSnippets, onBankSuggestion, onSaveStory, sessionType, selectedJobId, jobs, onJobSelected, isSessionLoading, helpTopics, hasStartedInterview, starExample]);

    if (mode === 'session') {
        const isInitialJobSelection = sessionType === 'tailored' && !selectedJobId;
        const shouldDisableInput = !isInitialJobSelection && (!hasStartedInterview && Object.keys(responses).length === 0 && currentQuestionIndex === 0 || (helpTopics.length > 0 && !hasStartedInterview));

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
        const currentResponse = currentQ ? responses[currentQ.id] : undefined;
        const hasCompletedResponse = !!currentResponse?.analysis && !isLoading;
        const isInterviewComplete = isLastQuestion && hasCompletedResponse;
        const analyzedResponses = Object.values(responses).filter((response) => response.analysis);
        const verdictCounts = analyzedResponses.reduce<Record<string, number>>((counts, response) => {
            const decision = response.analysis?.decision;
            if (decision) counts[decision] = (counts[decision] || 0) + 1;
            return counts;
        }, {});
        const summaryStrengths = Array.from(new Set(analyzedResponses.flatMap((response) => response.analysis?.strengths || []))).slice(0, 3);
        const summaryImprovements = Array.from(new Set(analyzedResponses.flatMap((response) => response.analysis?.improvements || []))).slice(0, 3);
        const completionSummary = isInterviewComplete ? (
            <div className="mt-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs dark:border-neutral-800 dark:bg-neutral-950">
                <p className="font-black uppercase tracking-widest text-neutral-500">Session summary</p>
                <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                    {analyzedResponses.length} answers reviewed
                    {Object.entries(verdictCounts).map(([decision, count]) => ` · ${count} ${decision.toLowerCase()}`)}
                </p>
                {(summaryStrengths.length > 0 || summaryImprovements.length > 0) && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {summaryStrengths.length > 0 && (
                            <div>
                                <p className="font-bold text-neutral-700 dark:text-neutral-300">What went well</p>
                                <ul className="mt-1 list-disc space-y-1 pl-4 text-neutral-500 dark:text-neutral-400">
                                    {summaryStrengths.map((item) => <li key={item}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                        {summaryImprovements.length > 0 && (
                            <div>
                                <p className="font-bold text-neutral-700 dark:text-neutral-300">Focus next</p>
                                <ul className="mt-1 list-disc space-y-1 pl-4 text-neutral-500 dark:text-neutral-400">
                                    {summaryImprovements.map((item) => <li key={item}>{item}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        ) : undefined;
        const canSaveCurrentStory = !!currentQ
            && sessionType === 'general'
            && !!currentResponse?.analysis
            && currentResponse.analysis.decision !== 'Reject'
            && currentResponse.response !== '[Skipped]'
            && !/^(no|skip|prefer not to say)$/i.test(currentResponse.response.trim());

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
            inputHint = isLastQuestion && hasCompletedResponse ? 'Interview Complete' : 'Press Enter for Next Question';
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
                        secondaryAction={canSaveCurrentStory ? {
                            label: currentResponse?.savedAsStory ? 'Saved for future applications' : 'Save example',
                            onClick: () => { if (currentQ) void onSaveStory(currentQ.id); },
                            disabled: currentResponse?.savedAsStory,
                            completed: currentResponse?.savedAsStory,
                        } : undefined}
                        completionMessage={isInterviewComplete ? 'Interview complete — you reached the end of this session.' : undefined}
                        completionSummary={completionSummary}
                        progressLabel={!isInitialJobSelection ? `Question ${currentQuestionIndex + 1} of ${questions.length}` : undefined}
                        inputDisabled={(!!currentQ && hasResponse) || isLoading || shouldDisableInput}
                        accentGradient="from-neutral-700 to-neutral-500"
                    />
                </div>
            </div>
        );
    }

    return null;
};
