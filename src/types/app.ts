import type { ResumeProfile, RoleModelProfile } from '../modules/resume/types';
import type { SavedJob } from '../modules/job/types';
import type { TargetJob } from './target';
import type { CustomSkill } from '../modules/skills/types';

export type UserTier = 'free' | 'plus' | 'pro' | 'admin' | 'tester';

export interface ProfessionalOrg {
    id: string;
    name: string;
    addedAt: number;
}

export interface AppState {
    resumes: ResumeProfile[];
    jobs: SavedJob[];
    roleModels: RoleModelProfile[];
    targetJobs: TargetJob[];
    skills: CustomSkill[];
    apiStatus: 'ok' | 'offline' | 'checking';
    activeSubmissionId: string | null;
    importError?: string | null;
}
