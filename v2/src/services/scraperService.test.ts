import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScraperService } from './scraperService';

// Mock fetch globally
global.fetch = vi.fn();

describe('ScraperService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return an empty feed', async () => {
        const jobs = await ScraperService.getFeed();

        expect(jobs).toHaveLength(0);
        expect(global.fetch).not.toHaveBeenCalled();
    });
});
