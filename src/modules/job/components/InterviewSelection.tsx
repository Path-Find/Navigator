import { Target, MessageSquare, AlertCircle, UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../constants';
import { BentoCard } from '../../../components/ui/BentoCard';
import { SharedPageLayout } from '../../../components/common/SharedPageLayout';
import { PageHeader } from '../../../components/ui/PageHeader';

interface SelectionProps {
    limitError: string | null;
    handleStartGeneral: () => Promise<void>;
    handleStartTailored: () => Promise<void>;
    handleStartProfile: () => Promise<void>;
}

export const InterviewSelection = ({ limitError, handleStartGeneral, handleStartTailored, handleStartProfile }: SelectionProps) => {
    const navigate = useNavigate();
    return (
        <SharedPageLayout className="theme-job" spacing="compact" maxWidth="6xl">
            <PageHeader
                title="Interview Advisor"
                subtitle="Master your narrative with personalized mock sessions"
                variant="simple"
                className="mb-8"
            />

            {limitError && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-2xl flex items-center gap-3 text-orange-700 dark:text-orange-400 text-sm font-bold"
                >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{limitError}</span>
                    <button
                        onClick={() => navigate(ROUTES.PLANS)}
                        className="ml-auto px-4 py-1.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
                    >
                        Upgrade
                    </button>
                </motion.div>
            )}

            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
                    {/* General Session Card */}
                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both">
                        <BentoCard
                            id="general"
                            icon={MessageSquare}
                            title="Common questions"
                            description="Practice common interview questions and build strong STAR answers."
                            variant="compact"
                            actionLabel="Practice Now"
                            onAction={handleStartGeneral}
                            previewContent={
                                <ul className="space-y-3 pt-2">
                                    {[
                                        'Common behavioral questions',
                                        'STAR method training',
                                        'Instant AI feedback'
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-neutral-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            }
                        />
                    </div>

                    {/* Tailored Session Card */}
                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 fill-mode-both">
                        <BentoCard
                            id="tailored"
                            icon={Target}
                            title="Specific job practice"
                            description="Practice questions tailored to a job you have analyzed."
                            variant="compact"
                            actionLabel="Launch Mock"
                            onAction={handleStartTailored}
                            previewContent={
                                <ul className="space-y-3 pt-2">
                                    {[
                                        'Role-specific questions',
                                        'Real-time simulation',
                                        'Deep performance analysis'
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-neutral-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            }
                        />
                    </div>

                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-both">
                        <BentoCard
                            id="profile"
                            icon={UserRound}
                            title="Build your profile"
                            description="Answer a few optional questions so applications can reflect your goals and experience."
                            variant="compact"
                            actionLabel="Start Profile Interview"
                            onAction={handleStartProfile}
                            previewContent={
                                <ul className="space-y-3 pt-2">
                                    {[
                                        'Save your career direction',
                                        'Capture stories beyond your resume',
                                        'Review before anything is saved'
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-neutral-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            }
                        />
                    </div>

                </div>
            </div>
        </SharedPageLayout >
    );
};
