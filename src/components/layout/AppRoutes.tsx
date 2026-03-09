import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LoadingState } from '../common/LoadingState';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { ROUTES } from '../../constants';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import { ProtectedRoute } from './ProtectedRoute';

// Context Hooks
import { useJobContext } from '../../modules/job/context/JobContext';
import { useResumeContext } from '../../modules/resume/context/ResumeContext';

// Core Modules
import { NudgeCard } from '../NudgeCard';

// Lazy load heavy modules
const HomePage = lazyWithRetry(() => import('../../modules/job/HomePage'));
const JobMatchInput = lazyWithRetry(() => import('../../modules/job/JobMatchInput'));
const History = lazyWithRetry(() => import('../../modules/job/History'));
const JobDetail = lazyWithRetry(() => import('../../modules/job/JobDetail'));
const CoachDashboard = lazyWithRetry(() => import('../../modules/career/CoachDashboard').then(m => ({ default: m.CoachDashboard })));
const ResumeEditor = lazyWithRetry(() => import('../../modules/resume/ResumeEditor'));
const NavigatorPro = lazyWithRetry(() => import('../../modules/job/NavigatorPro').then(m => ({ default: m.NavigatorPro })));
const AdminDashboard = lazyWithRetry(() => import('../../modules/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const EducationDashboard = lazyWithRetry(() => import('../../modules/grad/EducationDashboard').then(m => ({ default: m.EducationDashboard })));
const AcademicHQ = lazyWithRetry(() => import('../../modules/grad/AcademicHQ').then(m => ({ default: m.AcademicHQ })));
const SEOLandingPage = lazyWithRetry(() => import('../../modules/seo/SEOLandingPage').then(m => ({ default: m.SEOLandingPage })));
const SkillsView = lazyWithRetry(() => import('../skills/SkillsView').then(m => ({ default: m.SkillsView })));
const CoverLetters = lazyWithRetry(() => import('../../modules/job/CoverLetters').then(m => ({ default: m.CoverLetters })));
const Privacy = lazyWithRetry(() => import('../../modules/legal/Privacy').then(m => ({ default: m.Privacy })));
const GPACalculatorPage = lazyWithRetry(() => import('../../modules/grad/GPACalculatorPage').then(m => ({ default: m.GPACalculatorPage })));
const ProgramExplorerPage = lazyWithRetry(() => import('../../modules/grad/ProgramExplorerPage').then(m => ({ default: m.ProgramExplorerPage })));
const Terms = lazyWithRetry(() => import('../../modules/legal/Terms').then(m => ({ default: m.Terms })));
const Contact = lazyWithRetry(() => import('../../modules/contact/Contact').then(m => ({ default: m.Contact })));
const PlansPage = lazyWithRetry(() => import('../../modules/plans/PlansPage').then(m => ({ default: m.PlansPage })));
const ComparisonTable = lazyWithRetry(() => import('../../modules/plans/ComparisonTable').then(m => ({ default: m.ComparisonTable })));
const FeaturesPage = lazyWithRetry(() => import('../../modules/features/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const OnboardingPage = lazyWithRetry(() => import('../../modules/onboarding/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const SettingsPage = lazyWithRetry(() => import('../../modules/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const SkillInterviewPage = lazyWithRetry(() => import('../../modules/skills/SkillInterviewPage').then(m => ({ default: m.SkillInterviewPage })));
const InterviewAdvisor = lazyWithRetry(() => import('../../modules/job/InterviewAdvisor').then(m => ({ default: m.InterviewAdvisor })));
const EmailVerificationScreen = lazyWithRetry(() => import('../auth/EmailVerificationScreen').then(m => ({ default: m.EmailVerificationScreen })));

export const AppRoutes: React.FC = () => {
    const {
        activeJobId,
        handleUpdateJob,
        setActiveJobId,
        nudgeJob, dismissNudge
    } = useJobContext();

    const { isLoading: isResumesLoading } = useResumeContext();

    const location = useLocation();

    // URL Job Sync Effect
    useEffect(() => {
        const match = location.pathname.match(/\/jobs\/match\/([^/]+)/);
        const urlJobId = match ? match[1] : null;
        if (urlJobId !== activeJobId) {
            setActiveJobId(urlJobId);
        }
    }, [location.pathname, setActiveJobId, activeJobId]);

    return (
        <ErrorBoundary>
            <Routes>
                {/* Home / Analyze */}
                <Route path="/" element={
                    <Suspense fallback={<LoadingState message="Loading Home..." />}>
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
                    </Suspense>
                } />

                <Route path={ROUTES.WELCOME} element={
                    <Suspense fallback={<LoadingState message="Preparing Welcome..." />}>
                        <OnboardingPage />
                    </Suspense>
                } />

                <Route path={ROUTES.VERIFY_EMAIL} element={
                    <Suspense fallback={<LoadingState message="Verifying..." />}>
                        <EmailVerificationScreen />
                    </Suspense>
                } />

                <Route path={ROUTES.JOB_HOME} element={
                    <Suspense fallback={<LoadingState message="Prepping Matcher..." />}>
                        <JobMatchInput />
                    </Suspense>
                } />


                {/* SEO Landing Pages (Dynamic) */}
                <Route path={ROUTES.SEO_LANDING} element={
                    <Suspense fallback={<LoadingState message="Loading Content..." />}>
                        <SEOLandingPage />
                    </Suspense>
                } />

                {/* Core Views */}
                <Route element={<ProtectedRoute />}>
                    <Route path={ROUTES.FEED} element={
                        <Suspense fallback={<LoadingState message="Loading Feed..." />}>
                            <NavigatorPro />
                        </Suspense>
                    } />
                </Route>

                <Route element={<ProtectedRoute requireAdmin />}>
                    <Route path="/admin" element={
                        <Suspense fallback={<LoadingState message="Loading Admin Console..." />}>
                            <AdminDashboard />
                        </Suspense>
                    } />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path={ROUTES.RESUMES} element={
                        <Suspense fallback={<LoadingState message="Opening Editor..." />}>
                            {isResumesLoading ? <LoadingState message="Loading Resume..." /> : <ResumeEditor />}
                        </Suspense>
                    } />


                    <Route path={ROUTES.INTERVIEWS} element={
                        <Suspense fallback={<LoadingState message="Prepping Advisor..." />}>
                            <InterviewAdvisor />
                        </Suspense>
                    } />


                    {/* Career Routes */}
                    <Route path={ROUTES.CAREER_HOME + "/*"} element={
                        <Suspense fallback={<LoadingState message="Consulting Career Coach..." />}>
                            <CoachDashboard />
                        </Suspense>
                    } />

                    {/* Skills is now distinct but under Career header */}
                    <Route path={ROUTES.SKILLS} element={
                        <Suspense fallback={<LoadingState message="Loading Skills Dashboard..." />}>
                            <SkillsView />
                        </Suspense>
                    } />

                    <Route path="/career/skills/interview" element={
                        <Suspense fallback={<LoadingState message="Starting Interview..." />}>
                            <SkillInterviewPage />
                        </Suspense>
                    } />

                    {/* History */}
                    <Route path={ROUTES.HISTORY} element={
                        <Suspense fallback={<LoadingState message="Opening History..." />}>
                            <History />
                        </Suspense>
                    } />

                    <Route path={ROUTES.JOB_DETAIL} element={
                        <Suspense fallback={<LoadingState message="Loading Job Detail..." />}>
                            <JobDetail />
                        </Suspense>
                    } />

                    <Route path={ROUTES.EDUCATION_HOME} element={
                        <Suspense fallback={<LoadingState message="Loading Education Dashboard..." />}>
                            <EducationDashboard />
                        </Suspense>
                    } />

                    <Route path={ROUTES.COVER_LETTERS} element={
                        <Suspense fallback={<LoadingState message="Opening Cover Letters..." />}>
                            <CoverLetters />
                        </Suspense>
                    } />

                    <Route path={ROUTES.TRANSCRIPT} element={
                        <Suspense fallback={<LoadingState message="Loading Registry..." />}>
                            <AcademicHQ />
                        </Suspense>
                    } />

                    <Route path={ROUTES.GPA_CALCULATOR} element={
                        <Suspense fallback={<LoadingState message="Loading GPA Calculator..." />}>
                            <GPACalculatorPage />
                        </Suspense>
                    } />

                    <Route path={ROUTES.PROGRAM_EXPLORER} element={
                        <Suspense fallback={<LoadingState message="Loading Program Explorer..." />}>
                            <ProgramExplorerPage />
                        </Suspense>
                    } />
                </Route>

                <Route path={ROUTES.PRIVACY} element={
                    <Suspense fallback={<LoadingState message="Loading Privacy Policy..." />}>
                        <Privacy />
                    </Suspense>
                } />

                <Route path={ROUTES.TERMS} element={
                    <Suspense fallback={<LoadingState message="Loading Terms..." />}>
                        <Terms />
                    </Suspense>
                } />

                <Route path={ROUTES.CONTACT} element={
                    <Suspense fallback={<LoadingState message="Loading Contact..." />}>
                        <Contact />
                    </Suspense>
                } />


                <Route path={ROUTES.PLANS} element={
                    <Suspense fallback={<LoadingState message="Loading Plans..." />}>
                        <PlansPage />
                    </Suspense>
                } />

                <Route path={ROUTES.PLANS_COMPARE} element={
                    <Suspense fallback={<LoadingState message="Loading Comparison..." />}>
                        <ComparisonTable />
                    </Suspense>
                } />

                <Route path={ROUTES.FEATURES} element={
                    <Suspense fallback={<LoadingState message="Loading Features..." />}>
                        <FeaturesPage />
                    </Suspense>
                } />

                <Route element={<ProtectedRoute />}>
                    <Route path={ROUTES.SETTINGS} element={
                        <Suspense fallback={<LoadingState message="Loading Settings..." />}>
                            <SettingsPage />
                        </Suspense>
                    } />
                </Route>

                <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
        </ErrorBoundary>
    );
};
