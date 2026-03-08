import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Link as LinkIcon,
    FileText,
    Bookmark,
    Loader2,
    Sparkles,
} from 'lucide-react';
import { NotificationBanner } from '../../components/common/NotificationBanner';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { EventService } from '../../services/eventService';
import { UsageIndicator } from './UsageIndicator';
import { useToast } from '../../contexts/ToastContext';
import { useHeadlines } from '../../hooks/useHeadlines';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Storage } from '../../services/storageService';

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
    const navigate = useNavigate();
    const {
        handleJobCreated: onJobCreated,
        usageStats
    } = useJobContext();
    const {
        resumes,
    } = useResumeContext();

    const { showSuccess } = useToast();
    const [url, setUrl] = useState('');
    const [manualText, setManualText] = useState('');
    const [isManualMode, setIsManualMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isScrapingUrl, setIsScrapingUrl] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const activeHeadline = useHeadlines('apply');
    const lastUrlRef = useRef<string>('');

    const [showExtensionTip, setShowExtensionTip] = useState(() => {
        return !LocalStorage.get(STORAGE_KEYS.EXTENSION_TIP_DISMISSED);
    });

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
            status: 'analyzing',
        };

        try {
            await Storage.addJob(newJob);
            EventService.trackUsage(TRACKING_EVENTS.JOB_FIT);
            onJobCreated(newJob);
            navigate(`/jobs/match/${jobId}`);
            showSuccess("Matching started");
            setIsAnalyzing(false);
        } catch (err) {
            setError("Failed to start analysis. Please try again.");
            setIsAnalyzing(false);
        }
    }, [user, resumes, navigate, onJobCreated, onNavigate, showSuccess, url]);

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
            handleJobSubmission({ type: 'text', content: trimmedUrl });
            return;
        }

        setError(null);
        setIsScrapingUrl(true);

        try {
            const { ScraperService } = await import('../../services/scraperService');
            const text = await ScraperService.scrapeJobContent(trimmedUrl);
            handleJobSubmission({ type: 'text', content: text });
        } catch (err: any) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("403") || msg.includes("Forbidden")) {
                setError("This site blocks automated access. Please paste the job description below:");
            } else if (msg.includes("timeout")) {
                setError("The connection timed out. Please paste the job description below:");
            } else {
                setError("We couldn't reach that URL. Please paste the job description below:");
            }
        } finally {
            setIsScrapingUrl(false);
        }
    };

    // Handle auto-scraping once authenticated
    useEffect(() => {
        if (!user || !initialJobUrl || isScrapingUrl || isAnalyzing) return;
        setInitialJobUrl(null);
        handleUrlSubmit();
    }, [user, initialJobUrl, isScrapingUrl, isAnalyzing]);

    const handleManualKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!manualText.trim()) return;
            handleJobSubmission({ type: 'text', content: manualText });
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
                <div className="w-full max-w-3xl mx-auto mb-16 animate-in zoom-in-95 fade-in duration-500">
                    <form onSubmit={error ? (e) => { e.preventDefault(); handleJobSubmission({ type: 'text', content: url }); } : handleUrlSubmit}>
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
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="Paste full job description..."
                                            className="w-full bg-transparent border-none rounded-xl text-lg text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:ring-0 focus:outline-none resize-none h-[60px] py-3 leading-relaxed"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    if (url.trim()) handleJobSubmission({ type: 'text', content: url });
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
                                    disabled={!url.trim() || isScrapingUrl || isAnalyzing}
                                    variant="accent"
                                    size="lg"
                                    loading={isScrapingUrl || isAnalyzing}
                                    icon={<Sparkles className="w-5 h-5" />}
                                    className="w-full md:w-auto"
                                >
                                    {isScrapingUrl ? 'Accessing' : isAnalyzing ? 'Matching' : 'View Match'}
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
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="relative">
                        <textarea
                            className={`w-full h-64 p-4 text-sm bg-white dark:bg-neutral-900 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-50/50 dark:focus:ring-indigo-900/30 transition-all resize-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 ${error ? 'border-red-300 focus:border-red-500' : 'border-neutral-200 dark:border-neutral-700 focus:border-indigo-500'}`}
                            placeholder="Paste the job description here..."
                            value={manualText}
                            onChange={(e) => setManualText(e.target.value)}
                            onKeyDown={handleManualKeyDown}
                            autoFocus
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-neutral-400">Press Enter to analyze • Shift+Enter for new line</div>
                    </div>
                    <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                        <button onClick={() => { setIsManualMode(false); setError(null); }} className="text-sm text-neutral-500 font-bold px-4 py-2">Back to URL</button>
                        <button onClick={() => manualText.trim() && handleJobSubmission({ type: 'text', content: manualText })} disabled={!manualText.trim()} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20">
                            <Sparkles className="w-4 h-4" /> Analyze Job
                        </button>
                    </div>
                </div>
            )}

            {user && showExtensionTip && (
                <NotificationBanner
                    icon={Bookmark}
                    theme="sky"
                    title="Browser extension coming soon"
                    description="Save jobs from any website with one click. We'll notify you when it's available."
                    className="max-w-xl mx-auto mt-8"
                    onDismiss={() => {
                        setShowExtensionTip(false);
                        LocalStorage.set(STORAGE_KEYS.EXTENSION_TIP_DISMISSED, 'true');
                    }}
                />
            )}
        </SharedPageLayout>
    );
};

export default JobMatchInput;
