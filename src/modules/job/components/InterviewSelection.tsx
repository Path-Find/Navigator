import { MessageSquare, AlertCircle, UserRound, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../../constants';
import { BentoCard } from '../../../components/ui/BentoCard';
import { FEATURE_COLORS } from '../../../featureRegistry';
import { SharedPageLayout } from '../../../components/common/SharedPageLayout';
import { PageHeader } from '../../../components/ui/PageHeader';
import { InterviewChat } from '../../../components/common/InterviewChat';
import type { ChatMessage } from '../../../components/common/InterviewChat';

interface SelectionProps {
    limitError: string | null;
    handleStartPractice: () => Promise<void>;
    handleStartProfile: () => Promise<void>;
    hasSavedJobs: boolean;
}

export const InterviewSelection = ({ limitError, handleStartPractice, handleStartProfile, hasSavedJobs }: SelectionProps) => {
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch max-w-6xl">
                    {/* Practice Card */}
                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both">
                        <BentoCard
                            id="practice"
                            icon={MessageSquare}
                            title="Practice interview"
                            description={hasSavedJobs
                                ? "Choose general practice or questions tailored to a specific job after you start."
                                : "Start with general practice. Save a job to unlock questions tailored to that role."}
                            color={FEATURE_COLORS.indigo}
                            actionLabel="Start practice"
                            onAction={handleStartPractice}
                            previewContent={
                                <ul className="space-y-3 pt-2">
                                    {['General or job-specific practice', 'STAR guidance when you need it', 'Feedback on each answer'].map(feature => (
                                        <li key={feature} className="flex items-center gap-3 text-[11px] font-bold text-neutral-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
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
                            color={FEATURE_COLORS.emerald}
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

                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-500 fill-mode-both">
                        <BentoCard
                            id="resume-story"
                            icon={FileText}
                            title="Tell a resume story"
                            description="Add the context behind an experience so your applications can explain more than the bullet points."
                            color={FEATURE_COLORS.blue}
                            actionLabel="Choose experience"
                            onAction={() => navigate(`${ROUTES.RESUMES}?interview=1`)}
                            previewContent={(
                                <ul className="space-y-3 pt-2">
                                    {[
                                        'Choose an experience',
                                        'Explain what you actually did',
                                        'Reuse the context in applications'
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-neutral-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        />
                    </div>

                </div>
            </div>
        </SharedPageLayout >
    );
};

export const PracticeModeSelection = ({ onGeneral, onTailored, hasSavedJobs }: { onGeneral: () => void; onTailored: () => void; hasSavedJobs: boolean }) => {
    const messages: ChatMessage[] = [{
        id: 'practice-mode-question',
        role: 'ai',
        content: hasSavedJobs
            ? 'What kind of practice would you like to do?'
            : 'Let\'s start with general practice. Save a job first if you want questions tailored to a specific role.',
        suggestionPills: [
            { id: 'general', label: 'General practice', sublabel: 'Common behavioral questions', onClick: onGeneral, variant: 'action' as const },
            ...(hasSavedJobs ? [{ id: 'tailored', label: 'Specific job practice', sublabel: 'Questions for an analyzed job', onClick: onTailored, variant: 'action' as const }] : []),
        ],
    }];

    return (
        <div className="h-screen w-full flex flex-col items-center bg-neutral-50/50 dark:bg-black overflow-hidden">
            <div className="w-full max-w-4xl flex-1 min-h-0 flex flex-col pt-16">
                <InterviewChat
                    messages={messages}
                    inputValue=""
                    onInputChange={() => undefined}
                    onSubmit={() => undefined}
                    placeholder="Choose an option above to continue..."
                    inputHint="Select an interview type above"
                    inputDisabled
                />
            </div>
        </div>
    );
};
