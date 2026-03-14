import { supabase } from './supabase';
import type { JobFeedItem } from '../types';
import { LocalStorage } from '../utils/localStorage';
import { CONTENT_VALIDATION, STORAGE_KEYS } from '../constants';

export const ScraperService = {
    async getFeed(): Promise<JobFeedItem[]> {
        // Feed discovery source required
        return [];
    },

    isUrlScrapable(url: string): boolean {
        try {
            const hostname = new URL(url).hostname.replace('www.', '').toLowerCase();
            const rawStats = LocalStorage.get(STORAGE_KEYS.DOMAIN_RELIABILITY);
            const stats = rawStats ? JSON.parse(rawStats) : {};
            const domainStats = stats[hostname] as { f: number, t: number } | undefined;

            if (domainStats && domainStats.t >= CONTENT_VALIDATION.SCRAPE_MIN_ATTEMPTS) {
                const failureRate = domainStats.f / domainStats.t;
                return failureRate < CONTENT_VALIDATION.SCRAPE_FAILURE_THRESHOLD;
            }
            return true;
        } catch {
            return false;
        }
    },

    recordScrapeOutcome(url: string, success: boolean): void {
        try {
            const hostname = new URL(url).hostname.replace('www.', '').toLowerCase();
            const rawStats = LocalStorage.get(STORAGE_KEYS.DOMAIN_RELIABILITY);
            const stats = rawStats ? JSON.parse(rawStats) : ({} as Record<string, { f: number, t: number }>);

            if (!stats[hostname]) {
                stats[hostname] = { f: 0, t: 0 };
            }

            stats[hostname].t += 1;
            if (!success) {
                stats[hostname].f += 1;
            }

            LocalStorage.set(STORAGE_KEYS.DOMAIN_RELIABILITY, JSON.stringify(stats));
        } catch {
            // Silently fail if storage issues
        }
    },

    async scrapeJobContent(targetUrl: string): Promise<string> {
        if (!this.isUrlScrapable(targetUrl)) {
            throw new Error("DOMAIN_BLOCKED");
        }

        // Use Supabase Edge Function for secure, server-side scraping
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("Proxy Error: Authentication required. Please sign in again.");
            }

            const { data, error } = await supabase.functions.invoke('scrape-jobs', {
                body: { url: targetUrl, mode: 'text' },
                headers: {
                    Authorization: `Bearer ${session.access_token}`
                }
            });

            if (error) {
                console.error("Edge function error:", error);
                throw new Error(`Failed to scrape job content: ${error.message || 'Unknown error'}`);
            }

            if (!data?.text || data.text.length < CONTENT_VALIDATION.MIN_SCRAPED_TEXT_LENGTH) {
                throw new Error("Scraped content is too short or empty. The job posting may not be accessible.");
            }

            this.recordScrapeOutcome(targetUrl, true);
            return data.text;
        } catch (error) {
            console.error("Job scraping failed:", error);
            this.recordScrapeOutcome(targetUrl, false);
            throw error instanceof Error ? error : new Error("Failed to scrape job content");
        }
    },
};
