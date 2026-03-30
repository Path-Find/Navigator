import { Target, Zap, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { BentoCard } from '../../../components/ui/BentoCard';
import { FEATURE_COLORS } from '../../../featureRegistry';
import { SharedPageLayout } from '../../../components/common/SharedPageLayout';
import { PageHeader } from '../../../components/ui/PageHeader';

interface SelectionProps {
    limitError: string | null;
    handleStartGeneral: () => Promise<void>;
    handleStartTailored: () => Promise<void>;
}

export const InterviewSelection = ({ limitError, handleStartGeneral, handleStartTailored }: SelectionProps) => {
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {/* General Session Card */}
                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both">
                        <BentoCard
                            id="general"
                            icon={MessageSquare}
                            title="Behavioral Training"
                            description="Master common behavioral questions and the STAR method for any interview context."
                            color={FEATURE_COLORS.indigo}
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
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
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
                            title="Role-Specific Mock"
                            description="Practice with high-precision questions generated for a specific job you've analyzed."
                            color={FEATURE_COLORS.violet}
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
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            }
                        />
                    </div>

                    {/* Prep Tips Card */}
                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-both">
                        <BentoCard
                            id="tips"
                            icon={Zap}
                            title="Preparation Tips"
                            description="Logic and strategy to differentiate your narrative and maximize impact."
                            color={FEATURE_COLORS.amber}
                            previewContent={
                                <div className="space-y-4 pt-2">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                                            <Target className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-neutral-900 dark:text-white">Master the 'Why'</p>
                                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">Focus on business impact, not tasks.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                                            <Zap className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-neutral-900 dark:text-white">Quantify Success</p>
                                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">Use numbers like 40% reduction.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
                                            <Sparkles className="w-4 h-4 text-amber-500" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[11px] font-black text-neutral-900 dark:text-white">STAR+ Method</p>
                                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">S-T-A-R + Learning/Impact.</p>
                                        </div>
                                    </div>
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>
        </SharedPageLayout >
    );
};
