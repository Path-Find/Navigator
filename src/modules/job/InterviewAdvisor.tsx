import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { authClient } from '../../lib/auth-client';
import { checkInterviewLimit } from '../../services/usageLimits';
import { useToast } from '../../contexts/ToastContext';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { useJobContext } from './context/JobContext';
import { useResumeContext } from '../resume/context/ResumeContext';
import { useInterview } from './hooks/useInterview';
import { computeSnippets } from './utils/interviewUtils';
import { InterviewSelection } from './components/InterviewSelection';
import { InterviewSessionScreen } from './components/InterviewSessionScreen';
import { ROUTES } from '../../constants';

export const InterviewAdvisor: React.FC = () => {
    const { jobs } = useJobContext();
    const { type } = useParams<{ type: string }>();
    const navigate = useNavigate();
    const {
        questions,
        currentQuestionIndex,
        currentQuestion,
        responses,
        isLoading,
        error,
        loadGeneralQuestions,
        loadTailoredQuestions,
        submitResponse,
        nextQuestion,
        isLastQuestion
    } = useInterview();

    const { resumes, handleUpdateResume } = useResumeContext();

    const [mode, setMode] = useState<'selection' | 'session'>('selection');
    const [sessionType, setSessionType] = useState<'general' | 'tailored' | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [userResponse, setUserResponse] = useState('');
    const [limitError, setLimitError] = useState<string | null>(null);

    const { setFocusedMode } = useGlobalUI();
    const { showError } = useToast();
    const [resumeSnippets, setResumeSnippets] = useState<{ text: string; source: string }[]>([]);

    // Sync state with URL
    useEffect(() => {
        if (type === 'general' || type === 'tailored') {
            const startSession = async () => {
                const { data: { user } } = await authClient.getUser();
                if (!user) {
                    showError(`Please sign in to start a ${type} session`);
                    navigate(ROUTES.INTERVIEWS);
                    return;
                }

                const limit = await checkInterviewLimit(user.id);
                if (!limit.allowed) {
                    setLimitError(`Monthly interview limit reached (${limit.used}/${limit.limit})`);
                    navigate(ROUTES.INTERVIEWS);
                    return;
                }

                setSessionType(type as 'general' | 'tailored');
                setMode('session');
                
                if (type === 'general') {
                    setResumeSnippets(computeSnippets(resumes));
                    loadGeneralQuestions(resumes);
                }
            };
            startSession();
        } else {
            queueMicrotask(() => {
                setMode('selection');
                setSessionType(null);
                setSelectedJobId(null);
            });
        }
    }, [type, navigate, resumes, loadGeneralQuestions, showError]);

    useEffect(() => {
        if (mode === 'session') {
            setFocusedMode(true);
        } else {
            setFocusedMode(false);
        }
        return () => setFocusedMode(false);
    }, [mode, setFocusedMode]);

    // Handle API errors during interview loading
    useEffect(() => {
        if (error) {
            showError(error);
            navigate(ROUTES.INTERVIEWS);
        }
    }, [error, showError, navigate]);


    const handleStartTailored = async () => {
        navigate(`${ROUTES.INTERVIEWS}/tailored`);
    };

    const handleStartGeneral = async () => {
        navigate(`${ROUTES.INTERVIEWS}/general`);
    };

    const handleJobSelected = (jobId: string) => {
        setSelectedJobId(jobId);
        const job = jobs.find(j => j.id === jobId);
        if (job) {
            setResumeSnippets(computeSnippets(resumes));
            loadTailoredQuestions(job, resumes);
        }
    };

    const handleSubmit = async () => {
        if (!userResponse.trim()) return;

        // If we are in tailored mock but haven't selected a job yet
        if (sessionType === 'tailored' && !selectedJobId) {
            const query = userResponse.toLowerCase().trim();
            const matchedJob = jobs.find(j => 
                j.analysis && (
                    j.position.toLowerCase().includes(query) || 
                    j.company.toLowerCase().includes(query)
                )
            );

            if (matchedJob) {
                handleJobSelected(matchedJob.id);
                setUserResponse('');
            } else {
                showError("I couldn't find a job matching that. Please select from the suggestions or type a position name.");
            }
            return;
        }

        const job = jobs.find(j => j.id === selectedJobId);
        const submissionText = userResponse;
        setUserResponse('');
        await submitResponse(currentQuestion.id, submissionText, job);
    };

    const isSessionLoading = mode === 'session' && sessionType && (
        (sessionType === 'general' && questions.length === 0 && isLoading) ||
        (sessionType === 'tailored' && selectedJobId && questions.length === 0 && isLoading)
    );

    if (mode === 'session') {
        return <InterviewSessionScreen
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            responses={responses}
            mode={mode}
            sessionType={sessionType}
            jobs={jobs}
            selectedJobId={selectedJobId}
            onJobSelected={handleJobSelected}
            resumes={resumes}
            resumeSnippets={resumeSnippets}
            isSessionLoading={!!isSessionLoading}
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
    />;
};

export default InterviewAdvisor;
