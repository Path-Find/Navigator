export type EducationCredentialType =
    | 'High school'
    | 'Certificate'
    | 'Diploma'
    | 'Associate degree'
    | "Bachelor's degree"
    | "Master's degree"
    | 'Doctorate'
    | 'Professional degree'
    | 'Other';

export interface ExperienceBlock {
    id: string;
    type: 'summary' | 'work' | 'education' | 'project' | 'skill' | 'volunteer' | 'other';
    title: string;       // Job Title, Degree, or Project Name
    organization: string; // Company, School, or Organization
    credentialType?: EducationCredentialType;
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

export type CandidateProfileFactSource = 'resume' | 'education_record' | 'profile_interview' | 'user_setting' | 'imported_profile';
export type CandidateProfileFactCategory = 'direction' | 'availability' | 'experience' | 'skill' | 'preference' | 'story' | 'education';
export type CandidateProfileFactStatus = 'confirmed' | 'dismissed' | 'stale';

/** A source-labelled fact that can be reviewed before it becomes prompt context. */
export interface CandidateProfileFact {
    id: string;
    category: CandidateProfileFactCategory;
    value: string;
    tags: string[];
    source: CandidateProfileFactSource;
    sourceLabel: string;
    sourceVersion: string;
    status: CandidateProfileFactStatus;
    updatedAt: number;
}

export type CandidateEducationCourseStatus = 'completed' | 'upcoming' | 'withdrawn';

/** Compact course context. It intentionally does not store a raw transcript. */
export interface CandidateEducationCourse {
    id: string;
    code: string;
    title: string;
    term: string;
    status: CandidateEducationCourseStatus;
    source: 'education_record' | 'transcript';
    sourceVersion: string;
    grade?: string;
}

export interface CandidateEducationContext {
    university: string;
    program?: string;
    courses: CandidateEducationCourse[];
    source: 'education_record' | 'transcript';
    sourceVersion: string;
    capturedAt: number;
}

export type CandidateRelocationPreference = 'not_open' | 'within_region' | 'within_country' | 'open_to_relocation' | 'depends';
export type CandidateWorkArrangement = 'on_site' | 'hybrid' | 'remote' | 'no_preference';
export type CandidateEmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'co_op' | 'seasonal';
export type CandidateStartTiming = 'immediately' | 'within_one_month' | 'specific_date' | 'flexible';

/** Structured availability preferences. City is the only short user-entered field. */
export interface CandidateAvailability {
    city?: string;
    relocation: CandidateRelocationPreference;
    workArrangements: CandidateWorkArrangement[];
    employmentTypes: CandidateEmploymentType[];
    startTiming: CandidateStartTiming;
    startDate?: string;
    updatedAt: number;
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
    facts?: CandidateProfileFact[];
    education?: CandidateEducationContext;
    availability?: CandidateAvailability;
    currentBlockIds?: string[];
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
