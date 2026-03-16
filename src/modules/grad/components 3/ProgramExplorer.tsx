import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Filter } from 'lucide-react';
import { ProgramDiscoveryService } from '../services/ProgramDiscoveryService';
import { ProgramCard } from './ProgramCard';
import type { Program } from '../types/discovery';

interface ProgramExplorerProps {
    onSelect?: (program: Program) => void;
}

export const ProgramExplorer: React.FC<ProgramExplorerProps> = ({ onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);

    const results = useMemo(() => {
        return ProgramDiscoveryService.searchPrograms(searchQuery);
    }, [searchQuery]);

    const handleAnalyze = async (program: Program) => {
        setIsAnalyzing(program.id);
        // Simulate deep analysis phase
        await new Promise(r => setTimeout(r, 800));
        setIsAnalyzing(null);
        onSelect?.(program);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Search Header */}
            <div className="max-w-3xl mx-auto text-center space-y-6">
                {/* Removed Grounded Program Library Label */}


                <h2 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                    Find your next <span className="text-emerald-600 italic">milestone.</span>
                </h2>

                <div className="relative group">
                    <div className="absolute inset-0 bg-emerald-500/10 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <input
                        type="text"
                        placeholder="Search programs, institutions, or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-8 py-5 bg-white dark:bg-neutral-900 border-2 border-neutral-100 dark:border-neutral-800 rounded-[2rem] text-lg font-bold focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/5 transition-all outline-none shadow-2xl relative z-10"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 z-10">
                        {searchQuery && (
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                {results.length} found
                            </span>
                        )}
                        <Search className="w-6 h-6 text-neutral-300 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {['Urban Planning', 'Sustainability', 'Computer Science', 'Design'].map(tag => (
                        <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="group flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:shadow-md hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 text-sm font-bold text-neutral-800 dark:text-neutral-200 tracking-tight whitespace-nowrap"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map(program => (
                    <ProgramCard
                        key={program.id}
                        program={program}
                        onAnalyze={handleAnalyze}
                        isAnalyzing={isAnalyzing === program.id}
                    />
                ))}
            </div>

            {results.length === 0 && (
                <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-[3rem] border border-dashed border-neutral-200 dark:border-neutral-800">
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center text-neutral-400 mx-auto mb-4">
                        <Filter className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No programs found</h3>
                    <p className="text-neutral-500 font-medium">Try a broader search or different keywords.</p>
                </div>
            )}

            {/* Request Addition Section */}
            <div className="max-w-4xl mx-auto p-12 bg-neutral-900 dark:bg-black rounded-[3rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
                    <div className="space-y-2 text-center md:text-left">
                        <h4 className="text-2xl font-black text-white">Missing a program?</h4>
                        <p className="text-neutral-400 font-medium max-w-md">Our index is curated by hand. If you know of a program we've missed, let us know and we'll vet it.</p>
                    </div>
                    <button className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center gap-2 shrink-0">
                        Request Addition
                        <Sparkles className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
