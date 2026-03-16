import React from 'react';
import { Sparkles, Plus, ShieldCheck, TrendingUp } from 'lucide-react';
import type { CustomSkill } from '../../types';
import { BentoCard } from '../ui/BentoCard';
import { FEATURE_COLORS } from '../../featureRegistry';

interface SkillsStatsProps {
    skills: CustomSkill[];
    onSuggestSkills: () => void;
    isSuggesting: boolean;
    onAddSkill: () => void;
    onVerifySkills?: () => void;
    unverifiedCount?: number;
}

export const SkillsStats: React.FC<SkillsStatsProps> = ({
    skills,
    onSuggestSkills,
    isSuggesting,
    onAddSkill,
    onVerifySkills,
    unverifiedCount = 0
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {/* Stat: Skill Analytics (Adjusted) */}
            <BentoCard
                id="skill-stats"
                icon={TrendingUp}
                title="Skills"
                description="Overview of your current technical proficiency."
                color={FEATURE_COLORS.indigo}
                previewContent={
                    <div className="flex items-center justify-center gap-6 h-16 w-full relative">
                        <div className="flex flex-col items-center relative">
                            <div className="absolute -inset-4 bg-indigo-500/10 blur-xl rounded-full scale-150 group-hover:bg-indigo-500/20 transition-all duration-700" />
                            <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter leading-none hover:scale-110 transition-transform duration-500 drop-shadow-2xl relative z-10">{skills.length}</div>
                            <div className="text-[9px] tracking-[0.2em] font-black text-neutral-400 dark:text-white/40 mt-2 relative z-10">ACTIVE</div>
                        </div>

                        <div className="w-px h-10 bg-gradient-to-b from-transparent via-neutral-200 dark:via-white/20 to-transparent shadow-[0_0_8px_rgba(0,0,0,0.05)]" />

                        <div className="flex flex-col items-center relative">
                            <div className="absolute -inset-4 bg-amber-500/10 blur-xl rounded-full scale-110 group-hover:bg-amber-500/20 transition-all duration-700" />
                            <div className="text-4xl font-black text-amber-500 tracking-tighter leading-none hover:scale-110 transition-transform duration-500 drop-shadow-2xl relative z-10">
                                {skills.filter(s => s.proficiency === 'expert').length}
                            </div>
                            <div className="text-[9px] tracking-[0.2em] font-black text-neutral-400 dark:text-white/40 mt-2 relative z-10">EXPERT</div>
                        </div>
                    </div>
                }
            />

            {/* Action: Add Skill */}
            <BentoCard
                id="add-skill"
                icon={Plus}
                title="Add Skill"
                description="Manually expand your skill tracking."
                onAction={onAddSkill}
                actionLabel="Add New"
                color={FEATURE_COLORS.emerald}
                previewContent={
                    <div className="relative w-full h-20 flex items-center justify-center overflow-hidden">
                        {/* 3D Stacked Glass Effect */}
                        <div className="relative group-hover:scale-110 group-hover:-rotate-3 transition-all duration-700 ease-out">
                            {/* Bottom Tile */}
                            <div className="absolute top-2 left-2 w-12 h-12 bg-emerald-500/10 rounded-xl border border-emerald-500/20 blur-[1px]" />
                            {/* Middle Tile */}
                            <div className="absolute top-1 left-1 w-12 h-12 bg-emerald-500/20 rounded-xl border border-emerald-500/30 backdrop-blur-[2px]" />
                            {/* Top Tile */}
                            <div className="relative w-12 h-12 bg-white dark:bg-neutral-800 rounded-xl border border-emerald-500/40 shadow-2xl flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-transparent to-emerald-500/10" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent)] opacity-40" />
                                <Plus className="w-6 h-6 text-emerald-500 relative z-10" />
                            </div>
                        </div>

                        {/* Floating ambient particles */}
                        <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-emerald-400/40 rounded-full animate-pulse" />
                        <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-emerald-300/30 rounded-full animate-bounce duration-[3000ms]" />
                    </div>
                }
            />

            {/* Action: Verify Skills (Conditional) */}
            <BentoCard
                id="verify-skills"
                icon={ShieldCheck}
                title="Verify Skill"
                description={unverifiedCount > 0 ? `Prove expertise for ${unverifiedCount} skills.` : "All skills verified by AI coach."}
                onAction={onVerifySkills}
                actionLabel={unverifiedCount > 0 ? "Start Proof" : undefined}
                color={FEATURE_COLORS.amber}
                previewContent={
                    <div className="relative w-full h-20 flex items-center justify-center">
                        {/* Angular Diamond Glow */}
                        <div className="absolute inset-0 bg-amber-500/5 blur-[30px] rounded-2xl rotate-45 scale-75 group-hover:bg-amber-500/10 transition-all duration-700" />

                        <div className="relative group-hover:scale-105 transition-transform duration-500">
                            {/* Sharp Diamond Frames - No more circles */}
                            <div className={`absolute inset-0 border border-amber-500/20 rounded-lg rotate-45 scale-[1.3] ${unverifiedCount > 0 ? 'animate-[pulse_4s_ease-in-out_infinite]' : 'opacity-10'}`} />
                            <div className={`absolute inset-0 border border-amber-500/10 rounded-lg rotate-[22.5deg] scale-[1.5] ${unverifiedCount > 0 ? 'animate-[pulse_6s_ease-in-out_infinite_1s]' : 'opacity-5'}`} />

                            {/* Shield Body - Slightly more angular container */}
                            <div className="relative p-2.5 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl border-t border-l border-amber-500/30 border-b border-r border-amber-500/10 shadow-xl overflow-hidden group-hover:border-amber-500/50 transition-colors">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/15 via-transparent to-transparent" />
                                <ShieldCheck className={`w-7 h-7 relative z-10 ${unverifiedCount > 0 ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-neutral-400 opacity-40'}`} />
                            </div>

                            {/* Status Indicator */}
                            {unverifiedCount > 0 && (
                                <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center z-20">
                                    <div className="absolute w-4 h-4 bg-red-500/20 rounded-full animate-ping" />
                                    <div className="w-2 h-2 bg-red-500 rounded-full border border-white dark:border-neutral-900 shadow-md" />
                                </div>
                            )}
                        </div>
                    </div>
                }
            />

            {/* Action: Skill Discovery */}
            <BentoCard
                id="skill-discovery"
                icon={Sparkles}
                title="Discover Skill"
                description="Extract latent skills from your resumes."
                onAction={isSuggesting ? undefined : onSuggestSkills}
                actionLabel={isSuggesting ? "Finding..." : "Discover"}
                color={FEATURE_COLORS.violet}
                previewContent={
                    <div className="relative w-full h-20 flex items-center justify-center overflow-hidden">
                        {/* Asymmetrical Nebula Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)] group-hover:bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.12)_0%,transparent_70%)] transition-all duration-1000 rotate-12" />
                        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-violet-500/5 blur-3xl opacity-40 group-hover:translate-x-4 transition-transform duration-1000" />

                        {/* Organic Sparkle Field - No more concentric circles */}
                        <div className="relative group-hover:scale-110 transition-transform duration-700">
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-amber-400 blur-xl opacity-10 animate-pulse" />

                            {/* Icons stack with randomized placement */}
                            <div className="relative scale-90">
                                <Sparkles className={`w-11 h-11 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)] ${isSuggesting ? 'animate-spin' : 'animate-[bounce_6s_infinite]'}`} />
                                <Sparkles className="absolute -top-4 left-6 w-3 h-3 text-violet-400/40 animate-pulse delay-75" />
                                <Sparkles className="absolute top-2 -left-6 w-4 h-4 text-amber-300/30 animate-bounce" />
                                <Sparkles className="absolute -bottom-3 right-2 w-2.5 h-2.5 text-violet-300/40 animate-ping delay-200" />
                            </div>
                        </div>
                    </div>
                }
            />
        </div>
    );
};
