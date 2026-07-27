import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
    Search,
    ArrowRight,
    Zap,
    Briefcase,
    Activity,
    FileText,
    Settings,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { useJobContext } from './context/JobContext';
import { ROUTES } from '../../constants';
import type { SavedJob } from '../../types';

export const MinimalDashboard: React.FC = () => {
    const { jobs, setActiveJobId } = useJobContext();
    const [url, setUrl] = useState('');
    const navigate = useNavigate();

    const activeJobs = useMemo(() => {
        return jobs
            .filter(j => j.status !== 'feed')
            .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
            .slice(0, 4);
    }, [jobs]);

    const handleQuickAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;
        navigate(`${ROUTES.JOB_MATCH}?url=${encodeURIComponent(url)}`);
    };

    const handleJobClick = (job: SavedJob) => {
        setActiveJobId(job.id);
        navigate(ROUTES.JOB_DETAIL.replace(':id', job.id));
    };

    return (
        <SharedPageLayout maxWidth="6xl" spacing="hero" className="min-h-screen">
            <div className="max-w-4xl mx-auto space-y-16 py-12">
                
                {/* Hero / Command Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight text-neutral-900 dark:text-white">
                            Dashboard
                        </h1>
                        <p className="text-sm font-medium text-neutral-500">Analyze opportunities and manage your pipeline.</p>
                    </div>

                    <form onSubmit={handleQuickAnalyze} className="relative group">
                        <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <div className="relative flex items-center bg-white dark:bg-[#050505] border border-neutral-100 dark:border-neutral-900 rounded-2xl p-1 transition-all focus-within:border-indigo-500/50 shadow-2xl shadow-neutral-900/5">
                            <div className="pl-5 text-neutral-400">
                                <Search className="w-5 h-5" />
                            </div>
                            <input 
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Paste a job URL to start analysis..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-base font-bold px-4 py-5 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 dark:text-white"
                            />
                            <button 
                                type="submit"
                                className="bg-neutral-900 dark:bg-white text-white dark:text-black px-8 py-5 rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all shrink-0"
                            >
                                Analyze
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Grid Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Active Pipeline Widget */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-8 rounded-[2.5rem] bg-white dark:bg-[#050505] border border-neutral-100 dark:border-neutral-900 flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xs font-bold text-neutral-400 flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                                Active pipeline
                            </h2>
                            <button onClick={() => navigate(ROUTES.HISTORY)} className="text-[10px] font-bold text-indigo-600 hover:underline">View all</button>
                        </div>

                        <div className="space-y-1 flex-1">
                            {activeJobs.length === 0 ? (
                                <div className="h-full flex items-center justify-center py-12 border border-dashed border-neutral-100 dark:border-neutral-900 rounded-2xl">
                                    <p className="text-[11px] font-bold text-neutral-300">No active jobs</p>
                                </div>
                            ) : (
                                activeJobs.map((job) => (
                                    <button
                                        key={job.id}
                                        onClick={() => handleJobClick(job)}
                                        className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-all group text-left border border-transparent hover:border-neutral-100 dark:hover:border-neutral-800"
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                            (job.analysis?.compatibilityScore ?? 0) >= 80 ? 'bg-emerald-500' : 'bg-indigo-500'
                                        }`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">
                                                {job.analysis?.distilledJob.roleTitle || job.position}
                                            </div>
                                            <div className="text-[10px] font-medium text-neutral-500 truncate mt-0.5">
                                                {job.analysis?.distilledJob.companyName || job.company}
                                            </div>
                                        </div>
                                        <div className="text-[11px] font-black text-neutral-900 dark:text-white tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                                            {job.analysis?.compatibilityScore ?? '—'}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-8">
                        {/* Feed Widget */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-8 rounded-[2.5rem] bg-white dark:bg-[#050505] border border-neutral-100 dark:border-neutral-900"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xs font-bold text-neutral-400 flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5 text-emerald-500" />
                                    Discovery
                                </h2>
                                <button onClick={() => navigate(ROUTES.FEED)} className="p-1.5 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                                </button>
                            </div>
                            <p className="text-[11px] font-medium text-neutral-500 leading-relaxed mb-6">
                                Your personalized stream of high-match professional opportunities is active.
                            </p>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-600">Scout monitoring active</span>
                            </div>
                        </motion.div>

                        {/* Quick Links Widget */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-8 rounded-[2.5rem] bg-white dark:bg-[#050505] border border-neutral-100 dark:border-neutral-900"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xs font-bold text-neutral-400 flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5 text-amber-500" />
                                    Identity
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => navigate(ROUTES.RESUMES)} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-left hover:scale-[1.02] transition-transform text-neutral-900 dark:text-white font-bold text-[10px] tracking-tight">
                                    <FileText className="w-4 h-4 text-indigo-500 mb-3" />
                                    Resumes
                                </button>
                                <button onClick={() => navigate(ROUTES.SETTINGS)} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 text-left hover:scale-[1.02] transition-transform text-neutral-900 dark:text-white font-bold text-[10px] tracking-tight">
                                    <Settings className="w-4 h-4 text-neutral-500 mb-3" />
                                    Settings
                                </button>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </SharedPageLayout>
    );
};
