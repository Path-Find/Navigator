import React from 'react';
import { Shield } from 'lucide-react';
import type { FeatureColor } from '../../../featureRegistry';

const AiSafetyPreview: React.FC<{ color: FeatureColor }> = ({ color }) => (
    <div className="relative w-full h-24 flex items-center justify-center">
        <div className={`absolute inset-0 ${color.glow} blur-3xl opacity-10 group-hover:opacity-25 transition-opacity`} />
        <div className="relative flex flex-col items-center gap-2 group-hover:scale-105 transition-transform duration-500">
            <div className={`w-11 h-11 rounded-xl ${color.iconBg} flex items-center justify-center text-white shadow-lg relative`}>
                <div className={`absolute inset-0 ${color.iconBg} rounded-xl blur-md opacity-0 group-hover:opacity-60 group-hover:animate-pulse transition-opacity`} />
                <Shield className="w-5 h-5 relative z-10" />
            </div>
            <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-[7px] font-black text-red-400">AI Banned</span>
            </div>
        </div>
    </div>
);

export default AiSafetyPreview;
