import React from 'react';
import { UserCircle, Target } from 'lucide-react';

const ArchetypeUpdatePreview: React.FC = () => {
    return (
        <div className="w-full flex flex-col h-24 justify-center gap-4 animate-in fade-in duration-700 overflow-hidden">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-500/10 flex items-center justify-center text-neutral-500">
                    <UserCircle className="w-4 h-4" />
                </div>
                <div className="h-2 w-24 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl border border-neutral-500/20 bg-neutral-50/10 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                    <div className="h-1.5 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                </div>
                <div className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 opacity-40 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                    <div className="h-1.5 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                </div>
            </div>

            <div className="mt-auto flex items-center gap-2 text-[10px] font-bold text-neutral-500 leading-none">
                <Target className="w-3 h-3" />
                Refine trajectory
            </div>
        </div>
    );
};

export default ArchetypeUpdatePreview;
