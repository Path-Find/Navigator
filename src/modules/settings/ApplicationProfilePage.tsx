import React from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { ROUTES } from '../../constants';
import { CandidateProfileContextManager } from './components/CandidateProfileContextManager';
import { NextGenCalibration } from './components/NextGenCalibration';
import { useUser } from '../../contexts/UserContext';

export const ApplicationProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { isNextGenEnabled } = useUser();

    return (
        <SharedPageLayout maxWidth="6xl" spacing="hero" className="pb-20">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                icon={<ArrowLeft className="w-3.5 h-3.5" />}
                className="!px-0 !text-neutral-500 hover:!text-indigo-600 dark:hover:!text-indigo-400"
            >
                Back
            </Button>

            <PageHeader
                title="Application"
                highlight="Preferences"
                subtitle="Set the preferences and extra context Navigator can use when tailoring applications."
                actions={(
                    <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => navigate(ROUTES.PROFILE_INTERVIEW)}
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                        className="!text-indigo-600 dark:!text-indigo-400 !border-indigo-100 dark:!border-indigo-500/20"
                    >
                        Add context with interview
                    </Button>
                )}
            />

            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 px-5 py-4 dark:border-violet-500/20 dark:bg-violet-500/10">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                    Set your job-search preferences and the extra context Navigator may reuse in applications. These choices do not change your account settings.
                </p>
            </div>

            <CandidateProfileContextManager />

            {isNextGenEnabled && (
                <div className="mt-8">
                    <NextGenCalibration />
                </div>
            )}
        </SharedPageLayout>
    );
};

export default ApplicationProfilePage;
