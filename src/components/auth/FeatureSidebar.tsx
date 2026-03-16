import React from 'react';
import { Sparkles, TrendingUp, Zap, FileText, GraduationCap, Bookmark, PenTool, Mail, RefreshCw, Shield, Users, Globe, Search, Calculator, MessageSquare, Rss, Building2, Activity, School } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FEATURE_COLORS, type FeatureDefinition } from '../../featureRegistry';

const ICON_MAP: Record<string, LucideIcon> = {
    Sparkles, TrendingUp, Zap, FileText, GraduationCap, Bookmark,
    PenTool, Mail, RefreshCw, Shield, Users, Globe, Search, Calculator,
    MessageSquare, Rss, Building2, Activity, School,
};

interface FeatureSidebarProps {
    featureContext?: FeatureDefinition;
}

export const FeatureSidebar: React.FC<FeatureSidebarProps> = ({ featureContext }) => {
    if (!featureContext) return null;

    const Icon = ICON_MAP[featureContext.iconName] || Sparkles;
    const colors = FEATURE_COLORS[featureContext.colorKey] || FEATURE_COLORS.indigo;

    return (
        <div className={`hidden md:flex flex-col p-8 rounded-l-3xl h-full ${colors.bg} border-r border-neutral-200/50 dark:border-neutral-800/50 relative overflow-hidden`}>
            {/* Decorative glow */}
            <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${colors.glow} blur-3xl opacity-60`} />
            <div className={`absolute -bottom-20 -left-20 w-48 h-48 rounded-full ${colors.glow} blur-3xl opacity-40`} />

            <div className="relative z-10 flex-1 flex flex-col h-full">
                <div className={`w-12 h-12 rounded-2xl ${colors.iconBg} flex items-center justify-center shadow-lg mb-6`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>

                <div className="mb-6">
                    <h3 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight mb-2">
                        Unlock {featureContext.name}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm">
                        Join Navigator to access {featureContext.name} and our complete suite of AI-powered career tools designed to help you land your next role.
                    </p>
                </div>
            </div>
        </div>
    );
};
