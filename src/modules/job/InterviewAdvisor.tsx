import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { checkInterviewLimit } from '../../services/usageLimits';
import { useToast } from '../../contexts/ToastContext';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { useJobContext } from './context/JobContext';
import { useResumeContext } from '../resume/context/ResumeContext';
import { useInterview } from './hooks/useInterview';
import { computeSnippets } from './utils/interviewUtils';
import { InterviewSelection } from './components/InterviewSelection';
import { InterviewSessionScreen } from './components/InterviewSessionScreen';

export const InterviewAdvisor: React.FC = () => {
    const { jobs } = useJobContext();
    const {
        questions,
        currentQuestionIndex,
        currentQuestion,
        responses,
        isLoading,
        loadGeneralQuestions,
        loadTailoredQuestions,
        submitResponse,
        nextQuestion,
        isLastQuestion
    } = useInterview();

    const { resumes, handleUpdateResume } = useResumeContext();

    const [mode, setMode] = useState<'selection' | 'session'>('selection');
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [userResponse, setUserResponse] = useState('');
    const [limitError, setLimitError] = useState<string | null>(null);

    const { isFocusedMode, setFocusedMode } = useGlobalUI();
    const { showError } = useToast();

    useEffect(() => {
        if (mode === 'session') {
            setFocusedMode(true);
        } else {
            setFocusedMode(false);
        }
        return () => setFocusedMode(false);
    }, [mode, setFocusedMode]);

    // Reset mode if focused mode is disabled externally (e.g., from Header 'Exit')
    useEffect(() => {
        if (mode === 'session' && !isFocusedMode) {
            setTimeout(() => setMode('selection'), 0);
        }
    }, [mode, isFocusedMode]);

    const [resumeSnippets, setResumeSnippets] = useState<{ text: string; source: string }[]>([]);

    const handleStartTailored = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const limit = await checkInterviewLimit(user.id);
        if (!limit.allowed) {
            setLimitError(`Monthly interview limit reached (${limit.used}/${limit.limit})`);
            return;
        }

        const job = jobs.find(j => j.id === selectedJobId);
        if (job) {
            setResumeSnippets(computeSnippets(resumes));
            loadTailoredQuestions(job, resumes);
            setMode('session');
        } else {
            showError("Please select a target job first");
        }
    };

    const handleStartGeneral = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const limit = await checkInterviewLimit(user.id);
        if (!limit.allowed) {
            setLimitError(`Monthly interview limit reached (${limit.used}/${limit.limit})`);
            return;
        }

        setResumeSnippets(computeSnippets(resumes));
        loadGeneralQuestions(resumes);
        setMode('session');
    };

    const handleSubmit = async () => {
        if (!userResponse.trim()) return;
        const job = jobs.find(j => j.id === selectedJobId);
        await submitResponse(currentQuestion.id, userResponse, job);
        setUserResponse('');
    };

    const isSessionLoading = mode === 'session' && questions.length === 0 && isLoading;

    if (mode === 'session') {
        return <InterviewSessionScreen
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            responses={responses}
            mode={mode}
            resumes={resumes}
            resumeSnippets={resumeSnippets}
            isSessionLoading={isSessionLoading}
            isLoading={isLoading}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
            handleSubmit={handleSubmit}
            nextQuestion={nextQuestion}
            isLastQuestion={isLastQuestion}
            handleUpdateResume={handleUpdateResume}
        />;
    }

    return <InterviewSelection
        limitError={limitError}
        handleStartGeneral={handleStartGeneral}
        handleStartTailored={handleStartTailored}
        selectedJobId={selectedJobId}
        setSelectedJobId={setSelectedJobId}
        jobs={jobs}
    />;
};

export default InterviewAdvisor;
