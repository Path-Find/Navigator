import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { authClient } from '../../lib/auth-client';
import { checkInterviewLimit } from '../../services/usageLimits';
import { useToast } from '../../contexts/ToastContext';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { useJobContext } from './context/JobContext';
import { useResumeContext } from '../resume/context/ResumeContext';
import { useSkillContext } from '../skills/context/SkillContext';
import { useUser } from '../../contexts/UserContext';
import { useInterview } from './hooks/useInterview';
import { computeSnippets } from './utils/interviewUtils';
import { useSkillDiscovery } from '../resume/hooks/useSkillDiscovery';
import { InterviewSelection, PracticeModeSelection } from './components/InterviewSelection';
import { InterviewSessionScreen } from './components/InterviewSessionScreen';
import { CandidateProfileInterview } from './components/CandidateProfileInterview';
import { ROUTES } from '../../constants';
import { createCandidateStory } from '../../services/candidateProfileContext';

export const InterviewAdvisor: React.FC = () => {
    const { isAdmin, isLoading: isUserLoading } = useUser();
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
        isLastQuestion,
        markStorySaved
    } = useInterview();

    const { resumes, handleUpdateResume } = useResumeContext();
    const { skills } = useSkillContext();
    const { verifiedSkills } = useSkillDiscovery(resumes[0]?.blocks || [], skills);

    const [mode, setMode] = useState<'selection' | 'practice-selection' | 'session'>('selection');
    const [sessionType, setSessionType] = useState<'general' | 'tailored' | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [userResponse, setUserResponse] = useState('');
    const [limitError, setLimitError] = useState<string | null>(null);

    const { setFocusedMode } = useGlobalUI();
    const { showError } = useToast();
    const [resumeSnippets, setResumeSnippets] = useState<{ text: string; source: string }[]>([]);

    useEffect(() => {
        if (!isUserLoading && !isAdmin) navigate(ROUTES.FEATURES, { replace: true });
    }, [isAdmin, isUserLoading, navigate]);

    // Sync state with URL
    useEffect(() => {
        if (isUserLoading || !isAdmin) return;
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
                    loadGeneralQuestions(resumes, skills);
                }
            };
            startSession();
        } else if (type === 'practice') {
            queueMicrotask(() => setMode('practice-selection'));
        } else if (type === 'profile') {
            queueMicrotask(() => {
                setMode('session');
                setFocusedMode(true);
            });
        } else {
            queueMicrotask(() => {
                setMode('selection');
                setSessionType(null);
                setSelectedJobId(null);
            });
        }
    }, [type, navigate, resumes, skills, loadGeneralQuestions, showError, isAdmin, isUserLoading]);

    useEffect(() => {
        if (mode === 'session' || mode === 'practice-selection') {
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

    const handleStartPractice = async () => {
        navigate(`${ROUTES.INTERVIEWS}/practice`);
    };

    const handleStartProfile = async () => {
        navigate(`${ROUTES.INTERVIEWS}/profile`);
    };

    const handleJobSelected = (jobId: string) => {
        setSelectedJobId(jobId);
        const job = jobs.find(j => j.id === jobId);
        if (job) {
            setResumeSnippets(computeSnippets(resumes));
            loadTailoredQuestions(job, resumes, skills);
        }
    };

    const handleSaveStory = async (questionId: string) => {
        if (sessionType !== 'general') return;
        const question = questions.find(item => item.id === questionId);
        const response = responses[questionId]?.response;
        const primaryResume = resumes[0];
        if (!question || !response?.trim() || !primaryResume) return;

        const existingStories = primaryResume.candidateProfile?.stories || [];
        if (!existingStories.some(story => story.text.trim().toLowerCase() === response.trim().toLowerCase())) {
            const story = createCandidateStory(
                response,
                'general_interview',
                [question.category, 'behavioral'],
                question.question
            );
            await handleUpdateResume({
                ...primaryResume,
                candidateProfile: {
                    signals: primaryResume.candidateProfile?.signals || [],
                    stories: [...existingStories, story],
                    facts: primaryResume.candidateProfile?.facts || [],
                    education: primaryResume.candidateProfile?.education,
                    availability: primaryResume.candidateProfile?.availability,
                    currentBlockIds: primaryResume.candidateProfile?.currentBlockIds || [],
                    completedAt: primaryResume.candidateProfile?.completedAt,
                },
            });
        }
        markStorySaved(questionId);
    };

    const handleSubmit = async () => {
        if (!userResponse.trim()) return;

        // If we are in tailored mock but haven't selected a job yet
        if (sessionType === 'tailored' && !selectedJobId) {
            const query = userResponse.toLowerCase().trim();
            const matchedJob = jobs.find(j => 
                j.status !== 'feed' && (
                    j.position.toLowerCase().includes(query) || 
                    j.company.toLowerCase().includes(query)
                )
            );

            if (matchedJob?.analysis) {
                handleJobSelected(matchedJob.id);
                setUserResponse('');
            } else if (matchedJob) {
                showError("That saved job hasn't been analyzed yet. Analyze it first, then try again.");
            } else {
                showError("I couldn't find a saved job matching that. Try its job title or company name.");
            }
            return;
        }

        const job = jobs.find(j => j.id === selectedJobId);
        const submissionText = userResponse;
        setUserResponse('');
        await submitResponse(currentQuestion.id, submissionText, job, resumes, skills);
    };

    const isSessionLoading = mode === 'session' && sessionType && (
        (sessionType === 'general' && questions.length === 0 && isLoading) ||
        (sessionType === 'tailored' && selectedJobId && questions.length === 0 && isLoading)
    );

    if (isUserLoading || !isAdmin) return null;

    if (type === 'profile') {
        return <CandidateProfileInterview />;
    }

    if (mode === 'practice-selection') {
        return <PracticeModeSelection
            hasSavedJobs={jobs.some(job => job.status !== 'feed')}
            onGeneral={() => { void handleStartGeneral(); }}
            onTailored={() => { void handleStartTailored(); }}
        />;
    }

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
            verifiedSkills={verifiedSkills}
            resumeSnippets={resumeSnippets}
            isSessionLoading={!!isSessionLoading}
            isLoading={isLoading}
            userResponse={userResponse}
            setUserResponse={setUserResponse}
            handleSubmit={handleSubmit}
            nextQuestion={nextQuestion}
            isLastQuestion={isLastQuestion}
            handleUpdateResume={handleUpdateResume}
            onSaveStory={handleSaveStory}
        />;
    }

    return <InterviewSelection
        limitError={limitError}
        handleStartPractice={handleStartPractice}
        handleStartProfile={handleStartProfile}
        hasSavedJobs={jobs.some(job => job.status !== 'feed')}
    />;
};

export default InterviewAdvisor;
