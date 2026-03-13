import type { GapAnalysisResult, RoadmapMilestone } from './analysis';

export interface TargetJob {
    id: string;
    title: string;          // e.g. "Senior Product Manager"
    company?: string;       // Optional, if they have a specific target
    type?: 'job' | 'role_model'; // Defaults to 'job'
    roleModelId?: string;
    description: string;    // The pasted JD or requirements
    dateAdded: number;
    gapAnalysis?: GapAnalysisResult;
    roadmap?: RoadmapMilestone[];
    strictMode?: boolean; // New: allow user to toggle hard skill filter
}
