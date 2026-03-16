import React from 'react';
import {
    Users,
    TrendingUp,
    ArrowLeft,
    Target,
    Briefcase,
    GraduationCap,
    Sparkles,
    CheckCircle2
} from 'lucide-react';
import type { RoleModelProfile, ResumeProfile, ExperienceBlock } from '../../../types';

interface RoleModelComparisonProps {
    userProfile: ResumeProfile;
    roleModel: RoleModelProfile;
    onBack: () => void;
}

export const RoleModelComparison: React.FC<RoleModelComparisonProps> = ({
    userProfile,
    roleModel,
    onBack
}) => {
    // Sort experience by date (descending)
    const sortedUserExp = [...userProfile.blocks].filter(b => b.type === 'work' || b.type === 'education').sort((a, b) => {
        const getYear = (range: string) => {
            const match = range.match(/\d{4}/);
            return match ? parseInt(match[0]) : 0;
        };
        return getYear(b.dateRange) - getYear(a.dateRange);
    });

    const sortedRoleModelExp = [...roleModel.experience].filter(b => b.type === 'work' || b.type === 'education').sort((a, b) => {
        const getYear = (range: string) => {
            const match = range.match(/\d{4}/);
            return match ? parseInt(match[0]) : 0;
        };
        return getYear(b.dateRange) - getYear(a.dateRange);
    });

    return (
        <div className="fixed inset-0 bg-white dark:bg-neutral-950 z-50 overflow-y-auto animate-in fade-in duration-500">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-100 dark:border-neutral-800 z-10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={onBack}
                            className="p-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition-all group"
                        >
                            <ArrowLeft className="w-5 h-5 text-neutral-500 group-hover:text-emerald-500 transition-colors" />
                        </button>
                        <div>
                            <h2 className="text-xl font-black text-neutral-900 dark:text-white flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                                Trajectory Comparison
                            </h2>
                            <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-0.5 text-left">
                                {userProfile.name} <span className="mx-2 text-neutral-300">vs</span> {roleModel.name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative">
                    {/* Background Connector (Desktop) */}
                    <div className="absolute left-1/2 top-40 bottom-40 w-px bg-neutral-100 dark:bg-neutral-800 hidden lg:block -translate-x-1/2" />

                    {/* Column 1: My Trajectory (A) */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight text-left">Your Journey</h3>
                                <p className="text-xs text-neutral-500 font-bold tracking-widest uppercase text-left">Point A (Current)</p>
                            </div>
                        </div>

                        <div className="space-y-12 pl-4 border-l-2 border-emerald-500/10 dark:border-emerald-500/5">
                            {sortedUserExp.map((block, i) => (
                                <TimelineBlock
                                    key={i}
                                    block={block}
                                    variant="user"
                                    index={i}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Role Model Trajectory (B) */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight text-left">{roleModel.name}</h3>
                                <p className="text-xs text-neutral-500 font-bold tracking-widest uppercase text-left">Point B (Target Pattern)</p>
                            </div>
                        </div>

                        <div className="space-y-12 pl-4 border-l-2 border-indigo-500/10 dark:border-indigo-500/5">
                            {sortedRoleModelExp.map((block, i) => (
                                <TimelineBlock
                                    key={i}
                                    block={block}
                                    variant="role-model"
                                    index={i}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bridging Strategy Summary */}
                <div className="mt-24 p-12 bg-neutral-900 dark:bg-black rounded-[4rem] text-white relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-6" />
                        <h3 className="text-4xl font-black tracking-tight mb-4">The Bridge</h3>
                        <p className="text-neutral-400 font-bold text-lg leading-relaxed mb-10">
                            Researching {roleModel.name}'s path across {roleModel.experience.length} roles reveals a critical pattern for your next leap.
                        </p>
                        <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-4">Executive Summary</div>
                            <p className="text-sm font-medium leading-relaxed italic">
                                "{roleModel.careerSnapshot}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface TimelineBlockProps {
    block: ExperienceBlock;
    variant: 'user' | 'role-model';
    index: number;
}

const TimelineBlock: React.FC<TimelineBlockProps> = ({ block, variant, index }) => {
    const isEdu = block.type === 'education';
    const Icon = isEdu ? GraduationCap : Briefcase;

    return (
        <div className="relative group">
            {/* Dot */}
            <div className={`absolute -left-[1.35rem] top-1.5 w-6 h-6 rounded-full bg-white dark:bg-neutral-950 border-2 flex items-center justify-center z-10 transition-all ${variant === 'user' ? 'border-emerald-500 hover:bg-emerald-500' : 'border-indigo-500 hover:bg-indigo-500'
                }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${variant === 'user' ? 'bg-emerald-500 group-hover:bg-white' : 'bg-indigo-500 group-hover:bg-white'
                    }`} />
            </div>

            <div className="pl-6">
                <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-2">
                    {block.dateRange}
                    {variant === 'role-model' && index < 2 && (
                        <span className="px-1.5 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-md text-[8px] font-black">LEAP POINT</span>
                    )}
                </div>
                <div className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group/card overflow-hidden relative text-left">
                    <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover/card:opacity-10 transition-opacity`}>
                        <Icon className="w-16 h-16" />
                    </div>

                    <h4 className="text-lg font-black text-neutral-900 dark:text-white leading-tight mb-1">{block.title}</h4>
                    <div className="text-sm font-bold text-neutral-500 dark:text-neutral-400 mb-4 flex items-center gap-2">
                        {block.organization}
                    </div>

                    <ul className="space-y-3">
                        {block.bullets.map((bullet, idx) => (
                            <li key={idx} className="flex gap-3 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                                <CheckCircle2 className={`w-3 h-3 mt-0.5 shrink-0 ${variant === 'user' ? 'text-emerald-500' : 'text-indigo-500'}`} />
                                {bullet}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
