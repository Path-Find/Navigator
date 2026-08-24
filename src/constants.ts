/**
 * Application Constants
 * All magic numbers and configuration values in one place
 */
import { version } from '../package.json';

export const APP_VERSION = version;
export const CURRENT_JOB_ANALYSIS_VERSION = 1;
export const LATEST_TOS_VERSION = 20240221; // Match implementation date

// API & Retry Configuration
export const API_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY_MS: 2000,
  RETRY_BACKOFF_MULTIPLIER: 2,
  REQUEST_TIMEOUT_MS: 120000, // 2 minutes
} as const;

export const AGENT_LOOP = {
  MAX_RETRIES: 2,           // Maximum times the agent can self-correct
  QUALITY_THRESHOLD: 70,    // Score below which the agent triggers a rewrite
} as const;

export const RESUME_TAILORING = {
  MAX_TAILORS_PER_BLOCK: 2, // Max times a single block can be hyper-tailored per job
} as const;

// Content Validation
export const CONTENT_VALIDATION = {
  MIN_PDF_TEXT_LENGTH: 50,
  MIN_SCRAPED_TEXT_LENGTH: 50,
  MAX_JOB_DESCRIPTION_LENGTH: 15000,
  SCRAPE_FAILURE_THRESHOLD: 0.8, // 80% failure rate triggers a block
  SCRAPE_MIN_ATTEMPTS: 5,         // Minimum attempts before blocking a domain
} as const;

// Job Analysis Thresholds
export const JOB_ANALYSIS = {
  MIN_MATCH_SCORE: 0,
  MAX_MATCH_SCORE: 100,
  HIGH_QUALITY_THRESHOLD: 80,
  REJECTION_THRESHOLD: 50,
} as const;

// Time Periods
export const TIME_PERIODS = {
  NUDGE_THRESHOLD_MS: 21 * 24 * 60 * 60 * 1000, // 3 weeks in milliseconds
  APPLIED_NUDGE_THRESHOLD_MS: 7 * 24 * 60 * 60 * 1000, // 1 week — stale "applied" jobs
  FEED_CACHE_HOURS: 24,
  SUCCESS_MESSAGE_DURATION_MS: 3000,
  NUDGE_DELAY_MS: 1500,
} as const;

// UI Configuration
export const UI_CONFIG = {
  DEBOUNCE_DELAY_MS: 500,
  ANIMATION_DURATION_MS: 300,
  TOAST_DURATION_MS: 3000,
} as const;

// AI Model Configuration - Task-based mapping
// Floating `-latest` aliases only. Pinned versions get retired by Google and start
// returning 404, which takes down every AI feature at once. The server-side
// TIER_MODELS in api/gemini-proxy.ts is what actually picks the model for proxied
// calls; these names are the client-side reference.
export const AI_MODELS = {
  EXTRACTION: 'gemini-flash-lite-latest', // Fast & Cheap
  ANALYSIS_BASIC: 'gemini-flash-latest',
  ANALYSIS_PRO: 'gemini-flash-latest',    // High Reasoning (Standard Pro)
  ANALYSIS_ULTRA: 'gemini-pro-latest',    // State of the Art (Premium)
} as const;

// Tier-to-Model mapping to control costs and access
// TIER_MODELS removed - resolved securely on backend

// Temperature Settings for AI
export const AI_TEMPERATURE = {
  STRICT: 0.0,        // For structured data extraction
  BALANCED: 0.3,      // For tailoring with some creativity
  CREATIVE: 0.7,      // For cover letter generation
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  RESUMES: 'navigator_resumes_v2',
  JOBS_HISTORY: 'navigator_jobs_history',
  SKILLS: 'navigator_user_skills',
  ROLE_MODELS: 'navigator_role_models',
  TARGET_JOBS: 'navigator_target_jobs',
  HISTORY_SEED: 'navigator_history_seed',
  THEME: 'navigator_theme',
  PRIVACY_ACCEPTED: 'navigator_privacy_accepted',
  WELCOME_SEEN: 'navigator_welcome_seen',
  DAILY_USAGE: 'navigator_daily_usage',
  QUOTA_STATUS: 'navigator_quota_status',
  CURRENT_VIEW: 'navigator_current_view',
  ACTIVE_TAB: 'navigator_active_tab',
  EXTENSION_TIP_DISMISSED: 'navigator_extension_tip_dismissed',
  SKILL_SUGGESTIONS: 'navigator_skill_suggestions',
  TRANSCRIPT_CACHE: 'NAVIGATOR_TRANSCRIPT_CACHE',
  FEED_CACHE: 'navigator_feed_cache',
  FEED_CACHE_TIMESTAMP: 'navigator_feed_timestamp',
  ORGS: 'navigator_professional_orgs',
  USER_JOURNEY: 'navigator_user_journey',
  LAST_ARCHETYPE_UPDATE: 'navigator_last_archetype_update',
  ACCEPTED_TOS_VERSION: 'navigator_accepted_tos_version',
  DISMISSED_NOTICES: 'navigator_dismissed_notices',
  DEVICE_ID: 'nav_device_id',
  ONBOARDING_STATE: 'onboarding_state',
  DOMAIN_RELIABILITY: 'navigator_domain_reliability',
} as const;

