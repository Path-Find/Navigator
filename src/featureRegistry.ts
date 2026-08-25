/**
 * Feature Registry
 * Single source of truth for all feature definitions across the app.
 *
 * Consumed by:
 *   - Homepage FeatureGrid (spotlight cards)
 *   - /features page (full catalog)
 *   - /education dashboard (tool cards)
 *   - /plans page (plan feature lists)
 */
import type { ViewId } from './utils/navigation';

// ─── Types ─────────────────────────────────────────────────────────────

export interface FeatureColor {
    bg: string;
    text: string;
    accent: string;
    iconBg: string;
    preview: string;
    glow: string;
}

export interface FeatureDefinition {
    /** Unique identifier */
    id: string;
    /** Registry key (used for lookups, e.g. 'JOBFIT') */
    key: string;
    /** Canonical display name (e.g. "AI Job Analysis") */
    name: string;
    /** Compact name for tight spaces (e.g. "Match") */
    shortName: string;
    /** Context-specific descriptions */
    description: {
        /** 5-8 words, punchy — for logged-in homepage cards */
        short: string;
        /** 1-2 sentences — for logged-out homepage, features page */
        full: string;
        /** Brief blurb for plan cards */
        plan: string;
    };
    /** Context-specific action labels */
    action: {
        /** Short action verb for logged-in users */
        short: string;
        /** Marketing-style CTA for logged-out / features page */
        full: string;
    };
    /** Lucide icon name (string) */
    iconName: string;
    /** Key into FEATURE_COLORS */
    colorKey: string;
    /** Feature category */
    category: 'JOB' | 'COACH' | 'EDUCATION';
    /** Minimum plan tier that includes this feature without limits */
    tier: 'explorer' | 'plus' | 'pro';
    /** View identifier for homepage onNavigate() system */
    targetView: ViewId;
    /** Route path for react-router navigate() */
    link: string;
    /** Default ordering rank (lower = higher priority) */
    rank: number;
    /**
     * Visibility stage of the feature.
     * - 'admin'  — so unready it should not exist publicly; hidden from all public-facing surfaces
     * - 'beta'   — committed to shipping; shown publicly as "Coming Soon"
     * - 'public' — fully live (default when omitted)
     */
    stage?: 'admin' | 'beta' | 'public';
    /** Eligible for display in homepage spotlight grid */
    showOnHomepage?: boolean;
    /** Hand-picked to appear on plan cards */
    planHighlight?: boolean;
    /** Include this feature in the authenticated footer navigation */
    showInFooter?: boolean;
    /** Optional footer-specific label */
    footerLabel?: string;
    /** Optional badge text (manually overridden if present) */
    badge?: string;
    /** ISO date string for feature release (e.g. '2024-01-15') */
    releaseDate?: string;
}

// ─── Shared Color Palette ──────────────────────────────────────────────

