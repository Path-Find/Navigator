import React from 'react';
import { FileText } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const ResumesPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative flex items-center justify-center w-full h-24">
        <div className="absolute w-16 h-20 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 transform -rotate-12 -translate-x-8 opacity-40 scale-90 group-hover:-translate-x-10 transition-transform duration-700 animate-[float_4s_ease-in-out_infinite]" />
        <div className="absolute w-16 h-20 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 transform rotate-6 translate-x-6 opacity-40 scale-95 group-hover:translate-x-8 transition-transform duration-700 animate-[float_6s_ease-in-out_infinite_1s]" />
        <div className="relative w-20 h-24 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 group-hover:-translate-y-4 transition-transform duration-500 z-10 p-3 gap-2 flex flex-col">
            <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-3 h-3 rounded-full ${color.iconBg}/20 flex items-center justify-center`}><FileText className={`w-2 h-2 ${color.text}`} /></div>
                <div className={`w-full h-1.5 ${color.iconBg}/40 rounded-full`} />
            </div>
            <div className="space-y-1.5">
                <div className="h-1 w-full bg-neutral-100 dark:bg-neutral-700 rounded-full" />
                <div className="h-1 w-5/6 bg-neutral-100 dark:bg-neutral-700 rounded-full" />
                <div className="h-1 w-4/6 bg-neutral-100 dark:bg-neutral-700 rounded-full" />
            </div>
            <div className={`mt-auto w-full h-4 rounded-lg ${color.bg} border border-${color.text.split('-')[1]}-100 dark:border-${color.text.split('-')[1]}-900 flex items-center justify-center`}>
                <div className={`w-3 h-0.5 ${color.iconBg} rounded-full animate-pulse`} />
            </div>
        </div>
    </div>
);

export default ResumesPreview;
