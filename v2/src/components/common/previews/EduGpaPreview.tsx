import React from 'react';
import type { FeatureColor } from '../../../featureRegistry';

const EduGpaPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full h-24 flex items-center justify-center">
        <div className={`absolute inset-0 ${color.glow} blur-3xl opacity-10`} />
        <div className="relative flex flex-col items-center gap-1.5 group-hover:scale-110 transition-transform duration-500">
            <div className="flex items-baseline gap-0.5">
                <span className={`text-2xl font-black ${color.text}`}>3.7</span>
                <span className="text-[8px] font-bold text-neutral-400">/ 4.0</span>
            </div>
            <div className="w-20 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className={`h-full ${color.iconBg} rounded-full`} style={{ width: '92%' }} />
            </div>
            <span className="text-[7px] font-bold text-neutral-400">Cumulative GPA</span>
        </div>
    </div>
);

export default EduGpaPreview;
