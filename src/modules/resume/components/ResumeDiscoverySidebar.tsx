import React from 'react';
import { Plus, ArrowRightLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { ExperienceBlock, ResumeProfile, ResumeSuggestion } from '../types';
import type { CustomSkill } from '../../skills/types';
import { Card } from '../../../components/ui/Card';
import { ROUTES } from '../../../constants';
import { Storage } from '../../../services/storageService';
import { useSkillDiscovery } from '../hooks/useSkillDiscovery';

interface ResumeDiscoverySidebarProps {
    initialResume: ResumeProfile;
    blocks: ExperienceBlock[];
    skills: CustomSkill[];
    onApplySuggestion: (suggestion: ResumeSuggestion) => void;
    onDismissSuggestion: (id: string) => void;
    onSkillsUpdated: (skills: CustomSkill[]) => void;
}

export const ResumeDiscoverySidebar: React.FC<ResumeDiscoverySidebarProps> = ({
    initialResume,
    blocks,
    skills,
    onApplySuggestion,
    onDismissSuggestion,
    onSkillsUpdated,
}) => {
    const navigate = useNavigate();
    const { verifiedSkills, uniqueDiscovered } = useSkillDiscovery(blocks, skills);

    return (
        <aside className="hidden lg:block sticky top-32 w-80 shrink-0 space-y-6 no-print pt-14">
            {/* Saved resume suggestions */}
            {initialResume.suggestedUpdates && initialResume.suggestedUpdates.length > 0 && (
                <Card variant="premium" className="p-5 border-neutral-100 dark:border-neutral-900/30 bg-neutral-50/10 dark:bg-neutral-950/5">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex flex-col">
                            <h3 className="text-[10px] font-black text-neutral-500 tracking-widest leading-none mb-1">Saved resume suggestions</h3>
                            <p className="text-[9px] text-neutral-400 font-bold tracking-tight">Review before updating your resume</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {initialResume.suggestedUpdates.map((suggestion) => (
                            <div key={suggestion.id} className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-500/10 space-y-2 group/sug">
                                <div className="text-[11px] font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                                    {suggestion.suggestion}
                                </div>
                                {suggestion.impact && (
                                    <p className="text-[9px] text-neutral-500 leading-relaxed italic">{suggestion.impact}</p>
                                )}
                                <div className="flex items-center gap-2 pt-1 border-t border-neutral-50 dark:border-neutral-800">
                                    <button
                                        onClick={() => onApplySuggestion(suggestion)}
                                        className="px-2 py-1 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg text-[9px] font-black tracking-tight transition-all"
                                    >
                                        Apply
                                    </button>
                                    <button
                                        onClick={() => onDismissSuggestion(suggestion.id)}
                                        className="px-2 py-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-[9px] font-black tracking-tight transition-all"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Verified Strengths */}
            <Card variant="premium" className="p-5 border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] font-black text-emerald-500 tracking-tight flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                        Verified Strengths
                    </div>
                    <button
                        onClick={() => navigate(ROUTES.SKILLS)}
                        className="text-[9px] font-black text-neutral-500 hover:text-neutral-600 flex items-center gap-1 transition-colors"
                    >
                        Manage
                        <ArrowRightLeft className="w-2.5 h-2.5" />
                    </button>
                </div>

                {verifiedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {verifiedSkills.map(s => {
                            const isExpert = s.proficiency === 'expert';
                            const isComfortable = s.proficiency === 'comfortable';
                            const borderColor = isExpert ? 'border-emerald-100 dark:border-emerald-500/20' :
                                isComfortable ? 'border-orange-100 dark:border-orange-500/20' :
                                    'border-neutral-100 dark:border-neutral-800';
                            const dotColor = isExpert ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                isComfortable ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' :
                                    'bg-neutral-300';

                            return (
                                <div key={s.id} className={`flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-neutral-900 border ${borderColor} rounded-xl shadow-sm transition-all duration-300`}>
                                    <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                                        {s.name}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        {s.evidence ? (
                                            <div title={`Verified ${s.proficiency}`} className="flex items-center">
                                                <Check className={`w-2.5 h-2.5 stroke-[3] ${isExpert ? 'text-emerald-500' :
                                                    isComfortable ? 'text-orange-500' :
                                                        'text-neutral-500'
                                                    }`} />
                                            </div>
                                        ) : (
                                            <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} title={s.proficiency} />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-[10px] text-neutral-400 italic">No verified strengths detected yet.</p>
                )}
            </Card>

            {/* Discovered Keywords */}
            {uniqueDiscovered.length > 0 && (
                <Card variant="premium" className="p-5 border-neutral-100 dark:border-neutral-800">
                    <div className="text-[10px] font-black text-neutral-500 tracking-tight mb-4 flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-neutral-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                        Discovered Keywords
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {uniqueDiscovered.map(s => (
                            <button
                                key={s}
                                onClick={async () => {
                                    const newSkill = await Storage.saveSkill({
                                        name: s,
                                        proficiency: 'learning'
                                    });
                                    onSkillsUpdated([...skills, newSkill]);
                                }}
                                className="group flex items-center gap-2 px-3 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-500 hover:ring-1 hover:ring-neutral-500/20 transition-all shadow-sm"
                            >
                                <span className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                                    {s}
                                </span>
                                <Plus className="w-3 h-3 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                            </button>
                        ))}
                    </div>
                </Card>
            )}

            {verifiedSkills.length === 0 && uniqueDiscovered.length === 0 && (
                <Card variant="premium" className="p-5 border-neutral-100 dark:border-neutral-800">
                    <p className="text-[10px] text-neutral-400 italic">Add more details to reveal your skill matrix.</p>
                </Card>
            )}
        </aside>
    );
};
