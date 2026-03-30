import React from 'react';
import { Sparkles } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const JobfitPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full h-24 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
        <div className={`absolute inset-0 ${color.glow} blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`} />
        <div className="relative w-20 h-20 flex items-center justify-center z-10">
            <svg className="w-full h-full transform -rotate-90 filter drop-shadow-xl">
                <circle cx="40" cy="40" r="34" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-neutral-100 dark:text-neutral-800" />
                <circle cx="40" cy="40" r="34" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray="213.63" strokeDashoffset="213.63" className={`${color.text} stroke-cap-round transition-all duration-1000 ease-out group-hover:stroke-dash-offset-[17.09]`} style={{ strokeDashoffset: '17.09' }} />
                <circle cx="40" cy="40" r="34" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray="213.63" strokeDashoffset="17.09" className={`${color.text} stroke-cap-round group-hover:animate-pulse`} />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={`text-xl font-black ${color.text}`}>92%</span>
                <span className="text-xs font-bold text-neutral-400 -mt-1">Match</span>
            </div>
        </div>
        {/* Floating elements */}
        <div className="absolute top-2 -left-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl p-2 font-mono text-[9px] w-28 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-700 delay-100 flex flex-col gap-1 z-20">
            <div className="flex justify-between items-center">
                <span className="text-neutral-400 font-bold">Fit Analysis</span>
                <Sparkles className={`w-2 h-2 ${color.text}`} />
            </div>
            <div className="h-1 w-full bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div className={`h-full ${color.iconBg} w-4/5`} />
            </div>
        </div>
        <div className="absolute bottom-4 -right-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-lg px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-700 delay-200 z-20">
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">Perfect Fit!</span>
        </div>
    </div>
);

export default JobfitPreview;
