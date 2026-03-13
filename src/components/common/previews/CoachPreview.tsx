import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const CoachPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="w-full px-8 h-24 flex flex-col justify-center gap-4">
        <div className="relative h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
                className={`absolute inset-0 h-full ${color.iconBg} w-2/3 animate-[shimmer_2s_infinite]`}
                style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
            />
        </div>
        <div className="flex justify-between items-center gap-3">
            <div className={`w-8 h-8 rounded-xl ${color.iconBg}/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all`}>
                <TrendingUp className={`w-4 h-4 ${color.text}`} />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color.iconBg} w-4/5 rounded-full`} />
                </div>
                <div className="h-1.5 w-3/4 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color.iconBg} w-2/5 rounded-full opacity-60`} />
                </div>
            </div>
        </div>
    </div>
);

export default CoachPreview;
