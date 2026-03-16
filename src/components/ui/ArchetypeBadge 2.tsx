import React from 'react';
import { Target, User, TrendingUp, Zap } from 'lucide-react';
import type { CareerArchetype } from '../../utils/archetypeUtils';

interface ArchetypeBadgeProps {
    archetype: CareerArchetype;
}

export const ArchetypeBadge: React.FC<ArchetypeBadgeProps> = ({ archetype }) => {
    const Icon = archetype.category === 'role' ? Target :
        archetype.category === 'industry' ? User :
            archetype.category === 'seniority' ? TrendingUp : Zap;

    const colorClasses: Record<string, string> = {
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
        amber: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
        pink: 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-500/10 dark:text-pink-400 dark:border-pink-500/20',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
        orange: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
        violet: 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20',
        blue: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    };

    const colorClass = colorClasses[archetype.color] || colorClasses.blue;

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 shadow-sm group ${colorClass}`}>
            <Icon className="w-3 h-3 group-hover:rotate-12 transition-transform" />
            <span>{archetype.name}</span>
        </div>
    );
};