// Feature Tracking Events
export const TRACKING_EVENTS = {
  JOB_FIT: 'jobfit',
  RESUMES: 'resumes',
  COACH: 'coach',
  SKILLS: 'keywords',
  COVER_LETTERS: 'cover_letters',
} as const;


// Date Display Formats
export const DATE_FORMATS = {
  DISPLAY_FULL: 'MMMM D, YYYY',
  SHORT_MONTH: 'MMM YYYY',
} as const;

// Resume Section Types
export const RESUME_SECTION_TYPES = {
  SUMMARY: 'summary',
  WORK: 'work',
  EDUCATION: 'education',
  PROJECT: 'project',
} as const;

// External Utility Links
export const EXTERNAL_LINKS = {
  SUPPORT_EMAIL: 'mailto:support@navigator.com',
  LINKEDIN_EXPORT_GUIDE: 'https://www.linkedin.com/help/linkedin/answer/a511674',
} as const;

// Application Routes
export const ROUTES = {
  HOME: '/',
  WELCOME: '/welcome',
  PLANS: '/upgrade',
  PLANS_COMPARE: '/upgrade/compare',
  FEATURES: '/features',

  // Jobs Section
  JOB_HOME: '/jobs',
  RESUMES: '/jobs/resumes',
  INTERVIEWS: '/jobs/interviews',
  PROFILE_INTERVIEW: '/jobs/interviews/profile',
  FEED: '/jobs/feed',
  HISTORY: '/jobs/history',
  COVER_LETTERS: '/jobs/cover-letters',
  JOB_DETAIL: '/jobs/:id',
  JOB_MATCH: '/jobs/match',
  PRO_FEED: '/jobs/pro', // Alias if needed

  // Career Section
  CAREER_HOME: '/career',
  SKILLS: '/career/skills',
  CAREER_GROWTH: '/career/growth',
  CAREER_MODELS: '/career/models',
  COACH_ROLE_MODELS: '/career/models',
  COACH_GAP: '/career/gap',
  CAREER_ORGS: '/career/orgs',

  // Education Section
  EDUCATION_HOME: '/education',
  TRANSCRIPT: '/education/transcript', // Formerly GRAD
  GRAD: '/education/transcript',
  GPA_CALCULATOR: '/education/gpa',
  PROGRAM_EXPLORER: '/education/programs',
  COACH_HOME: '/career',

  // Other
  SEO_LANDING: '/resume-for/:role',
  ADMIN: '/admin',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  CONTACT: '/contact',
  SETTINGS: '/settings',
  APPLICATION_PROFILE: '/profile',
  VERIFY_EMAIL: '/verify-email',
  RESET_PASSWORD: '/reset-password',
} as const;

// User Tiers
export const USER_TIERS = {
  FREE: 'free',
  PLUS: 'plus',
  PRO: 'pro',
  ADMIN: 'admin',
  TESTER: 'tester',
} as const;

// Plan Pricing
export const PLAN_PRICING = {
  [USER_TIERS.PLUS]: {
    MONTHLY: 19,
    ANNUAL_MONTHLY: 15,
    PRICE_ID_MONTHLY: 'price_1T2KjOCgQ7xClTHZxDaMextv', // Navigator Plus Monthly (Confirmed)
    PRICE_ID_ANNUAL: 'price_1T2KlyCgQ7xClTHZrBT9Ah6'  // Navigator Plus Annual (Confirmed)
  },
  [USER_TIERS.PRO]: {
    MONTHLY: 29,
    ANNUAL_MONTHLY: 25,
    PRICE_ID_MONTHLY: 'price_1T2KkOCgQ7xClTHZF9S1f1ro', // Navigator Pro Monthly (Confirmed)
    PRICE_ID_ANNUAL: 'price_1T2KmJCgQ7xClTHZnYHfcQQF'  // Navigator Pro Annual (Confirmed)
  },
} as const;


