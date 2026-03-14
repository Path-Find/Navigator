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
        const pathParts = location.pathname.split('/');
        const urlJobId = (pathParts[1] === 'jobs' && pathParts[2] && !['match', 'history', 'resumes', 'interviews', 'feed', 'cover-letters'].includes(pathParts[2])) 
            ? pathParts[2] 
            : null;
        
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
    const location = useLocation();
    const isRoot = location.pathname === '/';

    return (
        <>
            <JobSyncEffect />
            <Routes>
                <Route path="/" element={isRoot ? <HomePageWithNudge /> : <JobMatchInput />} />
                <Route path="match" element={<JobMatchInput />} />
                <Route path="history" element={<History />} />
                <Route path="cover-letters" element={<CoverLetters />} />
                <Route path="feed" element={<NavigatorPro />} />
                <Route path="interviews" element={<InterviewAdvisor />} />
                
                {/* ID-based routes, absolute-like matching as backup */}
                <Route path=":id" element={<JobDetail />} />
                
                {/* Legacy / Compatibility paths if parent is root */}
                <Route path="jobs/match" element={<JobMatchInput />} />
                <Route path="jobs/:id" element={<JobDetail />} />
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
