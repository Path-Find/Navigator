import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Link as LinkIcon,
    FileText,
    Loader2,
    Sparkles,
    Target,
    Zap,
    FileSearch,
} from 'lucide-react';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { EventService } from '../../services/eventService';
import { UsageIndicator } from './UsageIndicator';
import { useToast } from '../../contexts/ToastContext';
import { useHeadlines } from '../../hooks/useHeadlines';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BentoCard } from '../../components/ui/BentoCard';
import { FEATURE_COLORS } from '../../featureRegistry';

import type { SavedJob } from '../../types';
import { STORAGE_KEYS, TRACKING_EVENTS } from '../../constants';
import { LocalStorage } from '../../utils/localStorage';

import { useUser } from '../../contexts/UserContext';
import { useGlobalUI } from '../../contexts/GlobalUIContext';
import { useModal } from '../../contexts/ModalContext';
import { useJobContext } from './context/JobContext';
import { useResumeContext } from '../resume/context/ResumeContext';

const JobMatchInput: React.FC = () => {
    const { user, isAdmin } = useUser();
    const { setView: onNavigate } = useGlobalUI();
    const { openModal } = useModal();
    const {
        handleJobCreated: onJobCreated,
        usageStats
    } = useJobContext();
    const {
        resumes,
    } = useResumeContext();

    const { showSuccess, showError } = useToast();
    const [url, setUrl] = useState('');
    const [manualDescription, setManualDescription] = useState('');
    const [isManualMode, setIsManualMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isScrapingUrl, setIsScrapingUrl] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const activeHeadline = useHeadlines('apply');
    const lastUrlRef = useRef<string>('');
    // Synchronous re-entrancy guard for handleJobSubmission. `isAnalyzing` state
    // is not safe for this on its own — a burst of Enter keydowns (rapid manual
    // paste/typing, or an automation tool dispatching one keydown per newline in
    // pasted text) can fire handleJobSubmission several times before React has a
    // chance to re-render with isAnalyzing=true, since state reads inside the
    // callback are stale until the next render. Each re-entrant call created a
    // brand new job with a fresh UUID, blank title/company, and whatever partial
    // text was in state at that instant — every one of those calls also writes a
    // permanent row to the cloud jobs table via onJobCreated, so a rapid burst
    // left dozens of permanent "New Job" / "Unknown Company" garbage rows behind.
    // A ref is checked and set synchronously, so it closes the gap regardless of
    // dispatch speed.
    const isSubmittingRef = useRef(false);

    const [initialJobUrl, setInitialJobUrl] = useState<string | null>(null);

    const onShowAuth = (feature?: any) => openModal('AUTH', feature ? { feature } : undefined);

    // 1. Initial URL param capture
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const jobUrl = (params.get('job') || params.get('url'))?.trim();

        if (jobUrl) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
            setUrl(jobUrl);
            setInitialJobUrl(jobUrl);
        }
    }, []);

    const handleJobSubmission = useCallback(async (input: { type: 'url' | 'text', content: string }) => {
        // Must be the first thing that happens — see the isSubmittingRef comment
        // above for why isAnalyzing state can't do this job on its own.
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        try {
            const hasAcceptedPrivacy = LocalStorage.get(STORAGE_KEYS.PRIVACY_ACCEPTED);
            const isExistingUser = !!user || resumes.length > 0;

            if (!hasAcceptedPrivacy && !isExistingUser) {
                onNavigate?.('welcome');
                return;
            }

            setIsAnalyzing(true);
            await new Promise(resolve => setTimeout(resolve, 2000));

            const jobId = crypto.randomUUID();

            let potentialUrl = input.type === 'url' ? input.content : (lastUrlRef.current || url.trim());
            if (potentialUrl && !potentialUrl.startsWith('http') && potentialUrl.includes('.')) {
                potentialUrl = `https://${potentialUrl}`;
            }

            const sourceUrl = (potentialUrl &&
                potentialUrl.length < 500 &&
                (potentialUrl.startsWith('http') || (potentialUrl.includes('.') && !potentialUrl.includes(' '))))
                ? potentialUrl
                : undefined;

            const newJob: SavedJob = {
                id: jobId,
                company: '',
                position: 'New Job',
                description: input.type === 'text' ? input.content : '',
                url: sourceUrl,
                resumeId: resumes[0]?.id || 'master',
                dateAdded: Date.now(),
                updatedAt: Date.now(),
                status: 'analyzing',
            };

            try {
                // Persistence, navigation, and usage-limit consumption all happen inside
                // onJobCreated (handleJobCreated in useJobManager.ts) — it's the single
                // canonical path. Calling Storage.addJob directly here as well used to
                // insert this job twice (once unconditionally here, once again — gated by
                // the usage check — inside handleJobCreated), which could leave two rows
                // for the same job in history.
                EventService.trackUsage(TRACKING_EVENTS.JOB_FIT);
                const created = await onJobCreated(newJob);
                // If the usage limit blocked creation, onJobCreated already surfaces the
                // upgrade modal — don't also tell the user matching started.
                if (created) showSuccess("Matching started");
                setIsAnalyzing(false);
            } catch {
                setError("Failed to start analysis. Please try again.");
                setIsAnalyzing(false);
            }
        } finally {
            isSubmittingRef.current = false;
        }
    }, [user, resumes, onJobCreated, onNavigate, showSuccess, url]);

    const handleUrlSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!user) {
            onShowAuth();
            return;
        }

        const trimmedUrl = url.trim();
        lastUrlRef.current = trimmedUrl;

        if (!trimmedUrl || isScrapingUrl) return;

        const isLikelyUrl = trimmedUrl.startsWith('http') || (trimmedUrl.includes('.') && !trimmedUrl.includes(' '));
        if (!isLikelyUrl && trimmedUrl.length > 50) {
            setManualDescription(trimmedUrl);
            setIsManualMode(true);
            setError(null);
            return;
        }

        setError(null);

        try {
            const { ScraperService } = await import('../../services/scraperService');
            if (!ScraperService.isUrlScrapable(trimmedUrl)) {
                const wasUrlLike = isLikelyUrl;
                lastUrlRef.current = '';
                setUrl('');
                setManualDescription(wasUrlLike ? '' : trimmedUrl);
                setIsManualMode(true);
                showError(
                    wasUrlLike
                        ? "This domain has a high failure rate for automatic scraping. Please paste the job description below."
                        : "That doesn't look like a valid URL. Paste the full job description below instead."
                );
                return;
            }
        } catch {
            // Service import failed, proceed to try scrape which will fail safely anyway
        }

        setIsScrapingUrl(true);

        try {
            const { ScraperService } = await import('../../services/scraperService');
            const text = await ScraperService.scrapeJobContent(trimmedUrl);
            handleJobSubmission({ type: 'text', content: text });
        } catch (err: any) {
            const msg = err instanceof Error ? err.message : String(err);
            setIsManualMode(true);

            const friendlyMessage =
                msg === "DOMAIN_BLOCKED" ? "This domain has a high failure rate for automatic scraping. Please paste the job description below." :
                msg.includes("403") || msg.includes("Forbidden") ? "This site blocks automated access. Please paste the job description below." :
                msg.includes("timeout") ? "The connection timed out. Please paste the job description below." :
                "We couldn't reach that URL. Please paste the job description below.";

            setError(friendlyMessage);
            showError(friendlyMessage);
        } finally {
            setIsScrapingUrl(false);
        }
    };

    // Handle auto-scraping once authenticated
    useEffect(() => {
        if (!user || !initialJobUrl || isScrapingUrl || isAnalyzing) return;
        setInitialJobUrl(null);
        handleUrlSubmit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, initialJobUrl, isScrapingUrl, isAnalyzing]);

    const handleManualKeyDown = (e: React.KeyboardEvent) => {
        // Require Cmd/Ctrl+Enter to submit, not bare Enter. This is a multi-line
        // textarea holding a full job description — bare Enter must stay a normal
        // newline. Treating it as submit meant every newline in a fast/automated
        // paste (or an accidental Enter mid-paragraph) fired a real submission
        // with whatever partial text existed at that instant, each one writing a
        // brand new permanent "New Job" row (see isSubmittingRef comment above —
        // that alone isn't enough, since letting the *first* partial submission
        // through and dropping the rest would silently discard the real content).
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            if (!manualDescription.trim()) return;
            handleJobSubmission({ type: 'text', content: manualDescription });
        }
    };

    return (
        <SharedPageLayout className="theme-job" maxWidth="6xl" spacing="hero">
            <PageHeader
                variant="hero"
                title={activeHeadline.text}
                highlight={activeHeadline.highlight}
                className="mb-8"
                subtitle="Tailor your resume for any opening with a single click."
            />

            {!isManualMode ? (
                <div className="w-full max-w-3xl mx-auto mb-12 animate-in zoom-in-95 fade-in duration-500">
                    <form onSubmit={error ? (e) => { e.preventDefault(); handleJobSubmission({ type: 'text', content: manualDescription }); } : handleUrlSubmit}>
                        <Card variant="glass" className={`p-4 border-accent-primary/20 ${isAnalyzing ? 'border-accent-primary/50 shadow-accent-primary/20' : 'hover:border-accent-primary/30'}`} glow>
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 bg-accent-primary/10 text-accent-primary-hex`}>
                                    {isScrapingUrl ? (
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    ) : (
                                        (error || isManualMode) ? <FileText className="h-8 w-8 text-orange-500" /> : <LinkIcon className="h-8 w-8 transition-colors" />
                                    )}
                                </div>

                                <div className="flex-1 w-full text-center md:text-left flex flex-col justify-center min-h-[60px]">
                                    {error ? (
                                        <textarea
                                            value={manualDescription}
                                            onChange={(e) => setManualDescription(e.target.value)}
                                            placeholder="Paste full job description..."
                                            className="w-full bg-transparent border-none rounded-xl text-lg text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:ring-0 focus:outline-none resize-none h-[60px] py-3 leading-relaxed"
                                            onKeyDown={(e) => {
                                                // Same reasoning as handleManualKeyDown above — bare
                                                // Enter must stay a newline in a multi-line textarea.
                                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                    e.preventDefault();
                                                    if (manualDescription.trim()) handleJobSubmission({ type: 'text', content: manualDescription });
                                                }
                                            }}
                                            autoFocus
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={url}
                                            onChange={(e) => { setUrl(e.target.value); setError(null); }}
                                            placeholder={isScrapingUrl ? "Accessing" : isAnalyzing ? "Matching" : "Ready to find your match? Paste job URL..."}
                                            className="w-full bg-transparent border-none rounded-xl text-lg font-medium text-neutral-600 dark:text-neutral-300 placeholder:text-neutral-400 focus:ring-0 focus:outline-none"
                                            autoFocus
                                            disabled={isScrapingUrl}
                                        />
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isScrapingUrl || isAnalyzing || (error ? !manualDescription.trim() : !url.trim())}
                                    variant="accent"
                                    size="lg"
                                    loading={isScrapingUrl || isAnalyzing}
                                    icon={<Sparkles className="w-5 h-5" />}
                                    className="w-full md:w-auto"
                                >
                                    {isScrapingUrl ? 'Accessing' : isAnalyzing ? 'Matching' : (error || isManualMode) ? 'Analyze' : 'View Match'}
                                </Button>
                            </div>
                        </Card>
                    </form>

                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={() => setIsManualMode(true)}
                            className="text-xs font-bold text-neutral-400 hover:text-accent-primary-hex transition-colors flex items-center gap-2"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Or paste job description manually
                        </button>
                    </div>

                    {user && !isAdmin && <UsageIndicator usageStats={usageStats} />}
                </div>
            ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 mb-12">
                    <div className="relative">
                        <textarea
                            className={`w-full h-64 p-4 text-sm bg-white dark:bg-neutral-900 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/30 transition-all resize-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 ${error ? 'border-red-300 focus:border-red-500' : 'border-neutral-200 dark:border-neutral-700 focus:border-indigo-500'}`}
                            placeholder="Paste the job description here..."
                            value={manualDescription}
                            onChange={(e) => setManualDescription(e.target.value)}
                            onKeyDown={handleManualKeyDown}
                            autoFocus
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-neutral-400">Press ⌘/Ctrl+Enter to analyze • Enter for new line</div>
                    </div>
                    <div className="flex justify-between items-center bg-transparent p-1 rounded-2xl border-none">
                        <Button
                            variant="subtle"
                            onClick={() => { setIsManualMode(false); setError(null); }}
                            className="text-neutral-500 font-bold"
                        >
                            Back to URL
                        </Button>
                        <Button
                            variant="accent"
                            size="lg"
                            disabled={!manualDescription.trim() || isAnalyzing}
                            loading={isAnalyzing}
                            onClick={() => manualDescription.trim() && handleJobSubmission({ type: 'text', content: manualDescription })}
                            icon={<Sparkles className="w-4 h-4" />}
                            className="px-8 shadow-lg shadow-accent-primary/20"
                        >
                            Analyze Job
                        </Button>
                    </div>
                </div>
            )}

            {/* Feature BentoCards — same pattern as Home and Career */}
            <div className="w-full max-w-5xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both">
                        <BentoCard
                            id="jobs-match"
                            icon={Target}
                            title="Instant Match Score"
                            description="Paste any job URL and get a 0–100 compatibility rating against your resume in seconds."
                            color={FEATURE_COLORS.indigo}
                            actionLabel="Try it now"
                            onAction={() => {}}
                            previewContent={
                                <ul className="space-y-3 pt-4">
                                    {['Fit Score Breakdown', 'Missing Keywords', 'Red Flag Detection'].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-xs font-bold text-neutral-400">
                                            <div className="w-1 h-1 rounded-full bg-indigo-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            }
                        />
                    </div>
                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 fill-mode-both">
                        <BentoCard
                            id="jobs-extract"
                            icon={Zap}
                            title="AI Role Extraction"
                            description="We surface the real requirements — skills, keywords, and hidden criteria buried in every job post."
                            color={FEATURE_COLORS.violet}
                            actionLabel="See how"
                            onAction={() => {}}
                            previewContent={
                                <ul className="space-y-3 pt-4">
                                    {['Skill Pattern Analysis', 'Seniority Detection', 'Culture Signals'].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-xs font-bold text-neutral-400">
                                            <div className="w-1 h-1 rounded-full bg-violet-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            }
                        />
                    </div>
                    <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-both">
                        <BentoCard
                            id="jobs-tailor"
                            icon={FileSearch}
                            title="Tailored to You"
                            description="Get a resume rewrite, targeted bullet points, and a cover letter that beats the ATS automatically."
                            color={FEATURE_COLORS.sky}
                            actionLabel="Get tailored"
                            onAction={() => {}}
                            previewContent={
                                <ul className="space-y-3 pt-4">
                                    {['Resume Rewrite', 'ATS Optimization', 'Cover Letter Draft'].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-xs font-bold text-neutral-400">
                                            <div className="w-1 h-1 rounded-full bg-sky-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            }
                        />
                    </div>
                </div>
            </div>

        </SharedPageLayout>
    );
};

export default JobMatchInput;