export const FEATURE_COLORS: Record<string, FeatureColor> = {
    neutral: {
        bg: 'bg-neutral-50 dark:bg-neutral-900/40',
        text: 'text-neutral-600 dark:text-neutral-300',
        accent: 'border-neutral-200 dark:border-neutral-700',
        iconBg: 'bg-neutral-700 dark:bg-neutral-600',
        preview: 'from-neutral-500/5',
        glow: 'bg-neutral-500/5 group-hover:bg-neutral-500/10',
    },
    indigo: {
        bg: 'bg-blue-50/50 dark:bg-blue-600/5',
        text: 'text-blue-600 dark:text-blue-400',
        accent: 'border-blue-600/10 dark:border-blue-600/20',
        iconBg: 'bg-blue-600',
        preview: 'from-blue-600/5',
        glow: 'bg-blue-600/10 group-hover:bg-blue-600/20',
    },
    'neutral-dark': {
        bg: 'bg-blue-50/50 dark:bg-blue-600/5',
        text: 'text-blue-600 dark:text-blue-400',
        accent: 'border-blue-500/10 dark:border-blue-600/20',
        iconBg: 'bg-blue-600',
        preview: 'from-blue-600/5',
        glow: 'bg-blue-600/10 group-hover:bg-blue-600/20',
    },
    violet: {
        bg: 'bg-teal-50/50 dark:bg-teal-600/5',
        text: 'text-teal-600 dark:text-teal-400',
        accent: 'border-teal-600/10 dark:border-teal-600/20',
        iconBg: 'bg-teal-600',
        preview: 'from-teal-600/5',
        glow: 'bg-teal-600/10 group-hover:bg-teal-600/20',
    },
    sky: {
        bg: 'bg-sky-50/50 dark:bg-sky-500/5',
        text: 'text-sky-500 dark:text-sky-400',
        accent: 'border-sky-500/10 dark:border-sky-500/20',
        iconBg: 'bg-sky-500',
        preview: 'from-sky-500/5',
        glow: 'bg-sky-500/10 group-hover:bg-sky-500/20',
    },
    emerald: {
        bg: 'bg-emerald-50/50 dark:bg-emerald-500/5',
        text: 'text-emerald-500 dark:text-emerald-400',
        accent: 'border-emerald-500/10 dark:border-emerald-500/20',
        iconBg: 'bg-emerald-500',
        preview: 'from-emerald-500/5',
        glow: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    },
    amber: {
        bg: 'bg-amber-50/50 dark:bg-amber-500/5',
        text: 'text-amber-500 dark:text-amber-400',
        accent: 'border-amber-500/10 dark:border-amber-500/20',
        iconBg: 'bg-amber-500',
        preview: 'from-amber-500/5',
        glow: 'bg-amber-500/10 group-hover:bg-amber-500/20',
    },
    'amber-dark': {
        bg: 'bg-amber-50/50 dark:bg-amber-500/5',
        text: 'text-amber-600 dark:text-amber-400',
        accent: 'border-amber-500/10 dark:border-amber-500/20',
        iconBg: 'bg-amber-600',
        preview: 'from-amber-600/5',
        glow: 'bg-amber-600/10 group-hover:bg-amber-600/20',
    },
    rose: {
        bg: 'bg-rose-50/50 dark:bg-rose-500/5',
        text: 'text-rose-500 dark:text-rose-400',
        accent: 'border-rose-500/10 dark:border-rose-500/20',
        iconBg: 'bg-rose-500',
        preview: 'from-rose-500/5',
        glow: 'bg-rose-500/10 group-hover:bg-rose-500/20',
    },
    teal: {
        bg: 'bg-teal-50/50 dark:bg-teal-500/5',
        text: 'text-teal-500 dark:text-teal-400',
        accent: 'border-teal-500/10 dark:border-teal-500/20',
        iconBg: 'bg-teal-500',
        preview: 'from-teal-500/5',
        glow: 'bg-teal-500/10 group-hover:bg-teal-500/20',
    },
    blue: {
        bg: 'bg-blue-50/50 dark:bg-blue-500/5',
        text: 'text-blue-500 dark:text-blue-400',
        accent: 'border-blue-500/10 dark:border-blue-500/20',
        iconBg: 'bg-blue-500',
        preview: 'from-blue-500/5',
        glow: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    },
    cyan: {
        bg: 'bg-cyan-50/50 dark:bg-cyan-500/5',
        text: 'text-cyan-500 dark:text-cyan-400',
        accent: 'border-cyan-500/10 dark:border-cyan-500/20',
        iconBg: 'bg-cyan-500',
        preview: 'from-cyan-500/5',
        glow: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
    },
    lime: {
        bg: 'bg-lime-50/50 dark:bg-lime-500/5',
        text: 'text-lime-600 dark:text-lime-400',
        accent: 'border-lime-500/10 dark:border-lime-500/20',
        iconBg: 'bg-lime-600',
        preview: 'from-lime-500/5',
        glow: 'bg-lime-500/10 group-hover:bg-lime-500/20',
    },
    orange: {
        bg: 'bg-orange-50/50 dark:bg-orange-500/5',
        text: 'text-orange-500 dark:text-orange-400',
        accent: 'border-orange-500/10 dark:border-orange-500/20',
        iconBg: 'bg-orange-500',
        preview: 'from-orange-500/5',
        glow: 'bg-orange-500/10 group-hover:bg-orange-500/20',
    },
    green: {
        bg: 'bg-green-50/50 dark:bg-green-500/5',
        text: 'text-green-600 dark:text-green-400',
        accent: 'border-green-500/10 dark:border-green-500/20',
        iconBg: 'bg-green-600',
        preview: 'from-green-500/5',
        glow: 'bg-green-500/10 group-hover:bg-green-500/20',
    },
    yellow: {
        bg: 'bg-yellow-50/50 dark:bg-yellow-500/5',
        text: 'text-yellow-600 dark:text-yellow-400',
        accent: 'border-yellow-500/10 dark:border-yellow-500/20',
        iconBg: 'bg-yellow-500',
        preview: 'from-yellow-500/5',
        glow: 'bg-yellow-500/10 group-hover:bg-yellow-500/20',
    },
    red: {
        bg: 'bg-red-50/50 dark:bg-red-500/5',
        text: 'text-red-500 dark:text-red-400',
        accent: 'border-red-500/10 dark:border-red-500/20',
        iconBg: 'bg-red-500',
        preview: 'from-red-500/5',
        glow: 'bg-red-500/10 group-hover:bg-red-500/20',
    },
    slate: {
        bg: 'bg-slate-50/50 dark:bg-slate-500/5',
        text: 'text-slate-600 dark:text-slate-400',
        accent: 'border-slate-500/10 dark:border-slate-500/20',
        iconBg: 'bg-slate-600',
        preview: 'from-slate-500/5',
        glow: 'bg-slate-500/10 group-hover:bg-slate-500/20',
    },
    stone: {
        bg: 'bg-stone-50/50 dark:bg-stone-500/5',
        text: 'text-stone-600 dark:text-stone-400',
        accent: 'border-stone-500/10 dark:border-stone-500/20',
        iconBg: 'bg-stone-600',
        preview: 'from-stone-500/5',
        glow: 'bg-stone-500/10 group-hover:bg-stone-500/20',
    },
    zinc: {
        bg: 'bg-zinc-50/50 dark:bg-zinc-500/5',
        text: 'text-zinc-600 dark:text-zinc-400',
        accent: 'border-zinc-500/10 dark:border-zinc-500/20',
        iconBg: 'bg-zinc-600',
        preview: 'from-zinc-500/5',
        glow: 'bg-zinc-500/10 group-hover:bg-zinc-500/20',
    },
    gray: {
        bg: 'bg-gray-50/50 dark:bg-gray-500/5',
        text: 'text-gray-600 dark:text-gray-400',
        accent: 'border-gray-500/10 dark:border-gray-500/20',
        iconBg: 'bg-gray-600',
        preview: 'from-gray-500/5',
        glow: 'bg-gray-500/10 group-hover:bg-gray-500/20',
    },
    'blue-dark': {
        bg: 'bg-blue-50/50 dark:bg-blue-600/5',
        text: 'text-blue-600 dark:text-blue-400',
        accent: 'border-blue-600/10 dark:border-blue-600/20',
        iconBg: 'bg-blue-600',
        preview: 'from-blue-600/5',
        glow: 'bg-blue-600/10 group-hover:bg-blue-600/20',
    },
    'teal-dark': {
        bg: 'bg-teal-50/50 dark:bg-teal-600/5',
        text: 'text-teal-600 dark:text-teal-400',
        accent: 'border-teal-600/10 dark:border-teal-600/20',
        iconBg: 'bg-teal-600',
        preview: 'from-teal-600/5',
        glow: 'bg-teal-600/10 group-hover:bg-teal-600/20',
    },
    'cyan-dark': {
        bg: 'bg-cyan-50/50 dark:bg-cyan-600/5',
        text: 'text-cyan-600 dark:text-cyan-400',
        accent: 'border-cyan-600/10 dark:border-cyan-600/20',
        iconBg: 'bg-cyan-600',
        preview: 'from-cyan-600/5',
        glow: 'bg-cyan-600/10 group-hover:bg-cyan-600/20',
    },
    olive: {
        bg: 'bg-lime-50/50 dark:bg-lime-600/5',
        text: 'text-lime-700 dark:text-lime-400',
        accent: 'border-lime-600/10 dark:border-lime-600/20',
        iconBg: 'bg-lime-700',
        preview: 'from-lime-600/5',
        glow: 'bg-lime-600/10 group-hover:bg-lime-600/20',
    },
    charcoal: {
        bg: 'bg-slate-50/50 dark:bg-slate-700/5',
        text: 'text-slate-700 dark:text-slate-300',
        accent: 'border-slate-600/10 dark:border-slate-600/20',
        iconBg: 'bg-slate-700',
        preview: 'from-slate-600/5',
        glow: 'bg-slate-600/10 group-hover:bg-slate-600/20',
    },
} as const;

