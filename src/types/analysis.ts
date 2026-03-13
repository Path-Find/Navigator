export interface GapAction {
    type: 'project' | 'metric' | 'certification' | 'tool';
    task: string;
    metric: string;
    tools: string[];
    resumeBullet?: string;
}

export interface SkillGap {
    skill: string;
    importance: number; // 1-5
    gapDescription: string;
    actionableEvidence: GapAction[];
}

export interface StrategicMove {
    title: string;
    description: string;
    timing: string; // e.g., "Year 2-3"
    prevalence: string; // e.g., "Common pivot point (3/5 models)"
}

export interface GapAnalysisResult {
    careerTrajectoryGap: string;
    strategicPathPatterns: StrategicMove[];
    topSkillGaps: SkillGap[];
    estimatedTimeToBridge: string;
    dateGenerated: number;
}

export interface RoadmapMilestone extends GapAction {
    id: string;
    title: string;
    month: number; // 1-12
    status: 'pending' | 'completed';
    linkedSkill: string;
}
