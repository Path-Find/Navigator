import React from 'react';
import { RefreshCw } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const QualityLoopPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full h-24 flex items-center justify-center gap-2">
        {[1, 2, 3].map(i => (
            <div key={i} className="flex flex-col items-center gap-1 transition-all duration-500" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className={`w-8 h-8 rounded-lg ${i === 3 ? color.iconBg : 'bg-neutral-100 dark:bg-neutral-800'} flex items-center justify-center ${i === 3 ? 'text-white scale-110' : 'text-neutral-400'} group-hover:scale-110 transition-transform`}>
                    <RefreshCw className="w-4 h-4" />
                </div>
                <span className={`text-[7px] font-black ${i === 3 ? color.text : 'text-neutral-400'}`}>Pass {i}</span>
            </div>
        ))}
    </div>
);

export default QualityLoopPreview;
