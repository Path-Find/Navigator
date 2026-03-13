import { ROUTES } from '../constants';

export type ViewId =
    | 'home'
    | 'job-home'
    | 'feed'
    | 'history'
    | 'resumes'
    | 'interviews'
    | 'cover-letters'
    | 'job-detail'
    | 'coach-home'
    | 'skills'
    | 'coach-role-models'
    | 'coach-comparison'
    | 'career-growth'
    | 'coach-gap-analysis'
    | 'edu-home'
    | 'edu-transcript'
    | 'edu-gpa'
    | 'edu-programs'
    | 'admin'
    | 'privacy'
    | 'terms'
    | 'contact'
    | 'plans'
    | 'plans-compare'
    | 'features'
    | 'welcome'
    | 'settings'
    | 'skills-interview'
    | 'career-orgs'
    | 'career-salary';

const PATH_TO_VIEW: Record<string, ViewId> = {
    [ROUTES.HOME]: 'home',
    [ROUTES.JOB_HOME]: 'job-home',
    [ROUTES.FEED]: 'feed',
    [ROUTES.PRO_FEED]: 'feed',
    [ROUTES.HISTORY]: 'history',
    [ROUTES.RESUMES]: 'resumes',
    [ROUTES.INTERVIEWS]: 'interviews',
    [ROUTES.COVER_LETTERS]: 'cover-letters',
    [ROUTES.CAREER_HOME]: 'coach-home',
    [ROUTES.SKILLS]: 'skills',
    [ROUTES.CAREER_MODELS]: 'coach-role-models',
    [ROUTES.CAREER_GROWTH]: 'career-growth',
    [ROUTES.COACH_GAP]: 'coach-gap-analysis',
    [ROUTES.CAREER_ORGS]: 'career-orgs',
    [ROUTES.EDUCATION_HOME]: 'edu-home',
    [ROUTES.TRANSCRIPT]: 'edu-transcript',
    [ROUTES.GPA_CALCULATOR]: 'edu-gpa',
    [ROUTES.PROGRAM_EXPLORER]: 'edu-programs',
    [ROUTES.ADMIN]: 'admin',
    [ROUTES.PRIVACY]: 'privacy',
    [ROUTES.TERMS]: 'terms',
    [ROUTES.CONTACT]: 'contact',
    [ROUTES.PLANS]: 'plans',
    [ROUTES.PLANS_COMPARE]: 'plans-compare',
    [ROUTES.FEATURES]: 'features',
    [ROUTES.WELCOME]: 'welcome',
    [ROUTES.SETTINGS]: 'settings',
    ['/career/skills/interview']: 'skills-interview',
};

const VIEW_TO_PATH: Record<ViewId, string> = {
    'home': ROUTES.HOME,
    'job-home': ROUTES.JOB_HOME,
    'feed': ROUTES.FEED,
    'history': ROUTES.HISTORY,
    'resumes': ROUTES.RESUMES,
    'interviews': ROUTES.INTERVIEWS,
    'cover-letters': ROUTES.COVER_LETTERS,
    'job-detail': ROUTES.JOB_HOME, // Dynamic route handled specifically
    'coach-home': ROUTES.CAREER_HOME,
    'skills': ROUTES.SKILLS,
    'coach-role-models': ROUTES.CAREER_MODELS,
    'coach-comparison': ROUTES.CAREER_HOME,
    'career-growth': ROUTES.CAREER_GROWTH,
    'coach-gap-analysis': ROUTES.CAREER_HOME,
    'edu-home': ROUTES.EDUCATION_HOME,
    'edu-transcript': ROUTES.TRANSCRIPT,
    'edu-gpa': ROUTES.GPA_CALCULATOR,
    'edu-programs': ROUTES.PROGRAM_EXPLORER,
    'admin': ROUTES.ADMIN,
    'privacy': ROUTES.PRIVACY,
    'terms': ROUTES.TERMS,
    'contact': ROUTES.CONTACT,
    'plans': ROUTES.PLANS,
    'plans-compare': ROUTES.PLANS_COMPARE,
    'features': ROUTES.FEATURES,
    'welcome': ROUTES.WELCOME,
    'settings': ROUTES.SETTINGS,
    'skills-interview': '/career/skills/interview',
    'career-orgs': ROUTES.CAREER_ORGS,
    'career-salary': ROUTES.CAREER_HOME,
};

export const getViewIdFromPath = (path: string): ViewId => {
    // Exact matches
    if (PATH_TO_VIEW[path]) return PATH_TO_VIEW[path];

    // Dynamic matches
    if (path.startsWith('/jobs/match/')) return 'job-detail';
    if (path.startsWith('/resume-for/')) return 'home';

    // Default or fuzzy matches if needed
    return 'home';
};

export const getPathFromViewId = (viewId: ViewId): string => {
    return VIEW_TO_PATH[viewId] || ROUTES.HOME;
};

export const getModeFromViewId = (viewId: string) => {
    const isCoachMode = viewId.startsWith('career') || viewId.startsWith('coach') || viewId === 'skills' || viewId === 'skills-interview';
    const isEduMode = viewId.startsWith('edu');
    const isJobMode = !isCoachMode && !isEduMode && !['privacy', 'home', 'admin', 'plans', 'plans-compare', 'settings', 'welcome', 'features', 'terms', 'contact'].includes(viewId);

    return { isCoachMode, isEduMode, isJobMode };
};
