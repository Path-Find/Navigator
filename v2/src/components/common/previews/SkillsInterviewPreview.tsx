import React from 'react';
import type { FeatureColor } from '../../../featureRegistry';

const SkillsInterviewPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full h-24 flex items-center justify-center">
        <div className={`absolute inset-0 ${color.glow} blur-3xl opacity-10`} />
        <div className="relative flex items-center gap-2">
            {['Q1', 'Q2', 'Q3'].map((q, i) => (
                <div key={q} className="flex flex-col items-center gap-1 transition-all duration-500 group-hover:scale-110" style={{ transitionDelay: `${i * 80}ms` }}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[8px] font-black ${i < 2 ? `${color.iconBg} text-white` : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400'}`}>
                        {i < 2 ? '✓' : '?'}
                    </div>
                    <span className={`text-[6px] font-bold ${i < 2 ? color.text : 'text-neutral-400'}`}>{q}</span>
                </div>
            ))}
        </div>
    </div>
);

export default SkillsInterviewPreview;
