import React, { useState, useEffect } from 'react';
import {
    Sparkles, Zap, Bookmark,
    Loader2, ExternalLink
} from 'lucide-react';
import { ScraperService } from '../../services/scraperService';
import { supabase } from '../../services/supabase';
import { analyzeJobFit } from '../../services/geminiService';
import type { JobFeedItem } from '../../types';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { STORAGE_KEYS } from '../../constants';
import { LocalStorage } from '../../utils/localStorage';
import { StandardSearchBar } from '../../components/common/StandardSearchBar';
import { StandardFilterGroup } from '../../components/common/StandardFilterGroup';

import { useJobContext } from './context/JobContext';

export const NavigatorPro: React.FC = () => {
    const {
        handleDraftApplication: onDraftApplication,
        handlePromoteFromFeed: onPromoteFromFeed,
        handleSaveFromFeed: onSaveFromFeed
    } = useJobContext();
    const [feed, setFeed] = useState<JobFeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [filterHighMatch, setFilterHighMatch] = useState(false);
    const [filterClosingSoon, setFilterClosingSoon] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sort, setSort] = useState<'date' | 'match'>('date');





    useEffect(() => {
        loadFeedWithCache();
    }, []);

    const loadFeedWithCache = async () => {
        const ONE_DAY = 24 * 60 * 60 * 1000;

        // Check if we have cached data
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
                    // Cache corrupted — fall through to fetch fresh data
                    LocalStorage.remove(STORAGE_KEYS.FEED_CACHE);
                    LocalStorage.remove(STORAGE_KEYS.FEED_CACHE_TIMESTAMP);
                }
            }
        }

        // Fetch fresh data
        await loadFeed();
    };

    const loadFeed = async () => {
        setLoading(true);
        try {
            // 1. Fetch scraped feed
            const scraperData = await ScraperService.getFeed();

            // 2. Fetch email-captured feed from DB
            const { data: dbFeed } = await supabase
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

            // Cache the raw feed data
            LocalStorage.set(STORAGE_KEYS.FEED_CACHE, JSON.stringify(combinedFeed));
            LocalStorage.set(STORAGE_KEYS.FEED_CACHE_TIMESTAMP, Date.now().toString());

            // Trigger background analysis only for scraped jobs that don't have it
            setTimeout(() => analyzeJobsInBackground(scraperData), 100);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const analyzeJobsInBackground = async (jobs: JobFeedItem[]) => {
        try {
            // Get user's resume and tier
            const { data: resumes } = await supabase
                .from('resumes')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(1);

            if (!resumes || resumes.length === 0) {
                return;
            }

            const resume = resumes[0] as any;

            // Check which jobs already have analysis in Supabase
            const jobUrls = jobs.map(j => j.url);
            const { data: existingJobs } = await supabase
                .from('jobs')
                .select('url, analysis')
                .in('url', jobUrls);

            // Separate cached vs uncached jobs
            const jobsToAnalyze: JobFeedItem[] = [];
            for (const job of jobs) {
                const existing = existingJobs?.find(j => j.url === job.url);
                if (existing?.analysis?.compatibilityScore) {
                    // Use cached match score immediately
                    setFeed(prevFeed => prevFeed.map(f =>
                        f.id === job.id ? { ...f, matchScore: existing.analysis.compatibilityScore } : f
                    ));
                } else {
                    jobsToAnalyze.push(job);
                }
            }

            // Analyze uncached jobs in parallel batches (3 at a time to avoid rate limits)
            const CONCURRENCY = 3;
            for (let i = 0; i < jobsToAnalyze.length; i += CONCURRENCY) {
                const batch = jobsToAnalyze.slice(i, i + CONCURRENCY);
                await Promise.all(batch.map(job => analyzeAndCacheJob(job, resume)));
            }
        } catch (error) {
            console.error("Background analysis failed:", error);
        }
    };

    const analyzeAndCacheJob = async (job: JobFeedItem, resume: any) => {
        try {
            // 1. Scrape Job Text
            let jobText = "";
            try {
                jobText = await ScraperService.scrapeJobContent(job.url);
            } catch (error) {
                console.error(`Failed to scrape text for ${job.url}:`, error);
            }

            if (!jobText) {
                console.warn(`Skipping analysis for ${job.title} - no text found`);
                return;
            }

            // 2. Analyze with Gemini
            const analysis = await analyzeJobFit(jobText, resume.content, undefined, undefined);

            // 3. Update UI with real score
            const matchScore = analysis.compatibilityScore;

            setFeed(prevFeed => prevFeed.map(f =>
                f.id === job.id ? { ...f, matchScore } : f
            ));

            // 4. Cache in Supabase
            // Important: Keep status as 'feed' so it remains in the feed and doesn't clutter history until user takes action
            await supabase.from('jobs').upsert({
                user_id: resume.user_id,
                job_title: job.title,
                company: job.company,
                url: job.url,
                analysis: analysis, // Store full analysis JSON
                status: 'feed'
            }, { onConflict: 'url' });

        } catch (error) {
            console.error(`Failed to analyze job ${job.title}:`, error);
        }
    };

    const handleAction = async (job: JobFeedItem) => {
        setProcessingId(job.id);
        // Invalidate feed cache so promoted job won't reappear
        LocalStorage.remove(STORAGE_KEYS.FEED_CACHE);
        LocalStorage.remove(STORAGE_KEYS.FEED_CACHE_TIMESTAMP);
        if (job.source === 'email' && onPromoteFromFeed) {
            await onPromoteFromFeed(job.id);
        } else {
            await onDraftApplication(job.url);
        }
    };

    const getProcessedFeed = () => {
        let processed = [...feed];

        // Apply High Match filter
        if (filterHighMatch) {
            processed = processed.filter(job => (job.matchScore || 0) >= 85);
        }

        // Apply Search filter
        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            processed = processed.filter(job =>
                job.title.toLowerCase().includes(query) ||
                job.company.toLowerCase().includes(query) ||
                (job.location || '').toLowerCase().includes(query)
            );
        }

        // Apply Closing Soon filter (within 7 days)
        if (filterClosingSoon) {
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            processed = processed.filter(job => {
                const deadline = new Date(job.postedDate);
                return deadline <= sevenDaysFromNow;
            });
        }

        // Sort
        return processed.sort((a, b) => {
            if (sort === 'match') {
                return (b.matchScore || 0) - (a.matchScore || 0);
            }
            // date (newest first)
            return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
        });
    };

    const displayFeed = getProcessedFeed();



    return (
        <SharedPageLayout className="theme-job" spacing="compact" maxWidth="6xl">
            <PageHeader
                title="Feed"
                subtitle="Your personalized stream of high-match professional opportunities."
                variant="simple"
                className="mb-8"
            />
            {/* Filters Row */}
            <div className="mb-8">
                <StandardSearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search"
                    themeColor="indigo"
                    rightElement={
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto">
                            <StandardFilterGroup
                                options={[
                                    { id: 'date', label: 'Newest' },
                                    { id: 'match', label: 'Best Fit' }
                                ]}
                                activeFilter={sort}
                                onSelect={(s) => setSort(s as 'date' | 'match')}
                                themeColor="indigo"
                                className="shrink-0"
                            />

                            <StandardFilterGroup
                                options={[
                                    { id: 'high-match', label: 'High Match', icon: <Sparkles className="w-4 h-4" /> }
                                ]}
                                activeFilter={filterHighMatch ? 'high-match' : ''}
                                onSelect={() => setFilterHighMatch(!filterHighMatch)}
                                themeColor="indigo"
                                className="shrink-0"
                            />

                            <StandardFilterGroup
                                options={[
                                    { id: 'closing-soon', label: 'Closing Soon', icon: <Zap className="w-4 h-4" /> }
                                ]}
                                activeFilter={filterClosingSoon ? 'closing-soon' : ''}
                                onSelect={() => setFilterClosingSoon(!filterClosingSoon)}
                                themeColor="amber"
                                className="shrink-0"
                            />
                        </div>
                    }
                />
            </div>

            {/* Feed */}
            {loading && feed.length === 0 ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 h-40 animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {displayFeed.length === 0 && (
                        <div className="text-center py-20 space-y-4">
                            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-7 h-7 text-neutral-300 dark:text-neutral-600" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-700 dark:text-neutral-300">No matches yet</h3>
                            <p className="text-sm text-neutral-400 max-w-sm mx-auto">
                                {searchTerm || filterHighMatch || filterClosingSoon
                                    ? 'No jobs match your current filters. Try adjusting your criteria.'
                                    : 'Your personalized feed will populate as new opportunities are discovered.'}
                            </p>
                        </div>
                    )}
                    {displayFeed.map((job) => (
                        <div key={job.id} className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group relative overflow-hidden">
                            {job.isNew && (
                                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-4 py-2 rounded-bl-2xl shadow-sm z-10">
                                    NEW
                                </div>
                            )}

                            <div className="flex gap-4">
                                {/* Logo Placeholder */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-xl
                                    ${job.source === 'email' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' :
                                        'bg-blue-50 text-blue-600 dark:bg-blue-900/20'}
                                `}>
                                    {job.company.charAt(0).toUpperCase()}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                                                {job.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                                <span className="font-medium text-neutral-700 dark:text-neutral-300">{job.company}</span>
                                                <span>•</span>
                                                <span>{job.location}</span>
                                                <span>•</span>
                                                <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        {job.matchScore && (
                                            <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded-lg text-sm font-bold border border-indigo-100 dark:border-indigo-800/50 flex items-center gap-1 shrink-0 animate-in fade-in duration-300">
                                                <Sparkles className="w-3 h-3" />
                                                {job.matchScore}% Match
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex items-center gap-3">
                                        <button
                                            onClick={() => handleAction(job)}
                                            disabled={processingId === job.id}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                                        >
                                            {processingId === job.id ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="w-4 h-4" />
                                                    Apply
                                                </>
                                            )}
                                        </button>

                                        {job.source === 'email' && onSaveFromFeed && (
                                            <button
                                                onClick={() => {
                                                    // Invalidate cache so saved job won't reappear on next load
                                                    LocalStorage.remove(STORAGE_KEYS.FEED_CACHE);
                                                    LocalStorage.remove(STORAGE_KEYS.FEED_CACHE_TIMESTAMP);
                                                    onSaveFromFeed(job.id);
                                                }}
                                                className="p-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-indigo-600 rounded-xl transition-colors"
                                                title="Save to History"
                                            >
                                                <Bookmark className="w-5 h-5" />
                                            </button>
                                        )}

                                        <a
                                            href={job.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2.5 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-xl font-medium transition-colors flex items-center gap-2"
                                        >
                                            <span>View</span>
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </SharedPageLayout>
    );
};
