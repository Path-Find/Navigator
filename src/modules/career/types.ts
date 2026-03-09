export const COACH_VIEWS = ['coach-home', 'coach-role-models', 'coach-gap-analysis', 'coach-comparison', 'career-growth', 'skills', 'career-orgs', 'career-salary'] as const;

export type CoachViewType = typeof COACH_VIEWS[number];

export const isCoachView = (view: string): view is CoachViewType => {
    return (COACH_VIEWS as readonly string[]).includes(view);
};