// Usage Limits
// Explorer (free): 3 lifetime analyses, no alerts/mentors
// Plus: 200/week analyses, 5 emails/day, 5 mentors
// Pro: 100/day analyses (effectively unlimited), 25 emails/day, unlimited mentors
export const PLAN_LIMITS = {
  [USER_TIERS.FREE]: {
    DAILY_EMAILS: 0,
    TOTAL_ANALYSES: 3,
    ANALYSES_PERIOD: 'lifetime' as const,
    ROLE_MODELS: 0,
    SKILLS_INTERVIEWS: 0,
  },
  [USER_TIERS.PLUS]: {
    DAILY_EMAILS: 5,
    WEEKLY_ANALYSES: 200,
    ANALYSES_PERIOD: 'weekly' as const,
    ROLE_MODELS: 5,
    SKILLS_INTERVIEWS: 2, // Per month (Comprehensive audit)
  },
  [USER_TIERS.PRO]: {
    DAILY_EMAILS: 25,
    DAILY_ANALYSES: 100,
    ANALYSES_PERIOD: 'daily' as const,
    ROLE_MODELS: 25,
    SKILLS_INTERVIEWS: 5, // Per month (Comprehensive audit)
  },
  [USER_TIERS.ADMIN]: {
    DAILY_EMAILS: 100,
    WEEKLY_ANALYSES: Infinity,
    ANALYSES_PERIOD: 'weekly' as const,
    ROLE_MODELS: Infinity,
    SKILLS_INTERVIEWS: Infinity,
  },
  [USER_TIERS.TESTER]: {
    DAILY_EMAILS: 100,
    WEEKLY_ANALYSES: Infinity,
    ANALYSES_PERIOD: 'weekly' as const,
    ROLE_MODELS: Infinity,
    SKILLS_INTERVIEWS: Infinity,
  },
} as const;

// Alert Thresholds (soft caps — trigger admin notifications)
export const ALERT_THRESHOLDS = {
  [USER_TIERS.PLUS]: { WEEKLY_ANALYSES: 200 },
  [USER_TIERS.PRO]: { DAILY_ANALYSES: 100 },
} as const;

// Job Status Types
export const JOB_STATUS = {
  SAVED: 'saved',
  APPLIED: 'applied',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  REJECTED: 'rejected',
  GHOSTED: 'ghosted',
  ANALYZING: 'analyzing',
  ERROR: 'error',
} as const;

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  SEARCH_HISTORY: 'k',
  HISTORY: 'h',
  RESUMES: 'r',
  NEW_ANALYSIS: 'n',
  PRO_FEED: 'p',
} as const;

// Feature Flags
export const FEATURES = {
  ENABLE_EXTENSION: true,
  ENABLE_DARK_MODE: true,
  ENABLE_KEYBOARD_SHORTCUTS: true,
  ENABLE_RETRY_MESSAGES: true,
} as const;

// Marketing Headlines
export const HEADLINES = {
  all: [
    { text: "Accelerate Your", highlight: "Career" },
    { text: "Unleash Your", highlight: "Potential" },
    { text: "Forge Your", highlight: "Path" },
    { text: "Command Your", highlight: "Future" }
  ],
  apply: [
    { text: "Land Your Next", highlight: "Role" },
    { text: "Perfect Your", highlight: "Match" },
    { text: "Own Your", highlight: "Narrative" },
    { text: "Refine Your", highlight: "Fit" }
  ],
  goal: [
    { text: "Chart Your", highlight: "Course" },
    { text: "Engineer Your", highlight: "Growth" },
    { text: "Define Your", highlight: "Roadmap" },
    { text: "Architect Your", highlight: "Future" },
    { text: "Maximize Your", highlight: "Impact" }
  ],
  edu: [
    { text: "Accelerate Your", highlight: "Growth" },
    { text: "Ignite Your", highlight: "Potential" },
    { text: "Master Your", highlight: "Craft" },
    { text: "Drive Your", highlight: "Success" }
  ],
  plans: [
    { text: "Plans To Match", highlight: "Your Pace" },
    { text: "Fuel Your", highlight: "Next Move" },
    { text: "Back Your", highlight: "Ambition" },
    { text: "Unleash Your", highlight: "Potential" },
    { text: "Supercharge Your", highlight: "Search" }
  ]
} as const;
