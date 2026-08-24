import React, { useMemo } from 'react';
import { FEATURE_REGISTRY, FEATURE_RANKINGS, getFeatureColor, shouldShowNewBadge, type FeatureDefinition } from '../../featureRegistry';
import { getPreviewComponent } from '../../components/common/FeaturePreviews';
import type { ViewId } from '../../utils/navigation';
import { Mail, TrendingUp, PenTool, Sparkles, FileText, GraduationCap, Bookmark, Zap, RefreshCw, Shield, Users, Globe, Search, Calculator, MessageSquare, Rss, Activity, Building2, School, type LucideIcon } from 'lucide-react';
import { BentoCard } from '../../components/ui/BentoCard';
import { EventService } from '../../services/eventService';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useUser } from '../../contexts/UserContext';

// Icon Map — resolves string icon names to Lucide components
const ICON_MAP: Record<string, LucideIcon> = {
    Sparkles,
    TrendingUp,
    Zap,
    FileText,
    GraduationCap,
    Bookmark,
    PenTool,
    Mail,
    RefreshCw,
    Shield,
    Users,
    Globe,
    Search,
    Calculator,
    MessageSquare,
    Rss,
    Activity,
    Building2,
    School,
} as const;

interface FeatureGridProps {
    user: SupabaseUser | null;
    onNavigate?: (view: ViewId) => void;
    onShowAuth?: (feature?: FeatureDefinition) => void;
    isAdmin?: boolean;
    isTester?: boolean;
    userTier?: string;
    journey?: string;
    className?: string;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
    user: propUser,
    onNavigate,
    onShowAuth,
    isAdmin: propIsAdmin,
    isTester: propIsTester,
    journey = 'job-hunter',
    userTier = 'free',
    className = ""
}) => {
    const { lastArchetypeUpdate, user: contextUser, dismissedNotices, dismissNotice } = useUser();

    const user = propUser || contextUser;

    // Prioritize props
    const isAdmin = propIsAdmin;
    const isTester = propIsTester;

    // Content Strategy: Logged-in users see short/punchy text; logged-out see full descriptions
    const isLoggedIn = !!user && userTier !== 'free';
    const descriptionKey = isLoggedIn ? 'short' : 'full';
    const actionKey = isLoggedIn ? 'short' : 'full';

    const cardKeys = useMemo(() => {
        // 1. All available homepage cards
        const allKeys = Object.keys(FEATURE_REGISTRY).filter(key => {
            const config = FEATURE_REGISTRY[key];
            if (!config || !config.showOnHomepage) return false;

            // Education requires Admin/Tester/Student
            if (config.category === 'EDUCATION') return isAdmin || isTester || journey === 'student';

            return true;
        });

        // 2. Define Rank Helper (Centralized)
        const getEffectiveRank = (key: string): number => {
            const rankingKey = (userTier && FEATURE_RANKINGS[userTier]) ? userTier : (journey || 'job-hunter');
            const rankings = FEATURE_RANKINGS[rankingKey] || FEATURE_RANKINGS['job-hunter'];
            const rankIndex = rankings.indexOf(key);
            return rankIndex !== -1 ? rankIndex : 99;
        };

        // 3. Selection Logic: One from each bucket, then fill by rank
        const selectedKeys: string[] = [];
        const seenCategories = new Set<string>();

        const sortedAll = allKeys.sort((a, b) => getEffectiveRank(a) - getEffectiveRank(b));

        // Pass 1: Pick the top card from each available category
        for (const key of sortedAll) {
            const config = FEATURE_REGISTRY[key];
            if (config && !seenCategories.has(config.category)) {
                selectedKeys.push(key);
                seenCategories.add(config.category);
            }
        }

        // Pass 2: Fill remaining slots up to 5 based on global rank
        for (const key of sortedAll) {
            if (selectedKeys.length >= 5) break;
            if (!selectedKeys.includes(key)) {
                selectedKeys.push(key);
            }
        }

        // Final sort of selected keys to maintain ranking order for display
        const finalKeys = selectedKeys.sort((a, b) => getEffectiveRank(a) - getEffectiveRank(b));

        // 4. System Notice Injection (Swap least ranked card)
        if (user) {
            const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;
            // eslint-disable-next-line react-hooks/purity
            const isArchetypeStale = !lastArchetypeUpdate || (Date.now() - lastArchetypeUpdate > SIX_MONTHS_MS);
            // Check if notices are dismissed/snoozed
            // eslint-disable-next-line react-hooks/purity
            const now = Date.now();
            const isArchetypeDismissed = dismissedNotices['_NOTICE_ARCHETYPE'] > now;
            if (isArchetypeStale && !isArchetypeDismissed) {
                finalKeys[finalKeys.length - 1] = '_NOTICE_ARCHETYPE';
            }
        }

        return finalKeys;
    }, [isAdmin, isTester, journey, userTier, user, lastArchetypeUpdate, dismissedNotices]);

    const handleAction = (config: FeatureDefinition) => {
        // Track curiosity (Interest)
        EventService.trackInterest(config.id);

        if (user) {
            onNavigate?.(config.targetView);
        } else {
            // Logged out behavior
            if (onShowAuth) {
                onShowAuth(config);
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => document.querySelector('input')?.focus(), 500);
            }
        }
    };

    return (
        <div className={`animate-in fade-in slide-in-from-bottom-4 duration-300 w-full ${className}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 justify-items-center">
                {cardKeys.map((key) => {
                    const config = FEATURE_REGISTRY[key];
                    if (!config) return null;

                    const color = getFeatureColor(config);
                    const Icon = ICON_MAP[config.iconName];
                    const isSystemNotice = key.startsWith('_NOTICE_');

                    return (
                        <BentoCard
                            className="max-w-md w-full mx-auto"
                            key={config.id}
                            id={config.id}
                            icon={Icon}
                            title={config.shortName}
                            description={config.description[descriptionKey]}
                            color={color}
                            actionLabel={config.action[actionKey]}
                            badge={config.badge || (shouldShowNewBadge(config) ? 'New' : undefined)}
                            isComingSoon={config.stage === 'beta'}
                            previewContent={getPreviewComponent(config.id, color)}
                            onAction={() => handleAction(config)}
                            onDismiss={isSystemNotice ? () => {
                                // TOS notices are permanent once dismissed
                                const snoozeDays = key === '_NOTICE_TOS' ? 0 : 7;
                                dismissNotice(key, snoozeDays);
                            } : undefined}
                        />
                    );
                })}
            </div>
        </div>
    );
};
