import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { FeatureGrid } from './FeatureGrid';
import { useHeadlines } from '../../hooks/useHeadlines';
import { PageHeader } from '../../components/ui/PageHeader';
import { NudgeCard } from '../../components/NudgeCard';
import { useJobContext } from './context/JobContext';
import type { ViewId } from '../../utils/navigation';
import type { FeatureDefinition } from '../../featureRegistry';

import { useUser } from '../../contexts/UserContext';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { useModal } from '../../contexts/ModalContext';

const HomePage: React.FC = () => {
    const { user, isAdmin, isTester, journey, userTier } = useUser();
    const { setView } = useGlobalUI();
    const { openModal } = useModal();

    const onNavigate = (view: ViewId) => setView(view);
    const onShowAuth = (feature?: FeatureDefinition) => openModal('AUTH', feature ? { feature } : undefined);

    const headlineCategory = journey === 'student' ? 'edu' : 'all';
    const activeHeadline = useHeadlines(headlineCategory);

    return (
        <SharedPageLayout
            maxWidth="6xl"
            className="relative theme-job"
            spacing="hero"
            animate={false}
        >
            {/* Hero Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[600px] pointer-events-none z-0">
                <div className="absolute top-[-100px] left-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[80px] rounded-full animate-[pulse_4s_ease-in-out_infinite]" />
                <div className="absolute top-[100px] right-1/4 w-[400px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[80px] rounded-full animate-[pulse_5s_ease-in-out_infinite_1s]" />
            </div>

            <PageHeader
                variant="hero"
                title={activeHeadline.text}
                highlight={activeHeadline.highlight}
                className="mb-12"
                subtitle=""
            />

            {/* Contextual Nudge */}
            <NudgeSection />

            <FeatureGrid
                user={user}
                onNavigate={onNavigate}
                onShowAuth={onShowAuth}
                isAdmin={isAdmin}
                isTester={isTester}
                userTier={userTier}
                journey={journey}
                className="mb-12"
            />

            <div className="flex justify-center mb-8 animate-in fade-in duration-700 delay-300">
                <a
                    href="/features"
                    className="group flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                >
                    Explore all features
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
            </div>
        </SharedPageLayout>
    );
};

const NudgeSection: React.FC = () => {
    const { nudgeJob, handleUpdateJob, dismissNudge } = useJobContext();
    if (!nudgeJob) return null;

    return (
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <NudgeCard
                job={nudgeJob}
                onUpdateStatus={(status) => {
                    handleUpdateJob({ ...nudgeJob, status });
                    dismissNudge();
                }}
                onDismiss={dismissNudge}
            />
        </div>
    );
};

export default HomePage;
