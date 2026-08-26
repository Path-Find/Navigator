import { Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ROUTES } from '../../../constants';
import { useNavigate } from 'react-router';

interface SkillInterviewIntroProps {
    isLoading: boolean;
    limitError: string | null;
    usageInfo: { used: number; total: number } | null;
    handleStart: () => void;
    skills: { name: string; proficiency: string }[];
    selectedSkillNames: string[];
    onToggleSkill: (skillName: string) => void;
    maxSelected: number;
    MAX_SKILLS_PER_SESSION: number;
}

export const SkillInterviewIntro = ({ isLoading, limitError, usageInfo, handleStart, skills, selectedSkillNames, onToggleSkill, maxSelected, MAX_SKILLS_PER_SESSION }: SkillInterviewIntroProps) => {
    const navigate = useNavigate();
    return (
        <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col justify-center pb-20"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
                {/* Left: Content */}
                <div className="space-y-8">
                    <div>
                        <h4 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-6 tracking-tight">
                            Skills interview
                        </h4>
                        <p className="text-lg lg:text-xl text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                            I’ll ask one question at a time and give you practical feedback as we go. Some questions may cover more than one skill, so answer with a real example when you can.
                        </p>
                    </div>

                    {limitError && (
                        <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-2xl flex items-center gap-3 text-orange-700 dark:text-orange-400 text-sm font-bold">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <div className="flex-1">
                                <p>{limitError}</p>
                            </div>
                            <button
                                onClick={() => navigate(ROUTES.PLANS)}
                                className="px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shrink-0"
                            >
                                Upgrade
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleStart}
                        disabled={isLoading || !!limitError || selectedSkillNames.length === 0}
                        className="w-full md:w-auto px-10 py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20 flex flex-col items-center gap-1 disabled:opacity-50"
                    >
                        <div className="flex items-center gap-3">
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Sparkles className="w-5 h-5" />
                            )}
                        <span>{isLoading ? 'Preparing questions...' : 'Start interview'}</span>
                        </div>
                        {!isLoading && !limitError && usageInfo && (
                            <span className="text-[10px] opacity-70 uppercase tracking-widest font-bold">
                                {usageInfo.total === Infinity
                                ? 'Unlimited interviews'
                                    : `${usageInfo.used} / ${usageInfo.total} interviews used`}
                            </span>
                        )}
                    </button>
                </div>

                {/* Right: Skills list */}
                <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-8 lg:p-10 rounded-[2.5rem] shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                        <Sparkles className="w-24 h-24 text-emerald-500" />
                    </div>

                    <div className="flex items-center justify-between mb-8">
                        <div className="space-y-1">
                            <div className="text-sm font-bold text-neutral-400 tracking-widest uppercase">
                                Skills to verify
                            </div>
                            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-tight">
                                Choose up to {MAX_SKILLS_PER_SESSION} skills
                            </div>
                        </div>
                            <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                            {selectedSkillNames.length} selected
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                        {[...skills].sort((a, b) => a.name.localeCompare(b.name)).map(s => {
                            const selected = selectedSkillNames.includes(s.name);
                            return <button
                                type="button"
                                key={s.name}
                                onClick={() => onToggleSkill(s.name)}
                                disabled={!selected && selectedSkillNames.length >= maxSelected}
                                className={`px-4 py-2 rounded-2xl text-sm font-semibold shadow-sm transition-colors ${selected
                                    ? 'bg-emerald-50 border border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300'
                                    : 'bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 disabled:opacity-40'}`}
                            >
                                {s.name}
                            </button>;
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
