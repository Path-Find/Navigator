/**
 * Types for Phase 2 R&D: Semantic Trajectory Mapping
 */

export interface GrowthTrajectory {
    heading: string;
    archetypeShift: {
        from: string;
        to: string;
    };
    keyGrowthSignals: string[];
    trajectoryGap: string;
}

export interface TrajectoryUpdate {
    timestamp: string;
    trajectory: GrowthTrajectory;
    targetTitle?: string;
}
