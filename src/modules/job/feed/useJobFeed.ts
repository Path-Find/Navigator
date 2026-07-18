import { useState, useEffect } from 'react';
import { ScraperService } from '../../../services/scraperService';
import { dataClient } from '../../../lib/data-client';
import { analyzeJobFit } from '../../../services/geminiService';
import type { JobFeedItem, ResumeRow } from '../../../types';
import { STORAGE_KEYS } from '../../../constants';
import { SCORE_THRESHOLDS } from '../utils/jobUtils';
import { LocalStorage } from '../../../utils/localStorage';

export const useJobFeed = () => {
    const [feed, setFeed] = useState<JobFeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterHighMatch, setFilterHighMatch] = useState(false);
    const [filterClosingSoon, setFilterClosingSoon] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sort, setSort] = useState<'date' | 'match'>('date');

    useEffect(() => {
        loadFeedWithCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadFeedWithCache = async () => {
        const ONE_DAY = 24 * 60 * 60 * 1000;
        const cachedData = LocalStorage.get(STORAGE_KEYS.FEED_CACHE);
        const cachedTimestamp = LocalStorage.get(STORAGE_KEYS.FEED_CACHE_TIMESTAMP);

        if (cachedData && cachedTimestamp) {
            const age = Date.now() - (parseInt(cachedTimestamp) || 0);
            if (age < ONE_DAY) {
                try {
                    setFeed(JSON.parse(cachedData));
                    setLoading(false);
                    return;
                } catch {
                    LocalStorage.remove(STORAGE_KEYS.FEED_CACHE);
                    LocalStorage.remove(STORAGE_KEYS.FEED_CACHE_TIMESTAMP);
                }
            }
        }
        await loadFeed();
    };

    const loadFeed = async () => {
        setLoading(true);
        try {
            const scraperData = await ScraperService.getFeed();
            const { data: dbFeed } = await dataClient
                .from('jobs')
                .select('*')
                .eq('status', 'feed')
                .order('date_added', { ascending: false });

            const emailJobs: JobFeedItem[] = (dbFeed || []).map(job => ({
                id: job.id,
                title: job.job_title,
                company: job.company,
                location: job.location || 'Unknown',
                url: job.url || '#',
                postedDate: new Date(job.date_added).toISOString(),
                matchScore: job.analysis?.compatibilityScore,
                triageReasoning: job.analysis?.reasoning,
                source: 'email',
                sourceType: 'email',
                isNew: (Date.now() - new Date(job.date_added).getTime()) < (24 * 60 * 60 * 1000)
            }));

            const combinedFeed = [...emailJobs, ...scraperData];
            setFeed(combinedFeed);

            LocalStorage.set(STORAGE_KEYS.FEED_CACHE, JSON.stringify(combinedFeed));
            LocalStorage.set(STORAGE_KEYS.FEED_CACHE_TIMESTAMP, Date.now().toString());

            setTimeout(() => analyzeJobsInBackground(scraperData), 100);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const analyzeJobsInBackground = async (jobs: JobFeedItem[]) => {
        try {
            const { data: resumes } = await dataClient
                .from('resumes')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1);

            if (!resumes?.length) return;
            const resume = resumes[0] as ResumeRow;

            const jobUrls = jobs.map(j => j.url);
            const { data: existingJobs } = await dataClient
                .from('jobs')
                .select('url, analysis')
                .in('url', jobUrls);

            const jobsToAnalyze: JobFeedItem[] = [];
            for (const job of jobs) {
                const existing = existingJobs?.find(j => j.url === job.url);
                if (existing?.analysis?.compatibilityScore) {
                    setFeed(prev => prev.map(f =>
                        f.id === job.id ? { ...f, matchScore: existing.analysis.compatibilityScore } : f
                    ));
                } else {
                    jobsToAnalyze.push(job);
                }
            }

            const CONCURRENCY = 3;
            for (let i = 0; i < jobsToAnalyze.length; i += CONCURRENCY) {
                const batch = jobsToAnalyze.slice(i, i + CONCURRENCY);
                await Promise.all(batch.map(job => analyzeAndCacheJob(job, resume)));
            }
        } catch (error) {
            console.error("Background analysis failed:", error);
        }
    };

    const analyzeAndCacheJob = async (job: JobFeedItem, resume: ResumeRow) => {
        try {
            const jobText = await ScraperService.scrapeJobContent(job.url);
            if (!jobText) return;

            const analysis = await analyzeJobFit(jobText, [resume.content], undefined, undefined);
            const matchScore = analysis.compatibilityScore;

            setFeed(prev => prev.map(f => f.id === job.id ? { ...f, matchScore } : f));

            await dataClient.from('jobs').upsert({
                user_id: resume.user_id,
                job_title: job.title,
                company: job.company,
                url: job.url,
                analysis,
                status: 'feed'
            }, { onConflict: 'url' });
        } catch (error) {
            console.error(`Failed to analyze job ${job.title}:`, error);
        }
    };

    const getProcessedFeed = () => {
        let processed = [...feed];
        if (filterHighMatch) {
            processed = processed.filter(job => (job.matchScore || 0) >= SCORE_THRESHOLDS.STRONG);
        }
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            processed = processed.filter(job =>
                job.title.toLowerCase().includes(query) ||
                job.company.toLowerCase().includes(query) ||
                (job.location || '').toLowerCase().includes(query)
            );
        }
        if (filterClosingSoon) {
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            processed = processed.filter(job => new Date(job.postedDate) <= sevenDaysFromNow);
        }

        return processed.sort((a, b) => {
            if (sort === 'match') {
                const diff = (b.matchScore || 0) - (a.matchScore || 0);
                if (diff !== 0) return diff;
            }
            return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        });
    };

    return {
        feed,
        loading,
        getProcessedFeed,
        searchTerm,
        setSearchTerm,
        sort,
        setSort,
        filterHighMatch,
        setFilterHighMatch,
        filterClosingSoon,
        setFilterClosingSoon
    };
};
