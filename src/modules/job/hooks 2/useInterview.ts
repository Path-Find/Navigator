import { useState, useCallback } from 'react';
import {
    generateTailoredInterviewQuestions,
    generateGeneralBehavioralQuestions,
    analyzeAndFollowUp
} from '../../../services/geminiService';
import type {
    InterviewQuestion,
    InterviewResponseAnalysis,
    SavedJob
} from '../types';
import type { ResumeProfile } from '../../resume/types';

const stringifyForInterview = (resumes: ResumeProfile[]): string => {
    if (!resumes.length) return '';
    return resumes[0].blocks
        .filter(b => b.isVisible && (b.type === 'work' || b.type === 'volunteer' || b.type === 'project' || b.type === 'education'))
        .map(b => `${b.title} at ${b.organization} (${b.dateRange}):\n${b.bullets.map(bull => `- ${bull}`).join('\n')}`)
        .join('\n\n');
};

export const useInterview = () => {
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState<Record<string, { response: string, analysis?: InterviewResponseAnalysis }>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadGeneralQuestions = useCallback(async (resumes: ResumeProfile[] = []) => {
        setIsLoading(true);
        setError(null);
        try {
            const resumeContext = stringifyForInterview(resumes);
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

    const loadTailoredQuestions = useCallback(async (job: SavedJob, resumes: ResumeProfile[]) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateTailoredInterviewQuestions(job.description, resumes, job.id, job.position);
            setQuestions(result);
            setCurrentQuestionIndex(0);
            setResponses({});
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to generate tailored questions");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const submitResponse = useCallback(async (questionId: string, responseText: string, job?: SavedJob) => {
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
            const result = await analyzeAndFollowUp(question.question, responseText, job?.description, job?.id);
            const { followUp: followUpResult, ...analysis } = result;

            // 3. Save analysis
            setResponses(prev => ({
                ...prev,
                [questionId]: { response: responseText, analysis }
            }));

            // 4. Handle Follow-up Insertion (only if this wasn't already a follow-up)
            if (!question.isFollowUp && followUpResult && followUpResult.shouldFollowUp && followUpResult.question) {
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
        isLastQuestion: currentQuestionIndex === questions.length - 1,
        isFirstQuestion: currentQuestionIndex === 0,
        totalQuestions: questions.length
    };
};
