import React from 'react';
import { Target, ShieldCheck, ArrowRight, UserCircle } from 'lucide-react';

export const ArchetypeUpdatePreview: React.FC = () => {
    return (
        <div className="w-full flex flex-col gap-4 animate-in fade-in duration-700">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <UserCircle className="w-4 h-4" />
                </div>
                <div className="h-2 w-24 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl border border-indigo-500/20 bg-indigo-50/10 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <div className="h-1.5 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                </div>
                <div className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 opacity-40 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                    <div className="h-1.5 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                </div>
            </div>

            <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-indigo-500 uppercase tracking-widest leading-none">
                <Target className="w-3 h-3" />
                Refine trajectory
            </div>
        </div>
    );
};

export const PolicyUpdatePreview: React.FC = () => {
    return (
        <div className="w-full flex flex-col gap-3 animate-in fade-in duration-700">
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-2">
                    <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                    <div className="h-2 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                </div>
            </div>

            <div className="flex justify-end pr-1">
                <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-[0.15em]">
                    Review changes
                    <ArrowRight className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
};
