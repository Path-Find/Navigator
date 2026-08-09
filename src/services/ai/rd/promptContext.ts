import type { ResumeProfile } from '../../../types';
import { anchorData } from '../../../prompts/anchoring';
import { MODELING_DISTILLER, TRAJECTORY_MAPPER_PROMPT } from '../../../prompts/modeling';

export interface HistoricalSignal {
    source_type?: string | null;
    metadata?: {
        text_checksum?: string | null;
    } | null;
}

export const buildStyleDistillerPrompt = (signalSummary: string): string => `
${MODELING_DISTILLER}

CONTEXT:
Signals marked as WINNING PATTERNS directly resulted in an interview, offer, or application. Prioritize those stylistic choices.

USER SIGNALS DATA:
${anchorData('USER_SIGNALS', signalSummary)}

STYLE GUIDE:
`.trim();

export const formatTrajectoryProfile = (profile: ResumeProfile): string => JSON.stringify({
    blocks: profile.blocks
        .filter(block => block.isVisible)
        .map(({ type, title, organization, dateRange, bullets }) => ({
            type,
            title,
            organization,
            dateRange,
            bullets,
        })),
});

export const formatHistoricalSignals = (signals: HistoricalSignal[]): string => signals
    .map(signal => `- [${signal.source_type || 'unknown'}]: ${signal.metadata?.text_checksum || '(no summary)'}`)
    .join('\n');

export const buildTrajectoryPrompt = (
    targetTitle: string,
    currentProfile: ResumeProfile,
    historicalSignals: HistoricalSignal[]
): string => `
${TRAJECTORY_MAPPER_PROMPT}

TARGET ROLE DATA:
${anchorData('TARGET_ROLE', targetTitle)}

CURRENT PROFILE DATA:
${anchorData('CURRENT_PROFILE', formatTrajectoryProfile(currentProfile))}

HISTORICAL SIGNALS DATA:
${anchorData('HISTORICAL_SIGNALS', formatHistoricalSignals(historicalSignals))}
`.trim();
