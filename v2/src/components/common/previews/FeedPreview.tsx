import React from 'react';
import { Zap } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const FeedPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full h-24 flex flex-col justify-center gap-2 group-hover:scale-105 transition-transform duration-500">
        {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-3 bg-white dark:bg-neutral-800 p-2.5 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm opacity-60 group-hover:opacity-100 transition-opacity">
                <div className={`w-8 h-8 rounded-lg ${color.iconBg} flex items-center justify-center shrink-0`}>
                    <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 space-y-1">
                    <div className="h-2 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                    <div className="h-1.5 w-1/2 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
                </div>
                <div className={`px-1.5 py-0.5 rounded-md ${color.bg} ${color.text} text-[8px] font-bold`}>
                    92%
                </div>
            </div>
        ))}
    </div>
);

export default FeedPreview;
