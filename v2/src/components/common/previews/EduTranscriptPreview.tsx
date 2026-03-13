import React from 'react';
import { GraduationCap } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const EduTranscriptPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full h-24 flex items-center justify-center">
        <div className={`absolute inset-0 ${color.glow} blur-3xl opacity-10`} />
        <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-2.5 w-28 group-hover:-translate-y-1 transition-transform duration-500">
            <div className="flex items-center gap-1.5 mb-2">
                <GraduationCap className={`w-3 h-3 ${color.text}`} />
                <span className="text-[7px] font-black text-neutral-500">TRANSCRIPT</span>
            </div>
            <div className="flex flex-col gap-1">
                {[{ c: 'CS 301', g: 'A' }, { c: 'MATH 240', g: 'A-' }, { c: 'ENG 102', g: 'B+' }].map((row, i) => (
                    <div key={i} className="flex justify-between items-center">
                        <span className="text-[6px] text-neutral-400 font-medium">{row.c}</span>
                        <span className={`text-[7px] font-black ${i === 0 ? color.text : 'text-neutral-500'}`}>{row.g}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default EduTranscriptPreview;
