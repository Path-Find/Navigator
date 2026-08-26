import { useState, useCallback } from 'react';
import {
    generateTailoredInterviewQuestions,
    generateGeneralBehavioralQuestions,
    analyzeAndFollowUp,
    formatParsedJobContext
} from '../../../services/geminiService';
import { getJobRelevantResume } from '../utils/jobUtils';
import type {
    InterviewQuestion,
    InterviewResponseAnalysis,
    SavedJob
} from '../types';
import type { ResumeProfile } from '../../resume/types';
import type { CustomSkill } from '../../skills/types';
import { Storage } from '../../../services/storageService';
import { createCandidateEducationContext, formatCandidateProfileContext, formatVerifiedSkills } from '../../../services/candidateProfileContext';
import { formatInterviewBlocks } from '../../../services/ai/interviewContext';

const MAX_FOLLOW_UPS = 2;

const INTERVIEW_BLOCK_TYPES = new Set(['work', 'volunteer', 'project', 'education']);

const stringifyForInterview = (resumes: ResumeProfile[], skills: CustomSkill[] = [], reference = ''): string => {
    if (!resumes.length) return '';
    return formatInterviewBlocks(resumes[0], reference)
        + [
            formatCandidateProfileContext(resumes[0], reference) ? `APPROVED CANDIDATE CONTEXT:\n${formatCandidateProfileContext(resumes[0], reference)}` : '',
            formatVerifiedSkills(skills, reference),
        ].filter(Boolean).join('\n\n');
};

/** Reuse parsed job facts for interview calls; raw text is only for legacy unanalyzed jobs. */
export const getInterviewJobContext = (job: SavedJob): string => {
    if (job.analysis?.distilledJob) {
        return formatParsedJobContext(
            job.analysis.distilledJob,
            job.analysis.selectedAcademicEvidence || []
        );
    }
    return job.description;
};

/** Keep tailored interview calls focused on the job-relevant resume evidence. */
export const getInterviewResumes = (job: SavedJob, resumes: ResumeProfile[]): ResumeProfile[] => {
    const relevantResume = getJobRelevantResume(resumes, job.analysis);
    if (!relevantResume) return [];

    return [{
        ...relevantResume,
        blocks: relevantResume.blocks.filter(block => INTERVIEW_BLOCK_TYPES.has(block.type)),
    }];
};

export const useInterview = () => {
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState<Record<string, { response: string, analysis?: InterviewResponseAnalysis; savedAsStory?: boolean }>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadGeneralQuestions = useCallback(async (resumes: ResumeProfile[] = [], skills: CustomSkill[] = []) => {
        setIsLoading(true);
        setError(null);
        try {
            const resumeContext = stringifyForInterview(resumes, skills);
            const result = await generateGeneralBehavioralQuestions(resumeContext);
            setQuestions(result);
            setCurrentQuestionIndex(0);
            setResponses({});
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load questions");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadTailoredQuestions = useCallback(async (job: SavedJob, resumes: ResumeProfile[], skills: CustomSkill[] = []) => {
        setIsLoading(true);
        setError(null);
        try {
            const transcript = await Storage.getTranscript();
            const interviewResumes = getInterviewResumes(job, resumes);
            const resumesWithEducation = transcript && interviewResumes.length > 0
                ? interviewResumes.map((resume, index) => index === 0
                    ? {
                        ...resume,
                        candidateProfile: {
                            ...(resume.candidateProfile || { signals: [], stories: [] }),
                            education: createCandidateEducationContext(transcript),
                        },
                    }
                    : resume)
                : interviewResumes;
            const result = await generateTailoredInterviewQuestions(getInterviewJobContext(job), resumesWithEducation, job.id, job.position, skills);
            setQuestions(result);
            setCurrentQuestionIndex(0);
            setResponses({});
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to generate tailored questions");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const submitResponse = useCallback(async (questionId: string, responseText: string, job?: SavedJob, resumes: ResumeProfile[] = [], skills: CustomSkill[] = []) => {
        const questionIndex = questions.findIndex(q => q.id === questionId);
        const question = questions[questionIndex];

        if (!question) return;

        // 1. Save the response immediately
        setResponses(prev => ({
            ...prev,
            [questionId]: { response: responseText }
        }));

        setIsLoading(true);

        try {
            // 2. One call: analyze the response and optionally get a follow-up question.
            // If this is already a follow-up, we pass a flag so the AI skips the follow-up decision.
            const result = await analyzeAndFollowUp(
                question.question,
                responseText,
                job ? getInterviewJobContext(job) : undefined,
                job?.id,
                stringifyForInterview(job ? getInterviewResumes(job, resumes) : resumes, skills, `${question.question}\n${responseText}`)
            );
            const { followUp: followUpResult, ...analysis } = result;

            // 3. Save analysis
            setResponses(prev => ({
                ...prev,
                [questionId]: { response: responseText, analysis }
            }));

            // 4. Handle Follow-up Insertion (only if this wasn't already a follow-up)
            const followUpCount = questions.filter(item => item.isFollowUp).length;
            if (!question.isFollowUp && followUpCount < MAX_FOLLOW_UPS && followUpResult && followUpResult.shouldFollowUp && followUpResult.question) {
                const followUpQuestion: InterviewQuestion = {
                    id: crypto.randomUUID(),
                    question: followUpResult.question,
                    rationale: followUpResult.rationale || "Deepening the discussion based on your answer.",
                    category: question.category,
                    isFollowUp: true,
                    tips: "Be specific and address the follow-up directly."
                };

                // Insert the follow-up RIGHT AFTER the current question
                setQuestions(prev => {
                    const newQuestions = [...prev];
                    newQuestions.splice(questionIndex + 1, 0, followUpQuestion);
                    return newQuestions;
                });
            }

        } catch (err: unknown) {
            console.error("Failed to analyze response:", err);
        } finally {
            setIsLoading(false);
        }
    }, [questions]);

    const nextQuestion = useCallback(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }, [currentQuestionIndex, questions.length]);

    const prevQuestion = useCallback(() => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    }, [currentQuestionIndex]);

    const markStorySaved = useCallback((questionId: string) => {
        setResponses(prev => {
            const response = prev[questionId];
            if (!response) return prev;
            return { ...prev, [questionId]: { ...response, savedAsStory: true } };
        });
    }, []);

    return {
        questions,
        currentQuestionIndex,
        currentQuestion: questions[currentQuestionIndex],
        responses,
        isLoading,
        error,
        loadGeneralQuestions,
        loadTailoredQuestions,
        submitResponse,
        nextQuestion,
        prevQuestion,
        markStorySaved,
        isLastQuestion: currentQuestionIndex === questions.length - 1,
        isFirstQuestion: currentQuestionIndex === 0,
        totalQuestions: questions.length
    };
};
