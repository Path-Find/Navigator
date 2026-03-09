import { InterviewSelection } from './components/InterviewSelection';
import { InterviewSessionScreen } from './components/InterviewSessionScreen';
import { computeSnippets } from './utils/interviewUtils';
import React, { useState } from 'react';
import {
    MessageSquare,
    Sparkles,
    Target,
    Zap,
    CheckCircle2,
    Loader2,
    AlertCircle,
    FileText,
    Copy,
    ShieldCheck,
    Check
} from 'lucide-react';
import { useJobContext } from './context/JobContext';
import { useResumeContext } from '../resume/context/ResumeContext';
import { useInterview } from './hooks/useInterview';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { motion } from 'framer-motion';
import { checkInterviewLimit } from '../../services/usageLimits';
import { BentoCard } from '../../components/ui/BentoCard';
import { FEATURE_COLORS } from '../../featureRegistry';
import { supabase } from '../../services/supabase';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { LoadingState } from '../../components/common/LoadingState';
import { useToast } from '../../contexts/ToastContext';
import { InterviewChat } from '../../components/common/InterviewChat';
import type { ChatMessage } from '../../components/common/InterviewChat';

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
        const navigate = useNavigate();

    const { isFocusedMode, setFocusedMode } = useGlobalUI();
    const { showError } = useToast();

    React.useEffect(() => {
        if (mode === 'session') {
            setFocusedMode(true);
        } else {
            setFocusedMode(false);
        }
        return () => setFocusedMode(false);
    }, [mode, setFocusedMode]);

    // Reset mode if focused mode is disabled externally (e.g., from Header 'Exit')
    React.useEffect(() => {
        if (mode === 'session' && !isFocusedMode) {
            setMode('selection');
        }
    }, [mode, isFocusedMode]);

    const [resumeSnippets, setResumeSnippets] = React.useState<{ text: string; source: string }[]>([]);

    


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
