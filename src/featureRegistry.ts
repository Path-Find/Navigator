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
    /** Optional badge text (manually overridden if present) */
    badge?: string;
    /** ISO date string for feature release (e.g. '2024-01-15') */
    releaseDate?: string;
}

// ─── Shared Color Palette ──────────────────────────────────────────────

export const FEATURE_COLORS: Record<string, FeatureColor> = {
    indigo: {
        bg: 'bg-indigo-50/50 dark:bg-indigo-500/5',
        text: 'text-indigo-500 dark:text-indigo-400',
        accent: 'border-indigo-500/10 dark:border-indigo-500/20',
        iconBg: 'bg-indigo-500',
        preview: 'from-indigo-500/5',
        glow: 'bg-indigo-500/10 group-hover:bg-indigo-500/20',
    },
    'indigo-dark': {
        bg: 'bg-indigo-50/50 dark:bg-indigo-500/5',
        text: 'text-indigo-600 dark:text-indigo-400',
        accent: 'border-indigo-500/10 dark:border-indigo-500/20',
        iconBg: 'bg-indigo-600',
        preview: 'from-indigo-600/5',
        glow: 'bg-indigo-600/10 group-hover:bg-indigo-600/20',
    },
    violet: {
        bg: 'bg-violet-50/50 dark:bg-violet-500/5',
        text: 'text-violet-500 dark:text-violet-400',
        accent: 'border-violet-500/10 dark:border-violet-500/20',
        iconBg: 'bg-violet-500',
        preview: 'from-violet-500/5',
        glow: 'bg-violet-500/10 group-hover:bg-violet-500/20',
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
    return getAllFeatures().filter(f => f.showOnHomepage);
};

/** Get features by tier (cumulative — includes lower tiers) */
export const getFeaturesByTier = (tier: 'explorer' | 'plus' | 'pro'): FeatureDefinition[] => {
    const tierLevel: Record<string, number> = { explorer: 0, plus: 1, pro: 2 };
    const level = tierLevel[tier];
    return getAllFeatures().filter(f => tierLevel[f.tier] <= level);
};

/** Get hand-picked features to highlight on plan cards */
export const getFeaturesForPlan = (tier: 'explorer' | 'plus' | 'pro'): FeatureDefinition[] => {
    return getAllFeatures().filter(f => f.planHighlight && f.tier === tier);
};

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

