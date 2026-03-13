import React from 'react';
import { Globe, Bookmark } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const ExtensionPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full h-24 flex items-center justify-center">
        <div className={`absolute inset-0 ${color.glow} blur-3xl opacity-10`} />
        <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-2.5 flex flex-col gap-2 w-28 group-hover:-translate-y-1 transition-transform duration-500">
            <div className="flex items-center gap-1.5">
                <Globe className={`w-3 h-3 ${color.text}`} />
                <div className="h-1.5 flex-1 bg-neutral-100 dark:bg-neutral-700 rounded-full" />
            </div>
            <div className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg ${color.iconBg} cursor-pointer`}>
                <Bookmark className="w-2.5 h-2.5 text-white" />
                <span className="text-[7px] font-black text-white">SAVE</span>
            </div>
        </div>
    </div>
);

export default ExtensionPreview;
