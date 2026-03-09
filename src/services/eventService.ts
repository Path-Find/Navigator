import { STORAGE_KEYS } from '../constants';
import { LocalStorage } from '../utils/localStorage';

export interface FeatureStats {
    [featureId: string]: {
        interest: number;
        usage: number;
    };
}

/**
 * EventService handles client-side event tracking, such as feature usage.
 * Currently stores data in localStorage for simple persistent tracking.
 */
export const EventService = {
    /**
     * Record a user's interest in a feature (e.g. clicking a card).
     */
    trackInterest: (featureId: string): void => {
        EventService._increment(featureId, 'interest');
    },

    /**
     * Record actual usage of a feature (e.g. successfully analyzing a job).
     */
    trackUsage: (featureId: string): void => {
        EventService._increment(featureId, 'usage');
    },

    _increment: (featureId: string, type: 'interest' | 'usage'): void => {
        try {
            const statsStr = LocalStorage.get(STORAGE_KEYS.DAILY_USAGE + '_statsv2') || '{}';
            const stats: FeatureStats = JSON.parse(statsStr);

            if (!stats[featureId]) {
                stats[featureId] = { interest: 0, usage: 0 };
            }

            stats[featureId][type]++;

            LocalStorage.set(STORAGE_KEYS.DAILY_USAGE + '_statsv2', JSON.stringify(stats));

            if (import.meta.env.DEV) {
                console.log(`[Tracking] ${type === 'interest' ? 'Curiosity' : 'Usage'}: ${featureId} (Total: ${stats[featureId][type]})`);
            }
        } catch (error) {
            console.error('Error tracking event:', error);
        }
    },

    /**
     * Get all recorded feature usage statistics.
     */
    getFeatureStats: (): FeatureStats => {
        try {
            const statsStr = LocalStorage.get(STORAGE_KEYS.DAILY_USAGE + '_statsv2') || '{}';
            return JSON.parse(statsStr);
        } catch (error) {
            console.error('Error getting feature stats:', error);
            return {};
        }
    },

    /**
     * Reset all feature usage statistics.
     */
    resetStats: (): void => {
        LocalStorage.remove(STORAGE_KEYS.DAILY_USAGE + '_statsv2');
    }
};
