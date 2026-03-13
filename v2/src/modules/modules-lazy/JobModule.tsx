import React, { useEffect } from 'react';
import { useLocation, Routes, Route } from 'react-router-dom';
import { useJobContext } from '../job/context/JobContext';
import HomePage from '../job/HomePage';
import JobMatchInput from '../job/JobMatchInput';
import History from '../job/History';
import JobDetail from '../job/JobDetail';
import { CoverLetters } from '../job/CoverLetters';
import { NavigatorPro } from '../job/NavigatorPro';
import { InterviewAdvisor } from '../job/InterviewAdvisor';
import { NudgeCard } from '../../components/NudgeCard';

const JobSyncEffect: React.FC = () => {
    const { activeJobId, setActiveJobId } = useJobContext();
    const location = useLocation();

    useEffect(() => {
        const match = location.pathname.match(/\/jobs\/match\/([^/]+)/);
        const urlJobId = match ? match[1] : null;
        if (urlJobId !== activeJobId) {
            setActiveJobId(urlJobId);
        }
    }, [location.pathname, setActiveJobId, activeJobId]);

    return null;
};

const HomePageWithNudge: React.FC = () => {
    const { nudgeJob, handleUpdateJob, dismissNudge } = useJobContext();
    return (
        <>
            {nudgeJob && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-24">
                    <NudgeCard
                        job={nudgeJob}
                        onUpdateStatus={(status) => {
                            handleUpdateJob({ ...nudgeJob, status });
                            dismissNudge();
                        }}
                        onDismiss={dismissNudge}
                    />
                </div>
            )}
            <HomePage />
        </>
    );
};

const JobModuleContent: React.FC = () => {
    return (
        <>
            <JobSyncEffect />
            <Routes>
                <Route path="/" element={<HomePageWithNudge />} />
                <Route path="/jobs" element={<JobMatchInput />} />
                <Route path="/jobs/match/:jobId" element={<JobMatchInput />} />
                <Route path="/history" element={<History />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/cover-letters" element={<CoverLetters />} />
                <Route path="/feed" element={<NavigatorPro />} />
                <Route path="/interviews" element={<InterviewAdvisor />} />
            </Routes>
        </>
    );
};

const JobModule: React.FC = () => {
    return (
        <JobModuleContent />
    );
};

export default JobModule;
