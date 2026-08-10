export interface ExperienceBlock {
    id: string;
    type: 'summary' | 'work' | 'education' | 'project' | 'skill' | 'volunteer' | 'other';
    title: string;       // Job Title, Degree, or Project Name
    organization: string; // Company, School, or Organization
    dateRange: string;   // e.g. "Jan 2023 - Present"
    bullets: string[];   // The specific points
    isVisible: boolean;  // toggle to include/exclude in analysis
    narrativeContext?: string; // Story behind the bullets, captured via resume interview
}

export interface ResumeSuggestion {
    id: string;
    type: 'add' | 'update' | 'remove';
    suggestion: string;
    impact: string;
    source: string;
    dateAdded: number;
}

export type CandidateStorySource = 'resume_interview' | 'general_interview' | 'profile_interview';

export interface CandidateStory {
    id: string;
    text: string;
    tags: string[];
    source: CandidateStorySource;
    question?: string;
    approvedAt: number;
}

export interface CandidateProfileSignal {
    id: string;
    key: 'career_stage' | 'career_direction' | 'education_status' | 'preferred_emphasis' | 'boundary';
    value: string;
    source: 'profile_interview' | 'user_setting';
    approvedAt: number;
}

export type CandidateProfileInsightKey = 'possible_first_role' | 'current_education';
export type CandidateProfileInsightStatus = 'confirmed' | 'dismissed';

export interface CandidateProfileInsightSuggestion {
    key: CandidateProfileInsightKey;
    value: string;
    reason: string;
    source: 'resume';
    sourceVersion: string;
}

export interface CandidateProfileInsight extends CandidateProfileInsightSuggestion {
    id: string;
    status: CandidateProfileInsightStatus;
    updatedAt: number;
}

export interface CandidateProfileContext {
    signals: CandidateProfileSignal[];
    stories: CandidateStory[];
    insights?: CandidateProfileInsight[];
    completedAt?: number;
}

export interface ResumeProfile {
    id: string;
    name: string;
    blocks: ExperienceBlock[];
    suggestedUpdates?: ResumeSuggestion[]; // New: Persistent bank of AI suggestions
    candidateProfile?: CandidateProfileContext; // Approved reusable context from profile/general interviews
    updatedAt?: number;
    importRevision?: number; // Incremented on each PDF import to trigger UI sync
}

export interface RoleModelProfile {
    id: string;
    name: string;
    headline: string;
    organization: string;
    topSkills: string[];
    careerSnapshot: string;
    experience: ExperienceBlock[];
    rawTextSummary: string;
    dateAdded: number;
}

export interface ResumeRow {
    id: string;
    user_id: string;
    profile_id: string;
    content: ResumeProfile;
    name?: string;
    created_at?: string;
    updated_at?: string;
}
