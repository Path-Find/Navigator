import React from 'react';
import type { FeatureColor } from '../../../featureRegistry';

const HistoryPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative flex flex-col gap-2.5 w-full px-8 h-24 justify-center">
        {[
            { score: 98, name: 'Senior Dev', icon: '⚡️' },
            { score: 87, name: 'Product Lead', icon: '🎨' },
            { score: 92, name: 'Cloud Eng', icon: '☁️' }
        ].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 transition-all duration-700 ${i > 0 ? 'opacity-30 group-hover:opacity-60' : ''}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="text-[10px] w-4">{item.icon}</div>
                <div className="flex-grow flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[7px] font-black text-neutral-400">
                        <span>{item.name}</span>
                        <span className={color.text}>{item.score}%</span>
                    </div>
                    <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${color.iconBg} rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]`}
                            style={{ width: `${item.score}%`, transition: 'width 1.5s cubic-bezier(0.23, 1, 0.32, 1)', transitionDelay: `${i * 200}ms` }}
                        />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export default HistoryPreview;
