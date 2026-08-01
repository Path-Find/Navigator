import React from 'react';
import { Loader2, Sparkles, AlertCircle, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { SavedJob } from '../types';

interface JobErrorStateProps {
    job: SavedJob;
    manualText: string;
    setManualText: (text: string) => void;
    editUrl: string;
    setEditUrl: (url: string) => void;
    retrying: boolean;
    onBack: () => void;
    onManualRetry: () => void;
}

export const JobErrorState: React.FC<JobErrorStateProps> = ({
    job,
    manualText,
    setManualText,
    editUrl,
    setEditUrl,
    retrying,
    onBack,
    onManualRetry
}) => {
    const isExtractionError = !job.description || (job.progressMessage && (job.progressMessage.includes("blocked") || job.progressMessage.includes("extraction") || job.progressMessage.includes("Manual Input")));
    // Scrape succeeded (job.description has content) and it came from a URL, but the AI
    // rejected it as not a real job posting — different from "we couldn't reach the URL"
    // (isExtractionError) and from "you pasted bad text yourself" (the generic fallback).
    const isRejectedUrlContent = !isExtractionError && !!job.url && !!job.description;
    const isAiError = job.progressMessage && (
        job.progressMessage.includes("AI") ||
        job.progressMessage.includes("quota") ||
        job.progressMessage.includes("Too many") ||
        job.progressMessage.includes("timed out") ||
        job.progressMessage.includes("service busy") ||
        job.progressMessage.includes("limit") ||
        job.progressMessage.includes("internet") ||
        job.progressMessage.includes("Connection")
    );

    return (
        <div className="theme-job animate-in fade-in slide-in-from-right-4 duration-300 p-6 bg-white dark:bg-neutral-900 h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-6 pt-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <Card variant="glass" className={`${isAiError ? 'bg-gradient-to-br from-indigo-50/50 to-violet-50/50 dark:from-indigo-950/10 dark:to-violet-950/10 border-indigo-200 dark:border-indigo-800/30' : 'bg-gradient-to-br from-orange-50/50 to-red-50/50 dark:from-orange-950/10 dark:to-red-950/10 border-orange-200 dark:border-orange-800/30'} p-6 flex flex-col justify-center`}>
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 ${isAiError ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400'} rounded-xl flex items-center justify-center`}>
                                {isAiError ? <Sparkles className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-black text-neutral-900 dark:text-white mb-1 tracking-tight">
                                    {isAiError ? 'Service Interruption' : 'Incomplete Job Details'}
                                </h2>
                                <p className="text-neutral-700 dark:text-neutral-300 text-sm font-medium leading-relaxed">
                                    {job.progressMessage && !job.progressMessage.toLowerCase().includes('wrong') && job.progressMessage.length < 200 ? job.progressMessage : (isExtractionError ? "We couldn't read the job details from that URL. Please paste the description manually below." : isRejectedUrlContent ? "We pulled content from that link, but it doesn't look like a real job posting. Check the text below and edit or paste the actual description manually." : "This content doesn't look like a valid job description. Please paste the full details manually.")}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card variant="glass" className="p-6 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Job Posting URL</h3>
                            {editUrl && (
                                <button
                                    onClick={() => window.open(editUrl, '_blank')}
                                    className="text-[10px] font-black tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors flex items-center gap-1.5 group/link"
                                >
                                    Visit Original <ExternalLink className="w-3 h-3 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                placeholder="Paste URL here..."
                                className="w-full pl-4 pr-12 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:ring-4 focus:ring-accent-primary/10 focus:border-accent-primary-hex transition-all text-neutral-900 dark:text-white"
                            />
                            <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                        </div>
                    </Card>
                </div>

                <Card variant="glass" className="p-8">
                    <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-4">Job Description</label>
                    <textarea
                        className="w-full h-64 p-5 bg-neutral-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl focus:ring-4 focus:ring-accent-primary/10 focus:border-accent-primary-hex text-sm leading-relaxed transition-all resize-none text-neutral-900 dark:text-white font-medium"
                        value={manualText}
                        onChange={e => setManualText(e.target.value)}
                        autoFocus
                        placeholder="Paste the full job description here..."
                    />
                    <div className="flex justify-between items-center pt-6">
                        <span className="text-[10px] font-bold text-neutral-400">{manualText.length} characters</span>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={onBack}>Cancel</Button>
                            <Button
                                variant="accent"
                                onClick={onManualRetry}
                                className="bg-indigo-600 text-white hover:bg-indigo-500"
                                disabled={!manualText.trim() || manualText.length < 100 || retrying}
                                icon={retrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            >
                                {retrying ? 'Processing...' : 'Evaluate Match'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
