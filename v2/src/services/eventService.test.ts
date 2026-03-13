import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventService } from './eventService';
import { STORAGE_KEYS } from '../constants';

describe('EventService', () => {
    const testFeatureId = 'test-feature';
    const storageKey = STORAGE_KEYS.DAILY_USAGE + '_statsv2';

    beforeEach(() => {
        // Clear local storage and mocks before each test
        localStorage.removeItem(storageKey);
        vi.clearAllMocks();
    });

    afterEach(() => {
        localStorage.removeItem(storageKey);
    });

    describe('Normal Functionality', () => {
        it('should track interest correctly', () => {
            EventService.trackInterest(testFeatureId);
            const statsStr = localStorage.getItem(storageKey);
            expect(statsStr).not.toBeNull();
            const stats = JSON.parse(statsStr!);
            expect(stats[testFeatureId].interest).toBe(1);
            expect(stats[testFeatureId].usage).toBe(0);

            // Track again to ensure increment works
            EventService.trackInterest(testFeatureId);
            const statsStr2 = localStorage.getItem(storageKey);
            const stats2 = JSON.parse(statsStr2!);
            expect(stats2[testFeatureId].interest).toBe(2);
        });

        it('should track usage correctly', () => {
            EventService.trackUsage(testFeatureId);
            const statsStr = localStorage.getItem(storageKey);
            expect(statsStr).not.toBeNull();
            const stats = JSON.parse(statsStr!);
            expect(stats[testFeatureId].usage).toBe(1);
            expect(stats[testFeatureId].interest).toBe(0);
        });

        it('should return feature stats correctly', () => {
            EventService.trackInterest(testFeatureId);
            const stats = EventService.getFeatureStats();
            expect(stats[testFeatureId]).toBeDefined();
            expect(stats[testFeatureId].interest).toBe(1);
            expect(stats[testFeatureId].usage).toBe(0);
        });

        it('should reset stats correctly', () => {
            EventService.trackInterest(testFeatureId);
            EventService.resetStats();
            const statsStr = localStorage.getItem(storageKey);
            expect(statsStr).toBeNull();
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid JSON in localStorage gracefully during _increment', () => {
            // Mock console.error to verify it's called and prevent it from polluting test output
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            // Set invalid JSON in localStorage
            localStorage.setItem(storageKey, 'invalid-json{]');

            // Call trackInterest, which calls _increment internally
            // This should not throw an error because of the try-catch block
            expect(() => EventService.trackInterest(testFeatureId)).not.toThrow();

            // Verify that console.error was called
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error tracking event:', expect.any(Error));

            consoleErrorSpy.mockRestore();
        });

        it('should handle invalid JSON in localStorage gracefully during getFeatureStats', () => {
            // Mock console.error to verify it's called and prevent it from polluting test output
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            // Set invalid JSON in localStorage
            localStorage.setItem(storageKey, 'invalid-json{]');

            // Call getFeatureStats
            // This should not throw an error because of the try-catch block
            // It should return an empty object {}
            let stats;
            expect(() => {
                stats = EventService.getFeatureStats();
            }).not.toThrow();
            expect(stats).toEqual({});

            // Verify that console.error was called
            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting feature stats:', expect.any(Error));

            consoleErrorSpy.mockRestore();
        });
    });
});
