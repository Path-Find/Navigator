import React from 'react';
import { ShieldCheck } from 'lucide-react';

const PolicyUpdatePreview: React.FC = () => {
    return (
        <div className="w-full h-24 flex flex-col justify-center gap-3 animate-in fade-in duration-700 overflow-hidden">
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-2">
                    <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                    <div className="h-2 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default PolicyUpdatePreview;
