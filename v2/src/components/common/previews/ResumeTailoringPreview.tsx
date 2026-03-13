import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const ResumeTailoringPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full h-24 flex items-center justify-center">
        <div className={`absolute inset-0 ${color.glow} blur-3xl opacity-10`} />
        <div className="relative flex items-center gap-2">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700 p-1.5 w-14 opacity-50">
                <div className="space-y-1">
                    {[1, 2].map(i => <div key={i} className="h-0.5 bg-neutral-200 dark:bg-neutral-600 rounded-full w-full" />)}
                    <div className="h-0.5 bg-red-300 dark:bg-red-500/40 rounded-full w-2/3 line-through" />
                </div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
                <RefreshCw className={`w-3 h-3 ${color.text} animate-spin`} style={{ animationDuration: '3s' }} />
            </div>
            <div className={`bg-white dark:bg-neutral-800 rounded-lg shadow-lg border-2 ${color.accent} p-1.5 w-14 group-hover:scale-110 transition-transform duration-500`}>
                <div className="space-y-1">
                    {[1, 2].map(i => <div key={i} className="h-0.5 bg-neutral-200 dark:bg-neutral-600 rounded-full w-full" />)}
                    <div className={`h-0.5 ${color.iconBg} rounded-full w-full`} />
                </div>
                <div className={`mt-1 text-[5px] font-black ${color.text} text-center`}>TAILORED</div>
            </div>
        </div>
    </div>
);

export default ResumeTailoringPreview;
