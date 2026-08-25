import React from 'react';

interface SkillPillProps {
    name: string;
    proficiency?: 'learning' | 'comfortable' | 'expert';
    /** Override dot and border colours when proficiency is not available */
    variant?: 'default' | 'indigo';
}

export const SkillPill: React.FC<SkillPillProps> = ({ name, proficiency, variant = 'default' }) => {
    const isExpert = proficiency === 'expert';
    const isComfortable = proficiency === 'comfortable';

    const borderColor = proficiency
        ? isExpert
            ? 'border-emerald-200 dark:border-emerald-800/50'
            : isComfortable
                ? 'border-orange-200 dark:border-orange-800/50'
                : 'border-neutral-200 dark:border-neutral-800'
        : variant === 'indigo'
            ? 'border-neutral-200 dark:border-neutral-800/50'
            : 'border-neutral-200 dark:border-neutral-800';

    const dotColor = proficiency
        ? isExpert
            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
            : isComfortable
                ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                : 'bg-neutral-300 dark:bg-neutral-600'
        : variant === 'indigo'
            ? 'bg-neutral-300 dark:bg-neutral-600'
            : 'bg-neutral-300 dark:bg-neutral-600';

    return (
        <div className={`flex items-center gap-2.5 px-3.5 py-1.5 bg-white dark:bg-neutral-900 border rounded-xl ${borderColor}`}>
            <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tracking-tight whitespace-nowrap">
                {name}
            </span>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
        </div>
    );
};
