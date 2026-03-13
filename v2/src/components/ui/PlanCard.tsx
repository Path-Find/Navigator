import { motion, type Variants } from 'framer-motion';
import { Check, ArrowRight, Info, Loader2, Sparkles } from 'lucide-react';
import { SimpleTooltip } from './SimpleTooltip';

interface PlanCardProps {
    title: string;
    price: string;
    features: { name: string; desc: string; isComingSoon?: boolean }[];
    isPopular?: boolean;
    buttonText?: string;
    accentColor?: 'indigo' | 'emerald' | 'amber' | 'slate' | 'violet';
    limits?: {
        analyses: string;
        analysesPeriod: string;
        emails: number;
        emailPeriod?: string;
        mentors: number | string;
        mentorPeriod?: string;
        interviews: number | string;
    };
    subText?: string;
    onSelect: () => void;
    isLoading?: boolean;
    variant?: 'default' | 'compact';
}

export const PlanCard = ({
    title,
    price,
    features,
    isPopular = false,
    buttonText = 'Select Plan',
    accentColor = 'indigo',
    limits,
    subText,
    onSelect,
    isLoading = false,
    variant = 'default'
}: PlanCardProps) => {
    const isEmerald = accentColor === 'emerald';
    const isIndigo = accentColor === 'indigo';
    const isViolet = accentColor === 'violet';
    const isCompact = variant === 'compact';

    const containerVariants: Variants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        hover: { y: -8, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 10 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className={`relative flex flex-col rounded-[2.5rem] border transition-all duration-500 bg-white dark:bg-neutral-900/60 backdrop-blur-3xl h-full group
                ${isCompact ? 'p-6' : 'p-8'}
                ${isPopular
                    ? 'border-emerald-500/30 dark:border-emerald-500/20 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/10'
                    : 'border-neutral-200 dark:border-neutral-800'
                } `}
        >
            {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[11px] font-bold rounded-full shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" />
                    Recommended
                </div>
            )}

            <div className={`${isCompact ? 'mb-6' : 'mb-8'} text-center sm:text-left`}>
                <h3 className={`${isCompact ? 'text-xl' : 'text-2xl'} font-black text-neutral-900 dark:text-white mb-1 tracking-tight`}>
                    {title}
                </h3>
                <div className="flex items-baseline gap-1 justify-center sm:justify-start">
                    <span className={`${isCompact ? 'text-4xl' : 'text-5xl'} font-black text-neutral-900 dark:text-white`}>
                        {price}
                    </span>
                    {price !== '$0' && <span className="text-neutral-500 dark:text-neutral-400 text-sm font-bold">/mo</span>}
                </div>
                {subText ? (
                    <div className={`mt-2 text-[11px] font-bold
                        ${isEmerald ? 'text-emerald-500/80' :
                            isViolet ? 'text-violet-500/80' :
                                isIndigo ? 'text-indigo-500/80' :
                                    'text-neutral-500'
                        } `}>
                        {subText}
                    </div>
                ) : !isCompact && (
                    <div className="mt-2 text-[11px] invisible" aria-hidden="true">
                        Spacer
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-grow">
                <div className={`${isCompact ? 'space-y-3 mb-6' : 'space-y-4 mb-8'} `}>
                    {features.map((feature, i) => (
                        <div key={i} className="flex gap-3 text-sm group/item items-start">
                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors
                                ${isEmerald ? 'bg-emerald-500/10 text-emerald-500 group-hover/item:bg-emerald-500 group-hover/item:text-white' :
                                    isIndigo ? 'bg-indigo-500/10 text-indigo-500 group-hover/item:bg-indigo-500 group-hover/item:text-white' :
                                        isViolet ? 'bg-violet-500/10 text-violet-500 group-hover/item:bg-violet-500 group-hover/item:text-white' :
                                            'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'
                                } `}>
                                <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-neutral-900 dark:text-white text-xs leading-tight">
                                    {feature.name}
                                    {feature.isComingSoon && (
                                        <span className="ml-1 text-[10px] font-medium text-neutral-400 dark:text-neutral-500 italic">(Soon)</span>
                                    )}
                                </span>
                                {!isCompact && <span className="text-[10px] text-neutral-500 dark:text-neutral-500 font-medium leading-relaxed mt-0.5">{feature.desc}</span>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Spacer pushes limits + button to bottom */}
                <div className="flex-grow" />

                {/* Usage Limits Section (Only in Default variant) */}
                {!isCompact && limits && (
                    <div className="p-4 rounded-3xl bg-neutral-50/50 dark:bg-neutral-800/20 border border-neutral-100/50 dark:border-neutral-800/30 space-y-3 mb-6">
                        <div className="flex justify-between items-center text-[10px]">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-neutral-400 capitalize tracking-wide">Jobs</span>
                                <SimpleTooltip content="How many jobs you can save and have analyzed. Each job gets a detailed compatibility breakdown.">
                                    <Info className="w-3 h-3 text-neutral-300" />
                                </SimpleTooltip>
                            </div>
                            <span className={`font-black text-neutral-900 dark:text-white transition-colors
                                ${isEmerald ? 'group-hover:text-emerald-500' :
                                    isIndigo ? 'group-hover:text-indigo-500' :
                                        isViolet ? 'group-hover:text-violet-500' :
                                            accentColor === 'amber' ? 'group-hover:text-amber-500' :
                                                'group-hover:text-neutral-500'
                                }`}>
                                {limits.analyses}
                                {limits.analysesPeriod && <span className="text-neutral-300 font-bold ml-0.5">/ {limits.analysesPeriod}</span>}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-neutral-400 capitalize tracking-wide">Alerts</span>
                            </div>
                            <span className="font-black text-neutral-900 dark:text-white">
                                {limits.emails === 0 ? '—' : limits.emails}
                                {limits.emails !== 0 && limits.emailPeriod && <span className="text-neutral-300 font-bold ml-0.5">/ {limits.emailPeriod}</span>}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-neutral-400 capitalize tracking-wide">Mentors</span>
                            </div>
                            <span className="font-black text-neutral-900 dark:text-white">
                                {limits.mentors === Infinity || limits.mentors === 'Unlimited' ? 'Unlimited' : limits.mentors === 0 ? '—' : limits.mentors}
                                {limits.mentors !== 0 && limits.mentors !== Infinity && limits.mentorPeriod && <span className="text-neutral-300 font-bold ml-0.5">/ {limits.mentorPeriod}</span>}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-neutral-400 capitalize tracking-wide">Interviews</span>
                            </div>
                            <span className="font-black text-neutral-900 dark:text-white">
                                {limits.interviews === 0 ? '—' : limits.interviews}
                                {limits.interviews !== 0 && typeof limits.interviews === 'number' && <span className="text-neutral-300 font-bold ml-0.5">/ mo</span>}
                            </span>
                        </div>
                    </div>
                )}

                <button
                    onClick={onSelect}
                    disabled={isLoading}
                    type="button"
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-auto
                        ${isPopular
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25'
                            : isIndigo
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                                : isViolet
                                    ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25'
                                    : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white border border-neutral-200/50 dark:border-neutral-700/50'
                        } `}
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : buttonText}
                    {!isLoading && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
            </div>
        </motion.div>
    );
};

