import React from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const EduPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full px-8 h-24 flex items-center justify-center">
        <div className="relative group-hover:scale-110 transition-transform duration-700">
            <div className={`absolute -inset-4 ${color.glow} blur-xl opacity-20 group-hover:opacity-40 transition-opacity animate-pulse`} />
            <div className={`w-14 h-14 rounded-2xl ${color.iconBg} flex items-center justify-center shadow-2xl shadow-amber-500/20 z-10 relative`}>
                <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 bg-white dark:bg-neutral-800 rounded-full p-1.5 shadow-lg border border-neutral-100 dark:border-neutral-700 z-20 scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                <Sparkles className="w-3 h-3 text-amber-500" />
            </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="w-8 h-0.5 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
            <div className="w-8 h-0.5 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
        </div>
    </div>
);

export default EduPreview;