// ─── Feature Registry ──────────────────────────────────────────────────

import { FEATURE_REGISTRY } from './features.data';
// Re-export
export { FEATURE_REGISTRY };


// ─── Categories ────────────────────────────────────────────────────────

export const FEATURE_CATEGORIES = {
    JOB: 'JOB',
    COACH: 'COACH',
    EDUCATION: 'EDUCATION',
} as const;

// ─── Journey-based Rankings ────────────────────────────────────────────

export const FEATURE_RANKINGS: Record<string, string[]> = {
    'job-hunter': [
        'JOBFIT', 'KEYWORDS', 'RESUMES', 'COVER_LETTERS',
        'FEED', 'HISTORY', 'MAIL_IN', 'COACH', 'EDU',
    ],
    'student': [
        'EDU', 'JOBFIT', 'KEYWORDS', 'RESUMES', 'COVER_LETTERS',
        'FEED', 'HISTORY', 'MAIL_IN', 'COACH',
    ],
    'employed': [
        'COACH', 'KEYWORDS', 'ROLE_MODELS', 'RESUMES', 'COVER_LETTERS',
        'JOBFIT', 'FEED', 'HISTORY', 'MAIL_IN',
    ],
    'career-changer': [
        'COACH', 'JOBFIT', 'KEYWORDS', 'RESUMES', 'COVER_LETTERS',
        'FEED', 'HISTORY', 'MAIL_IN',
    ],
    'pro': [
        'JOBFIT', 'COACH', 'EDU', 'KEYWORDS', 'RESUMES',
        'COVER_LETTERS', 'FEED', 'HISTORY', 'MAIL_IN',
    ],
    'admin': [
        'JOBFIT', 'COACH', 'EDU', 'KEYWORDS', 'RESUMES',
        'COVER_LETTERS', 'FEED', 'HISTORY', 'MAIL_IN',
    ],
    'tester': [
        'JOBFIT', 'COACH', 'EDU', 'KEYWORDS', 'RESUMES',
        'COVER_LETTERS', 'FEED', 'HISTORY', 'MAIL_IN',
    ],
};

