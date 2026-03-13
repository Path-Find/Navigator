import React from 'react';
import { Trash2, Check } from 'lucide-react';
import type { CustomSkill } from '../../types';

interface SkillCardProps {
    skill: CustomSkill;
    onDelete: (name: string) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, onDelete }) => {
    const isExpert = skill.proficiency === 'expert';
    const isComfortable = skill.proficiency === 'comfortable';

    return (
        <div
            className={`group flex items-center gap-2.5 px-3.5 py-1.5 bg-white dark:bg-neutral-900 border rounded-xl hover:shadow-md transition-all duration-300 relative ${isExpert ? 'border-emerald-200 dark:border-emerald-800/50 hover:border-emerald-400' :
                isComfortable ? 'border-orange-200 dark:border-orange-800/50 hover:border-orange-400' :
                    'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400'
                }`}
        >
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tracking-tight whitespace-nowrap">
                    {skill.name}
                </span>

                <div className="flex items-center gap-1.5 ml-0.5">
                    {/* Unified Proficiency & Verification Indicator */}
                    {skill.evidence ? (
                        <div title={`Verified ${skill.proficiency}`} className="flex items-center">
                            <Check className={`w-3.5 h-3.5 stroke-[3.5] ${isExpert ? 'text-emerald-500' :
                                isComfortable ? 'text-orange-500' :
                                    'text-neutral-500'
                                }`} />
                        </div>
                    ) : (
                        <div
                            className={`flex-shrink-0 w-2 h-2 rounded-full ${isExpert ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                isComfortable ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]' :
                                    'bg-neutral-300 dark:bg-neutral-600'
                                }`}
                            title={skill.proficiency}
                        />
                    )}
                </div>
            </div>

            {/* Delete Button (Appears on Hover) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(skill.name);
                }}
                className="w-0 group-hover:w-5 overflow-hidden transition-all duration-300 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 flex items-center justify-center -mr-1"
                title="Remove skill"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};
