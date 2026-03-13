import React from 'react';
import { Search } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const EduExplorerPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full h-24 flex items-center justify-center">
        <div className={`absolute inset-0 ${color.glow} blur-3xl opacity-10`} />
        <div className="relative flex flex-col gap-1.5 w-28">
            {['MS CompSci', 'Boot Camp', 'AWS Cert'].map((prog, i) => (
                <div key={prog} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all duration-500 group-hover:scale-105 ${i === 0 ? `${color.bg} ${color.accent}` : 'bg-white dark:bg-neutral-800 border-neutral-100 dark:border-neutral-700'}`} style={{ transitionDelay: `${i * 60}ms` }}>
                    <Search className={`w-2.5 h-2.5 ${i === 0 ? color.text : 'text-neutral-400'}`} />
                    <span className={`text-[7px] font-bold ${i === 0 ? color.text : 'text-neutral-400'}`}>{prog}</span>
                </div>
            ))}
        </div>
    </div>
);

export default EduExplorerPreview;
