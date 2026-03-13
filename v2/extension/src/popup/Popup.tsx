import React, { useEffect, useState } from 'react';
import {
    Briefcase, Loader2, LogIn, LogOut, Check, AlertCircle,
    MapPin, DollarSign, ExternalLink, Shield, Sparkles,
    FileText, Building2
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { ExtractedJob, ExtractionResponse } from '../types';

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

type Status = 'idle' | 'extracting' | 'ready' | 'saving' | 'saved' | 'error';

export const Popup = () => {
    // ── State ──────────────────────────────────────────
    const [status, setStatus] = useState<Status>('idle');
    const [job, setJob] = useState<ExtractedJob | null>(null);
    const [savedJobId, setSavedJobId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [pageTitle, setPageTitle] = useState('');
    const [pageUrl, setPageUrl] = useState('');

    // Auth
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // ── Auth ───────────────────────────────────────────
    useEffect(() => { checkAuth(); }, []);
    useEffect(() => { if (isAuthenticated) extractFromTab(); }, [isAuthenticated]);

    const checkAuth = async () => {
        setAuthLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) setIsAuthenticated(true);
        setAuthLoading(false);
    };

    const handleLogin = async () => {
        if (!email || !password) return;
        setAuthLoading(true);
        setErrorMessage('');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setErrorMessage('Invalid email or password.');
        } else {
            setIsAuthenticated(true);
        }
        setAuthLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        setJob(null);
        setStatus('idle');
    };

    // ── Extraction ─────────────────────────────────────
    const extractFromTab = () => {
        setStatus('extracting');
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab?.id || !tab?.url || tab.url.startsWith('chrome://')) {
                setPageTitle(tab?.title || '');
                setPageUrl(tab?.url || '');
                setStatus('error');
                setErrorMessage('Cannot extract from this page.');
                return;
            }
            setPageTitle(tab.title || '');
            setPageUrl(tab.url);

            chrome.tabs.sendMessage(tab.id, { action: 'extract_job' }, (response: ExtractionResponse) => {
                if (chrome.runtime.lastError || !response?.success) {
                    setStatus('error');
                    setErrorMessage('Refresh the page and try again.');
                    return;
                }
                setJob(response.data!);
                setStatus('ready');
            });
        });
    };

    // ── Save ───────────────────────────────────────────
    const handleSave = async (openAfter = false) => {
        setStatus('saving');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setIsAuthenticated(false);
                setStatus('error');
                setErrorMessage('Session expired. Please sign in again.');
                return;
            }

            const { data, error } = await supabase
                .from('jobs')
                .insert({
                    user_id: session.user.id,
                    job_title: job?.title || pageTitle || 'Untitled Position',
                    company: job?.company || 'Unknown Company',
                    original_text: job?.description || '',
                    url: job?.url || pageUrl,
                    source_type: 'extension',
                    status: 'saved',
                })
                .select('id')
                .single();

            if (error) throw error;

            setSavedJobId(data.id);
            setStatus('saved');
            chrome.runtime.sendMessage({ action: 'set_badge', text: '✓', color: '#10b981' });

            if (openAfter) {
                chrome.tabs.create({ url: APP_URL });
            }
        } catch (e: any) {
            setStatus('error');
            setErrorMessage(e.message || 'Failed to save');
        }
    };

    // ── Confidence Label ───────────────────────────────
    const confidenceLabel = (job: ExtractedJob) => {
        if (job.confidence === 'high') return { text: 'Structured data', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: Shield };
        if (job.confidence === 'medium') return { text: 'DOM extraction', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: Sparkles };
        return { text: 'Best effort', color: 'text-zinc-400', bg: 'bg-zinc-400/10', icon: FileText };
    };

    // ═══════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════

    // ── Loading ────────────────────────────────────────
    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-[280px]">
                <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
            </div>
        );
    }

    // ── Login ──────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="p-6 animate-fade-up">
                <header className="text-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/20">
                        <Briefcase size={22} className="text-white" />
                    </div>
                    <h1 className="font-bold text-lg text-zinc-50">Navigator</h1>
                    <p className="text-xs text-zinc-500 mt-1">Sign in to save jobs</p>
                </header>

                <div className="space-y-3">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                        placeholder="you@example.com"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                        placeholder="••••••••"
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    />

                    {errorMessage && (
                        <div className="flex items-center gap-2 text-rose-400 bg-rose-400/10 p-2.5 rounded-xl text-xs border border-rose-400/10">
                            <AlertCircle size={13} className="shrink-0" />
                            {errorMessage}
                        </div>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={!email || !password}
                        className="w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 btn-accent"
                    >
                        <LogIn size={15} />
                        Sign In
                    </button>

                    <p className="text-[10px] text-center text-zinc-600">
                        Don't have an account?{' '}
                        <a href={APP_URL} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                            Join Navigator
                        </a>
                    </p>
                </div>
            </div>
        );
    }

    // ── Main View ──────────────────────────────────────
    return (
        <div className="p-4 animate-fade-up">
            {/* Header */}
            <header className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/15">
                        <Briefcase size={14} className="text-white" />
                    </div>
                    <span className="font-semibold text-sm text-zinc-200">Navigator</span>
                </div>
                <div className="flex items-center gap-2">
                    {status === 'saved' && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full flex items-center gap-1 animate-scale-in">
                            <Check size={10} /> Saved
                        </span>
                    )}
                    <button onClick={handleLogout} className="text-zinc-600 hover:text-zinc-400 transition-colors p-1" title="Sign Out">
                        <LogOut size={14} />
                    </button>
                </div>
            </header>

            {/* Extracting State */}
            {status === 'extracting' && (
                <div className="py-12 text-center space-y-3 animate-fade-up">
                    <div className="w-10 h-10 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center animate-pulse-glow">
                        <Loader2 size={20} className="text-indigo-400 animate-spin" />
                    </div>
                    <p className="text-xs text-zinc-500">Analyzing page…</p>
                </div>
            )}

            {/* Ready State — Job Card */}
            {status === 'ready' && job && (
                <div className="space-y-3 animate-fade-up">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
                        {/* Title & Company */}
                        <div className="space-y-1">
                            <h2 className="font-bold text-[15px] text-zinc-50 leading-tight">
                                {job.title || 'Untitled Position'}
                            </h2>
                            {job.company && (
                                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                                    <Building2 size={12} className="shrink-0" />
                                    {job.company}
                                </div>
                            )}
                        </div>

                        {/* Metadata Chips */}
                        {(job.location || job.salary) && (
                            <div className="flex flex-wrap gap-2">
                                {job.location && (
                                    <span className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800/80 px-2 py-1 rounded-lg">
                                        <MapPin size={10} /> {job.location}
                                    </span>
                                )}
                                {job.salary && (
                                    <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">
                                        <DollarSign size={10} /> {job.salary}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Extraction Info */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                            {(() => {
                                const c = confidenceLabel(job);
                                return (
                                    <span className={`flex items-center gap-1 text-[10px] ${c.color} ${c.bg} px-2 py-0.5 rounded-full`}>
                                        <c.icon size={9} /> {c.text}
                                    </span>
                                );
                            })()}
                            <span className="text-[10px] text-zinc-600">
                                {job.description.length.toLocaleString()} chars
                            </span>
                        </div>
                    </div>

                    {/* URL */}
                    <p className="text-[10px] text-zinc-600 truncate px-1">
                        {pageUrl}
                    </p>

                    {/* Actions */}
                    <div className="space-y-2">
                        <button
                            onClick={() => handleSave(false)}
                            className="w-full py-2.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 btn-accent"
                        >
                            <Sparkles size={15} />
                            Save to Navigator
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            className="w-full py-2 rounded-xl text-xs text-zinc-400 flex items-center justify-center gap-1.5 btn-ghost"
                        >
                            Save & Open
                            <ExternalLink size={11} />
                        </button>
                    </div>
                </div>
            )}

            {/* Saving State */}
            {status === 'saving' && (
                <div className="py-12 text-center space-y-3 animate-fade-up">
                    <Loader2 size={24} className="mx-auto text-indigo-400 animate-spin" />
                    <p className="text-xs text-zinc-500">Saving…</p>
                </div>
            )}

            {/* Saved State */}
            {status === 'saved' && (
                <div className="py-10 text-center space-y-4 animate-fade-up">
                    <div className="w-14 h-14 mx-auto rounded-full bg-emerald-400/10 flex items-center justify-center animate-check-pop">
                        <Check size={28} className="text-emerald-400" strokeWidth={3} />
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-zinc-100">Saved to Navigator</p>
                        <p className="text-[11px] text-zinc-500 mt-1">Job is in your History and ready for analysis.</p>
                    </div>
                    <button
                        onClick={() => chrome.tabs.create({ url: APP_URL })}
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                    >
                        Open Navigator
                        <ExternalLink size={11} />
                    </button>
                </div>
            )}

            {/* Error State */}
            {status === 'error' && (
                <div className="py-8 text-center space-y-4 animate-fade-up">
                    <div className="w-12 h-12 mx-auto rounded-full bg-rose-400/10 flex items-center justify-center">
                        <AlertCircle size={22} className="text-rose-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-zinc-200">Something went wrong</p>
                        <p className="text-[11px] text-zinc-500 mt-1">{errorMessage}</p>
                    </div>
                    <button
                        onClick={extractFromTab}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    );
};
