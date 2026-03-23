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

export interface ResumeProfile {
    id: string;
    name: string;
    blocks: ExperienceBlock[];
    suggestedUpdates?: ResumeSuggestion[]; // New: Persistent bank of AI suggestions
    updatedAt?: number;
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
    content: ResumeProfile[];
    name?: string;
    created_at?: string;
}
