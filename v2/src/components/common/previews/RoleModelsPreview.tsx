import React from 'react';
import { Users, TrendingUp } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const RoleModelsPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full h-24 flex items-center justify-center">
        <div className={`absolute inset-0 ${color.glow} blur-3xl opacity-10`} />
        <div className="relative flex items-end gap-3 group-hover:scale-105 transition-transform duration-500">
            <div className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    <Users className="w-4 h-4 text-neutral-400" />
                </div>
                <span className="text-[6px] font-bold text-neutral-400">You</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 mb-3">
                <div className={`h-0.5 w-8 ${color.iconBg} rounded-full opacity-50`} />
                <TrendingUp className={`w-3 h-3 ${color.text}`} />
                <div className={`h-0.5 w-8 ${color.iconBg} rounded-full opacity-50`} />
            </div>
            <div className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full ${color.iconBg}/20 flex items-center justify-center border-2 ${color.accent}`}>
                    <Users className={`w-4 h-4 ${color.text}`} />
                </div>
                <span className={`text-[6px] font-bold ${color.text}`}>Mentor</span>
            </div>
        </div>
    </div>
);

export default RoleModelsPreview;
