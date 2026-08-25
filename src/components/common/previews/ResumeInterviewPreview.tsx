import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const ResumeInterviewPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full h-24 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
        <div className={`absolute inset-0 ${color.glow} blur-3xl opacity-20`} />
        
        {/* Story Sheet */}
        <div className="relative w-24 h-18 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-100 dark:border-neutral-700 p-2.5 overflow-hidden flex flex-col gap-1.5 transition-all duration-700 group-hover:-translate-y-1">
            <div className="flex items-center gap-1.5 mb-0.5">
                <BookOpen className={`w-3.5 h-3.5 ${color.text}`} />
                <div className="h-1.5 w-10 bg-neutral-100 dark:bg-neutral-700 rounded-full" />
            </div>
            
            <div className="space-y-1.5">
                {[
                    { w: 'w-full', d: '0ms' },
                    { w: 'w-full', d: '100ms' },
                    { w: 'w-2/3', d: '200ms' }
                ].map((line, i) => (
                    <div 
                        key={i} 
                        className={`h-1 bg-neutral-50 dark:bg-neutral-700/50 rounded-full ${line.w} animate-pulse`} 
                        style={{ animationDelay: line.d }} 
                    />
                ))}
            </div>

            {/* Floating Sparkle */}
            <div className="absolute top-1 right-1">
                <Sparkles className={`w-2.5 h-2.5 ${color.text} animate-spin-slow`} />
            </div>
        </div>

        {/* Small "Context" Floating Card */}
        <div className="absolute -bottom-1 -right-2 bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-800 rounded-lg px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-700 delay-200 z-20">
            <span className="text-[8px] font-black text-neutral-600 dark:text-neutral-400">Context Added!</span>
        </div>
    </div>
);

export default ResumeInterviewPreview;
