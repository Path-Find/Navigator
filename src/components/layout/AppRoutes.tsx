import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router';

const ScrollToTop: React.FC = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};
import { LoadingState } from '../common/LoadingState';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { ROUTES } from '../../constants';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import { ProtectedRoute } from './ProtectedRoute';

// Lazy load Module Clusters
const JobModule = lazyWithRetry(() => import('../../modules/modules-lazy/JobModule'));
const CareerModule = lazyWithRetry(() => import('../../modules/modules-lazy/CareerModule'));
const ResumeModule = lazyWithRetry(() => import('../../modules/modules-lazy/ResumeModule'));
const EducationModule = lazyWithRetry(() => import('../../modules/modules-lazy/EducationModule'));

// Lazy load Shared / Utility pages
const AdminDashboard = lazyWithRetry(() => import('../../modules/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const SEOLandingPage = lazyWithRetry(() => import('../../modules/seo/SEOLandingPage').then(m => ({ default: m.SEOLandingPage })));
const Privacy = lazyWithRetry(() => import('../../modules/legal/Privacy').then(m => ({ default: m.Privacy })));
const Terms = lazyWithRetry(() => import('../../modules/legal/Terms').then(m => ({ default: m.Terms })));
const Contact = lazyWithRetry(() => import('../../modules/contact/Contact').then(m => ({ default: m.Contact })));
const PlansPage = lazyWithRetry(() => import('../../modules/plans/PlansPage').then(m => ({ default: m.PlansPage })));
const ComparisonTable = lazyWithRetry(() => import('../../modules/plans/ComparisonTable').then(m => ({ default: m.ComparisonTable })));
const FeaturesPage = lazyWithRetry(() => import('../../modules/features/FeaturesPage').then(m => ({ default: m.FeaturesPage })));
const OnboardingPage = lazyWithRetry(() => import('../../modules/onboarding/OnboardingPage').then(m => ({ default: m.OnboardingPage })));
const SettingsPage = lazyWithRetry(() => import('../../modules/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const EmailVerificationScreen = lazyWithRetry(() => import('../auth/EmailVerificationScreen').then(m => ({ default: m.EmailVerificationScreen })));
const ResetPasswordScreen = lazyWithRetry(() => import('../auth/ResetPasswordScreen').then(m => ({ default: m.ResetPasswordScreen })));

export const AppRoutes: React.FC = () => {
    return (
        <ErrorBoundary>
            <ScrollToTop />
            <Routes>
                {/* ─── Public / Marketing ───────────────────────────────────── */}
                <Route path="/*" element={
                    <Suspense fallback={<LoadingState message="Loading Home..." />}>
                        <JobModule />
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

                {/* Password recovery confirmation — must stay public. The visitor here
                    has only a one-time recovery token in the URL, not a logged-in
                    session, so this cannot live behind ProtectedRoute. */}
                <Route path={ROUTES.RESET_PASSWORD} element={
                    <Suspense fallback={<LoadingState message="Loading..." />}>
                        <ResetPasswordScreen />
                    </Suspense>
                } />

                <Route path={ROUTES.SEO_LANDING} element={
                    <Suspense fallback={<LoadingState message="Loading Content..." />}>
                        <SEOLandingPage />
                    </Suspense>
                } />

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

                {/* ─── Protected Modules ────────────────────────────────────── */}
                <Route element={<ProtectedRoute />}>
                    {/* Job Module Cluster */}
                    <Route path="/jobs/*" element={
                        <Suspense fallback={<LoadingState message="Loading Jobs..." />}>
                            <JobModule />
                        </Suspense>
                    } />
                    <Route path="/history" element={
                        <Suspense fallback={<LoadingState message="Opening History..." />}>
                            <JobModule />
                        </Suspense>
                    } />
                    <Route path="/feed" element={
                        <Suspense fallback={<LoadingState message="Loading Feed..." />}>
                            <JobModule />
                        </Suspense>
                    } />
                    <Route path="/cover-letters/*" element={
                        <Suspense fallback={<LoadingState message="Opening Cover Letters..." />}>
                            <JobModule />
                        </Suspense>
                    } />
                    <Route path="/interviews/*" element={
                        <Suspense fallback={<LoadingState message="Prepping Advisor..." />}>
                            <JobModule />
                        </Suspense>
                    } />

                    {/* Resume Module Cluster */}
                    <Route path={ROUTES.RESUMES} element={
                        <Suspense fallback={<LoadingState message="Opening Editor..." />}>
                            <ResumeModule />
                        </Suspense>
                    } />

                    {/* Career & Skills Cluster */}
                    <Route path="/career/*" element={
                        <Suspense fallback={<LoadingState message="Consulting Career Coach..." />}>
                            <CareerModule />
                        </Suspense>
                    } />
                    <Route path="/skills/*" element={
                        <Suspense fallback={<LoadingState message="Loading Skills..." />}>
                            <CareerModule />
                        </Suspense>
                    } />

                    {/* Education Cluster */}
                    <Route path="/education/*" element={
                        <Suspense fallback={<LoadingState message="Loading Education..." />}>
                            <EducationModule />
                        </Suspense>
                    } />

                    <Route path={ROUTES.SETTINGS} element={
                        <Suspense fallback={<LoadingState message="Loading Settings..." />}>
                            <SettingsPage />
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

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </ErrorBoundary>
    );
};
