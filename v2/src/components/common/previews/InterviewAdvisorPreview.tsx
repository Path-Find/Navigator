import React from 'react';
import { MessageSquare } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const InterviewAdvisorPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full h-24 flex items-center justify-center">
        <div className={`absolute inset-0 ${color.glow} blur-3xl opacity-10`} />
        <div className="relative flex flex-col gap-1.5 w-28">
            {[{ align: 'items-end', w: 'w-20' }, { align: 'items-start', w: 'w-16' }, { align: 'items-end', w: 'w-18' }].map((msg, i) => (
                <div key={i} className={`flex ${msg.align} transition-all duration-500`} style={{ transitionDelay: `${i * 100}ms` }}>
                    <div className={`${msg.w} h-3 rounded-full ${i % 2 === 0 ? `${color.iconBg} opacity-80` : 'bg-neutral-200 dark:bg-neutral-700'} group-hover:scale-105 transition-transform`} />
                </div>
            ))}
            <div className="flex items-center gap-1 mt-0.5">
                <div className={`w-4 h-4 rounded-full ${color.iconBg} flex items-center justify-center`}>
                    <MessageSquare className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="flex gap-0.5">
                    {[0, 1, 2].map(i => <span key={i} className={`w-0.5 h-0.5 rounded-full ${color.iconBg} animate-bounce`} style={{ animationDelay: `${i * 100}ms` }} />)}
                </div>
            </div>
        </div>
    </div>
);

export default InterviewAdvisorPreview;
