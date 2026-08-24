import { MessageSquare, AlertCircle, UserRound } from 'lucide-react';
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch max-w-4xl">
                    {/* Practice Card */}
                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both">
                        <BentoCard
                            id="practice"
                            icon={MessageSquare}
                            title="Practice interview"
                            description="Choose whether you want general practice or questions tailored to a specific job."
                            variant="compact"
                            previewContent={
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={event => { event.stopPropagation(); void handleStartGeneral(); }}
                                        className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2.5 text-left text-[11px] font-bold text-neutral-700 dark:text-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                    >
                                        <span className="block">General practice</span>
                                        <span className="block mt-0.5 text-[10px] font-medium text-neutral-400">Common interview questions</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={event => { event.stopPropagation(); void handleStartTailored(); }}
                                        className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-3 py-2.5 text-left text-[11px] font-bold text-neutral-700 dark:text-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                                    >
                                        <span className="block">Specific job practice</span>
                                        <span className="block mt-0.5 text-[10px] font-medium text-neutral-400">Questions for an analyzed job</span>
                                    </button>
                                </div>
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
