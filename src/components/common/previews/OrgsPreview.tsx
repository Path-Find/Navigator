import React from 'react';
import { Building2, PlusCircle } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const OrgsPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full h-24 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
        <div className={`absolute inset-0 ${color.glow} blur-3xl opacity-20`} />
        
        {/* Org Membership Card */}
        <div className="relative w-28 h-16 bg-white dark:bg-neutral-800 rounded-xl shadow-xl border border-neutral-100 dark:border-neutral-700 p-2.5 overflow-hidden flex flex-col gap-1.5 transition-all duration-700 group-hover:-translate-y-1">
            <div className="flex items-center gap-2 mb-1">
                <div className={`p-1 rounded-lg ${color.iconBg} text-white`}>
                    <Building2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="h-2 w-16 bg-neutral-100 dark:bg-neutral-700 rounded-full" />
                    <div className="h-1.5 w-10 bg-neutral-50 dark:bg-neutral-800 rounded-full" />
                </div>
            </div>
            
            <div className="flex justify-between items-center mt-auto">
                <div className="flex -space-x-1.5">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-4 h-4 rounded-full border border-white dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-700 shadow-sm overflow-hidden" />
                    ))}
                </div>
                <PlusCircle className={`w-3.5 h-3.5 ${color.text} opacity-50`} />
            </div>
        </div>

        {/* Floating Label */}
        <div className="absolute top-2 right-2 bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 rounded-lg px-1.5 py-0.5 shadow-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-700 delay-200 z-20">
            <span className="text-[7px] font-black text-teal-600 dark:text-teal-400">Joined!</span>
        </div>
    </div>
);

export default OrgsPreview;
