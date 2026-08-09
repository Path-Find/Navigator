export type JobRequirementCategory = 'skill' | 'education' | 'coursework' | 'experience' | 'hard_gate' | 'other';
export type JobRequirementPriority = 'required' | 'preferred' | 'hard_gate';

export interface JobRequirement {
    text: string;
    category: JobRequirementCategory;
    priority: JobRequirementPriority;
}

export interface DistilledJob {
    companyName: string;
    roleTitle: string;
    location?: string | null;
    applicationDeadline: string | null;
    keySkills: string[];
    requiredSkills?: { name: string; level: 'learning' | 'comfortable' | 'expert' }[];
    coreResponsibilities: string[];
    salaryRange?: string | null;
    coverLetterHooks?: string[]; // Employer/role-specific details worth referencing in a letter.
    source?: string | null;
    category?: 'technical' | 'general' | 'managerial' | 'trades' | 'healthcare' | 'creative'; // AI-determined category
    canonicalTitle?: string; // New: Standardized title for farming
    isAiBanned?: boolean; // New: Safety flag
    aiBanReason?: string; // New: Context for the ban
    referenceCode?: string | null; // New: Capture job ID/reference number
    requirements?: JobRequirement[]; // Structured source of truth; legacy arrays below remain for compatibility.
    educationRequirements?: string[];
    courseworkRequirements?: string[];
    experienceRequirements?: string[];
    hardGates?: string[];
    preferredRequirements?: string[];
}

export interface CoverLetterCritique {
    decision: 'Reject' | 'Weak' | 'Average' | 'Strong' | 'Exceptional';
    feedback: string[];
    strengths: string[];
    hallucinationAlerts?: string[];
}

export interface JobAnalysis {
    compatibilityScore?: number;
    bestResumeProfileId?: string;
    reasoning?: string;
    strengths?: string[];
    weaknesses?: string[];
    distilledJob: DistilledJob;
    cleanedDescription?: string; // New: Persist the cleaned description for reuse
    // OLD: Single generic list
    tailoringInstructions?: string[]; // Kept for backwards compatibility with old analyses
    // NEW: Separate lists for resume vs cover letter
    resumeTailoringInstructions?: string[];
    coverLetterTailoringInstructions?: string[];
    recommendedBlockIds?: string[]; // New: AI tells us exactly which blocks to keep
    internalAnalysis?: string; // New: Private scratchpad for AI "thinking" & logic checks
    selectedAcademicEvidence?: string[]; // Relevant transcript facts selected for downstream writing
}

export interface SavedJob {
    id: string; // The unique Submission ID for this specific user action
    roleId?: string; // The canonical ID for the role (e.g. 'software-engineer')
    company: string;
    position: string;
    description: string;
    url?: string;
    location?: string;
    dateAdded: number;
    updatedAt?: number;

    // Legacy / Full Analysis
    analysis?: JobAnalysis;

    // Analysis & Content
    fitScore?: number;
    fitAnalysis?: string;
    resumeId: string; // The resume used for this application

    // Application Assets
    contextNotes?: string;
    coverLetter?: string;
    customInstructions?: string; // "Make it punchy"
    coverLetterCritique?: string | CoverLetterCritique;

    // Hyper-Tailored Resume (Ephemeral)
    // Key = Block ID, Value = Rewritten Bullets
    tailoredResumes?: Record<string, string[]>;
    tailoredSummary?: string;
    tailorCounts?: Record<string, number>; // Tracks how many times each block has been tailored

    // Optimization / A/B Testing
    initialCoverLetter?: string; // The raw AI output before user edits
    promptVersion?: string;      // ID of the prompt variant used
    editScore?: number;          // Levenshtein distance (lower = better)

    // Analysis Progress (Ephemeral-ish)
    progress?: number; // 0-100
    progressMessage?: string; // e.g. "Extracting details..."

    // Outcome Tracking
    status?: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected' | 'ghosted' | 'analyzing' | 'error' | 'feed';
}

export interface JobFeedItem {
    id: string;
    title: string;
    company: string;
    location: string;
    url: string;
    postedDate: string; // ISO string
    matchScore?: number;
    source: 'scraped' | 'other' | 'email';
    sourceType?: 'scraper' | 'email';
    triageReasoning?: string;
    isNew?: boolean;
}

export interface InterviewQuestion {
    id: string;
    question: string;
    rationale?: string;
    category: 'technical' | 'behavioral' | 'situational'; // Re-added
    tips?: string;
    followUp?: InterviewQuestion;
    isFollowUp?: boolean; // New: Flag to identify inserted follow-up questions
}

export interface InterviewResponseAnalysis {
    decision: 'Reject' | 'Weak' | 'Average' | 'Strong' | 'Exceptional';
    feedback: string;
    strengths: string[];
    improvements: string[];
    betterVersion: string;
    resumeSuggestions?: {
        type: 'add' | 'update' | 'remove';
        suggestion: string;
        impact: string;
    }[];
}
