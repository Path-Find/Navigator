import React from 'react';
import { PenTool } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const CoverLettersPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full px-8 h-24 flex items-center justify-center">
        <div className="relative w-32 h-20 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-100 dark:border-neutral-700 overflow-hidden p-2.5 group-hover:scale-110 transition-transform duration-700 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 mb-1">
                <PenTool className={`w-3 h-3 ${color.text}`} />
                <div className="h-2 w-16 bg-neutral-100 dark:bg-neutral-700 rounded-full" />
            </div>
            <div className="space-y-1">
                {[1, 2, 3].map(i => (
                    <div key={i} className={`h-1 bg-neutral-50 dark:bg-neutral-700/50 rounded-full ${i === 3 ? 'w-2/3' : 'w-full'}`} />
                ))}
            </div>
            <div className="mt-2 space-y-1">
                {[1, 2].map(i => (
                    <div key={i} className={`h-1 bg-neutral-50 dark:bg-neutral-700/50 rounded-full ${i === 2 ? 'w-1/2' : 'w-full'}`} />
                ))}
            </div>
            <div className={`absolute bottom-0 right-0 w-12 h-12 ${color.bg} blur-xl opacity-40`} />
        </div>
    </div>
);

export default CoverLettersPreview;
