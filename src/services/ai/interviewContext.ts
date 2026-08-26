import type { ResumeProfile } from '../../types';
import { formatResumeBlocks, selectRelevantResumeBlocks } from './resumeContext';

/** Backward-compatible interview names for the shared resume context helpers. */
export const selectInterviewBlocks = selectRelevantResumeBlocks;

export const formatInterviewBlocks = (profile: ResumeProfile, reference = ''): string =>
    formatResumeBlocks(profile, reference);
