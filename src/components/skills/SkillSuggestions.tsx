import React from 'react';
import { Plus } from 'lucide-react';

interface SkillSuggestionsProps {
    suggestions: Array<{ name: string; description: string }>;
    onAddSuggestion: (name: string, description?: string) => void;
    onClear: () => void;
}

export const SkillSuggestions: React.FC<SkillSuggestionsProps> = ({ suggestions, onAddSuggestion }) => {
    if (suggestions.length === 0) return null;

    return (
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-4 px-1">
                <h2 className="text-sm font-black text-neutral-400">Skill Discoveries</h2>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    <span className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-indigo-600 dark:text-indigo-400 text-[10px] font-black tracking-tight">AI found {suggestions.length}</span>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {suggestions.map((skill, i) => (
                    <button
                        key={i}
                        onClick={() => onAddSuggestion(skill.name, skill.description)}
                        className="group flex items-center gap-2.5 px-3.5 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500/30 transition-all shadow-sm group"
                        title={skill.description}
                    >
                        <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">{skill.name}</span>
                        <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-indigo-600 transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    );
};
