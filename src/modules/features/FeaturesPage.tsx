import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, PenTool, RefreshCw, Zap, Shield, Bookmark,
    TrendingUp, Users, FileText, Mail, Rss, Globe,
    GraduationCap, Search, Calculator, MessageSquare,
    Activity, School, Building2,
    type LucideIcon,
} from 'lucide-react';
import { BentoCard } from '../../components/ui/BentoCard';
import { getAllFeatures, getFeatureColor } from '../../featureRegistry';
import { getPreviewComponent } from '../../components/common/FeaturePreviews';
import { useUser } from '../../contexts/UserContext';
import { useModal } from '../../contexts/ModalContext';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { ROUTES } from '../../constants';

type Tier = 'all' | 'explorer' | 'plus' | 'pro';

// ─── Icon Map ────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
    Sparkles, TrendingUp, Zap, FileText, GraduationCap, Bookmark,
    PenTool, Mail, RefreshCw, Shield, Users, Globe,
    Search, Calculator, MessageSquare, Rss, Activity, School, Building2,
};

// ─── Filter Tabs ──────────────────────────────────────────────────────

const filterTabs: { key: Tier; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'explorer', label: 'Explorer' },
    { key: 'plus', label: 'Plus' },
    { key: 'pro', label: 'Pro' },
];

const TIER_LEVEL: Record<Exclude<Tier, 'all'>, number> = { explorer: 0, plus: 1, pro: 2 };

// ─── Page Component ───────────────────────────────────────────────────

export const FeaturesPage: React.FC = () => {
    const [activeTier, setActiveTier] = useState<Tier>('all');
    const hasSetDefaultRef = useRef(false);
    const navigate = useNavigate();
    const { user, userTier, isAdmin, isLoading } = useUser();
    const { openModal } = useModal();
    const { setView } = useGlobalUI();

    useEffect(() => {
        if (!isLoading && !hasSetDefaultRef.current && user) {
            hasSetDefaultRef.current = true;
            if (userTier !== 'free' && userTier !== 'admin') {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setActiveTier(userTier as Tier);
            }
        }
    }, [user, userTier, isLoading]);

    // Get all features from registry (excluding admin-only for public features page)
    const allFeatures = useMemo(() => {
        return getAllFeatures()
            .filter(f => !f.id.startsWith('_notice_')) // Filter system notices
            .filter(f => f.stage !== 'admin')
            .sort((a, b) => a.rank - b.rank);
    }, []);

    const filtered = useMemo(() => {
        if (activeTier === 'all') return allFeatures;
        const level = TIER_LEVEL[activeTier as Exclude<Tier, 'all'>];
        return allFeatures.filter((f: any) => TIER_LEVEL[f.tier as Exclude<Tier, 'all'>] <= level);
    }, [activeTier, allFeatures]);

    const counts = useMemo(() => ({
        all: allFeatures.length,
        explorer: allFeatures.filter((f: any) => TIER_LEVEL[f.tier as Exclude<Tier, 'all'>] <= 0).length,
        plus: allFeatures.filter((f: any) => TIER_LEVEL[f.tier as Exclude<Tier, 'all'>] <= 1).length,
        pro: allFeatures.filter((f: any) => TIER_LEVEL[f.tier as Exclude<Tier, 'all'>] <= 2).length,
    }), [allFeatures]);

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] py-20 px-4 sm:px-6 overflow-x-hidden">

            {/* Hero */}
            <div className="max-w-4xl mx-auto text-center mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-6"
                >
                    One platform.{' '}
                    <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500 bg-clip-text text-transparent">
                        Every advantage.
                    </span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed"
                >
                    From your first analysis to your dream offer — here's every tool working behind the scenes to get you there.
                </motion.p>
            </div>

            {/* Filter Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-6xl mx-auto mb-12"
            >
                <div className="flex items-center justify-center">
                    <div className="flex items-center bg-white/80 dark:bg-neutral-900/80 p-1 rounded-[2.5rem] border border-neutral-200/60 dark:border-neutral-800/50 backdrop-blur-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                        {filterTabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTier(tab.key)}
                                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-2xl text-[11px] md:text-xs font-bold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 cursor-pointer ${activeTier === tab.key
                                    ? 'text-neutral-900 dark:text-white'
                                    : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                                    }`}
                            >
                                {activeTier === tab.key && (
                                    <motion.div
                                        layoutId="features-filter-pill"
                                        className="absolute inset-0 bg-white/90 dark:bg-neutral-800/90 shadow-sm border border-white/50 dark:border-neutral-700/50 rounded-[2rem] z-0"
                                        style={{ borderRadius: 32 }}
                                        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    {tab.label}
                                    <span className={`text-[10px] tabular-nums ${activeTier === tab.key ? 'text-neutral-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
                                        {counts[tab.key]}
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Cards Grid */}
            <div className="max-w-6xl mx-auto">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={activeTier}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
                    >
                        {filtered.map((feature) => {
                            const color = getFeatureColor(feature);
                            const Icon = ICON_MAP[feature.iconName];

                            const tierLevelMap: Record<string, number> = { free: 0, explorer: 0, plus: 1, pro: 2, admin: 3, tester: 3 };
                            const userLevel = tierLevelMap[userTier as string] ?? 0;
                            const featureLevel = tierLevelMap[feature.tier] ?? 0;
                            const hasAccess = userLevel >= featureLevel;

                            let actionLabel = feature.action.full;
                            if (user) {
                                actionLabel = hasAccess
                                    ? feature.action.short
                                    : `Upgrade to ${feature.tier.charAt(0).toUpperCase() + feature.tier.slice(1)}`;
                            }

                            return (
                                <motion.div
                                    key={feature.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <BentoCard
                                        id={feature.id}
                                        icon={Icon}
                                        title={feature.name}
                                        description={feature.description.full}
                                        color={color}
                                        actionLabel={feature.stage === 'beta' ? "Coming Soon" : actionLabel}
                                        isComingSoon={feature.stage === 'beta'}
                                        badge={feature.badge}
                                        previewContent={getPreviewComponent(feature.id, color)}
                                        onAction={() => {
                                            if (feature.stage === 'beta' && !isAdmin) {
                                                // Log interest or show toast
                                                return;
                                            }
                                            if (user) {
                                                if (hasAccess) {
                                                    if (feature.targetView) setView(feature.targetView);
                                                    if (feature.link) navigate(feature.link);
                                                } else {
                                                    openModal('UPGRADE');
                                                }
                                            } else {
                                                // Guests: Match card navigates to /jobs (has input), others show auth
                                                if (feature.targetView === 'job-home' && feature.link) {
                                                    navigate(feature.link);
                                                } else {
                                                    openModal('AUTH', { feature });
                                                }
                                            }
                                        }}
                                    />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl mx-auto text-center mt-32 mb-12"
            >
                <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-4">
                    Ready to unlock your advantage?
                </h2>
                <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-8">
                    Start with 3 free analyses. No credit card required.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => navigate(ROUTES.PLANS)}
                        className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black text-sm font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all shadow-lg shadow-neutral-500/10 active:scale-95 cursor-pointer"
                    >
                        View Plans
                    </button>
                    <button
                        onClick={() => {
                            if (!user) {
                                openModal('AUTH');
                            } else {
                                navigate(ROUTES.HOME);
                                // Give a small delay for navigation to complete before focusing
                                setTimeout(() => {
                                    document.querySelector('input')?.focus();
                                }, 100);
                            }
                        }}
                        className="px-6 py-3 text-sm font-bold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                        Try it free →
                    </button>
                </div>
            </motion.div>
        </div >
    );
};
