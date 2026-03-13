import React from 'react';
import { Mail } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const MailInPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full h-24 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
        <div className={`absolute inset-0 ${color.glow} blur-3xl opacity-30`} />
        <div className="relative bg-white dark:bg-neutral-800 p-4 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 z-10 flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-xl ${color.iconBg} flex items-center justify-center text-white shadow-lg`}>
                <Mail className="w-6 h-6" />
            </div>
            <div className="flex gap-1">
                <span className={`w-1 h-1 rounded-full ${color.iconBg} animate-bounce`} />
                <span className={`w-1 h-1 rounded-full ${color.iconBg} animate-bounce delay-75`} />
                <span className={`w-1 h-1 rounded-full ${color.iconBg} animate-bounce delay-150`} />
            </div>
        </div>
    </div>
);

export default MailInPreview;