// ─── Helper Functions ──────────────────────────────────────────────────

/** Get the color config for a feature */
export const getFeatureColor = (feature: FeatureDefinition): FeatureColor => {
    return FEATURE_COLORS[feature.colorKey] || FEATURE_COLORS.indigo;
};

/** Get all features as an array, optionally filtered */
export const getAllFeatures = (): FeatureDefinition[] => {
    return Object.values(FEATURE_REGISTRY);
};

/** Get features eligible for the homepage grid */
export const getHomepageFeatures = (): FeatureDefinition[] => {
    return getAllFeatures().filter(f => f.showOnHomepage && f.stage !== 'admin');
};

/** Get features by tier (cumulative — includes lower tiers) */
export const getFeaturesByTier = (tier: 'explorer' | 'plus' | 'pro'): FeatureDefinition[] => {
    const tierLevel: Record<string, number> = { explorer: 0, plus: 1, pro: 2 };
    const level = tierLevel[tier];
    return getAllFeatures().filter(f => tierLevel[f.tier] <= level);
};

/** Get hand-picked features to highlight on plan cards */
export const getFeaturesForPlan = (tier: 'explorer' | 'plus' | 'pro'): FeatureDefinition[] => {
    return getAllFeatures().filter(f => f.planHighlight && f.tier === tier && f.stage !== 'admin');
};

export const isFeatureComingSoon = (feature: FeatureDefinition): boolean => feature.stage === 'beta';

export const isFeatureListed = (feature: FeatureDefinition): boolean => feature.stage !== 'admin';

export const canUseFeature = (feature: FeatureDefinition, isAdmin: boolean): boolean => (
    (!feature.stage || feature.stage === 'public') || (feature.stage === 'beta' && isAdmin)
);

export const getFooterFeatures = (isAdmin: boolean): FeatureDefinition[] => (
    getAllFeatures().filter(feature => feature.showInFooter && canUseFeature(feature, isAdmin))
);

/** 
 * Helper to determine if a feature should show a "NEW" badge.
 * Defaults to true if releaseDate is within the last 30 days.
 */
export const shouldShowNewBadge = (feature: FeatureDefinition): boolean => {
    if (!feature.releaseDate) return false;

    try {
        const releaseDate = new Date(feature.releaseDate);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return releaseDate > thirtyDaysAgo;
    } catch (_e) {
        console.error(`Invalid releaseDate for feature ${feature.id}: ${feature.releaseDate}`);
        return false;
    }
};
