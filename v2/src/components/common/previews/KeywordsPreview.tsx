import React from 'react';
import type { FeatureColor } from '../../../featureRegistry';

const KeywordsPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative flex flex-wrap items-center justify-center gap-2 px-4 h-24 overflow-hidden">
        {['Python', 'React', 'Cloud Architect', 'Leadership', 'TypeScript', 'AWS'].map((skill, i) => (
            <div
                key={skill}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black border transition-all duration-500 scale-90 group-hover:scale-100 ${i % 2 === 0
                    ? `${color.bg.replace('/50', '/80')} ${color.text} border-${color.text.split('-')[1]}-200/50`
                    : 'bg-white dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700'
                    }`}
                style={{
                    transitionDelay: `${i * 50}ms`,
                    transform: `translateY(${Math.sin(i) * 5}px)`
                }}
            >
                {i % 2 === 0 ? '✓ ' : '+ '}{skill}
            </div>
        ))}
    </div>
);

export default KeywordsPreview;
