import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import type { SavedJob } from '../../types';
import { Trash2, ArrowRight, Filter, Clock, ShieldAlert, Briefcase, Loader2, ChevronDown } from 'lucide-react';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { StandardSearchBar } from '../../components/common/StandardSearchBar';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../constants';
import { getScoreLabel, getScoreColorClasses, getDeadlineInfo } from './utils/jobUtils';

import { useJobContext } from './context/JobContext';

const FILTER_OPTIONS = [
    { id: 'all', label: 'All' },
    { id: 'saved', label: 'Saved' },
    { id: 'applied', label: 'Applied' },
    { id: 'interview', label: 'Interview' },
    { id: 'offer', label: 'Offer' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'error', label: 'Action Required' },
] as const;

type StatusFilter = typeof FILTER_OPTIONS[number]['id'];

export default function History() {
    const { jobs, setActiveJobId: onSelectJob, handleDeleteJob: onDeleteJob } = useJobContext();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const handleJobClick = (job: SavedJob) => {
        if (job.status === 'analyzing') return;
        onSelectJob(job.id);
        navigate(ROUTES.JOB_DETAIL.replace(':id', job.id));
    };

    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            if (!job || job.status === 'feed') return false;

            if (statusFilter !== 'all') {
                if (statusFilter === 'offer' && job.status !== 'offer') return false;
                if (statusFilter === 'interview' && job.status !== 'interview') return false;
                if (statusFilter === 'rejected' && (job.status !== 'rejected' && job.status !== 'ghosted')) return false;
                if (statusFilter === 'applied' && job.status !== 'applied') return false;
                if (statusFilter === 'error' && job.status !== 'error') return false;
                if (statusFilter === 'saved' && (job.status !== 'saved' && job.status !== 'analyzing' && !!job.status)) return false;
            }

            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            const role = (job.analysis?.distilledJob.roleTitle || job.position || '').toLowerCase();
            const company = (job.analysis?.distilledJob.companyName || job.company || '').toLowerCase();
            return role.includes(query) || company.includes(query);
        }).sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    }, [jobs, searchQuery, statusFilter]);

    const getStatusParams = (status?: SavedJob['status']) => {
        switch (status) {
            case 'offer': return { label: 'Offer', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' };
            case 'interview': return { label: 'Interview', color: 'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-900/30 dark:text-neutral-400 dark:border-neutral-800' };
            case 'rejected': return { label: 'Rejected', color: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800' };
            case 'ghosted': return { label: 'Ghosted', color: 'bg-neutral-100 text-neutral-500 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700' };
            case 'applied': return { label: 'Applied', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' };
            case 'analyzing': return { label: 'Saving...', color: 'bg-accent-primary/10 text-accent-primary-hex border-accent-primary/20 animate-pulse' };
            case 'error': return { label: 'Action Required', color: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' };
            default: return { label: 'Saved', color: 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700' };
        }
    };

    const getCount = (filter: StatusFilter) => {
        if (filter === 'all') return jobs.filter(j => j.status !== 'feed').length;
        return jobs.filter(job => {
            if (filter === 'offer') return job.status === 'offer';
            if (filter === 'interview') return job.status === 'interview';
            if (filter === 'rejected') return job.status === 'rejected' || job.status === 'ghosted';
            if (filter === 'applied') return job.status === 'applied';
            if (filter === 'error') return job.status === 'error';
            if (filter === 'saved') return job.status === 'saved' || job.status === 'analyzing' || !job.status;
            return false;
        }).length;
    };

    return (
        <SharedPageLayout className="theme-job" spacing="compact" maxWidth="6xl">
            <PageHeader
                variant="simple"
                title="Application History"
                subtitle="Track your applications, interviews, and offers in one place."
                className="mb-8"
            />

            {/* Filters & Search Row */}
            <div className="mb-6">
                <StandardSearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search"
                    themeColor="indigo"
                    rightElement={
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                className="h-10 pl-3 pr-8 text-xs font-bold rounded-2xl border border-neutral-200/50 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/40 text-neutral-700 dark:text-neutral-300 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-500/20 transition-colors"
                            >
                                {FILTER_OPTIONS.map(opt => {
                                    const count = getCount(opt.id);
                                    return (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.label}{count > 0 ? ` (${count})` : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
                        </div>
                    }
                />
            </div>

            {/* Content */}
            <div className="space-y-4">
                {jobs.length === 0 ? (
                    <div className="card-premium p-12 text-center space-y-8 max-w-2xl mx-auto shadow-2xl shadow-neutral-500/5 border-neutral-100 dark:border-white/5">
                        <div className="w-20 h-20 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <Clock className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">No history yet</h3>
                            <p className="text-sm text-neutral-400 dark:text-neutral-500 max-w-sm mx-auto leading-relaxed">
                                Jobs you save and assess will appear here. Start by finding a job fit!
                            </p>
                        </div>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <Card variant="glass" className="py-20 text-center border-dashed">
                        <Filter className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">No jobs match your filter</h3>
                        <p className="text-neutral-500 dark:text-neutral-400">Try adjusting your search or status filter.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                            className="mt-6 text-accent-primary-hex font-bold hover:underline"
                        >
                            Clear all filters
                        </button>
                    </Card>
                ) : (
                    filteredJobs.map((job) => {
                        const isAnalyzing = job.status === 'analyzing';
                        const isError = job.status === 'error';
                        const params = getStatusParams(job.status);
                        const roleTitle = job.analysis?.distilledJob.roleTitle || (job.position === 'New Opportunity' ? 'Untitled Job' : job.position) || 'Untitled Job';
                        const rawCompany = job.analysis?.distilledJob.companyName || job.company || '';
                        const companyName = (rawCompany === 'Analyzing...' || rawCompany === 'Processing...') ? '' : rawCompany;
                        const location = job.analysis?.distilledJob.location || '';
                        const score = job.analysis?.compatibilityScore;
                        const deadlineInfo = getDeadlineInfo(job.analysis?.distilledJob.applicationDeadline);
                        const referenceCode = job.analysis?.distilledJob.referenceCode;
                        const salaryRange = job.analysis?.distilledJob.salaryRange;

                        return (
                            <Card
                                key={job.id}
                                onClick={() => handleJobClick(job)}
                                variant="glass"
                                className={`group p-6 sm:p-7 border-neutral-200 dark:border-neutral-800/50 hover:border-accent-primary/30 transition-all duration-500 overflow-hidden relative ${isAnalyzing ? 'cursor-default opacity-95' : 'cursor-pointer'} ${isError ? 'bg-gradient-to-br from-amber-50/40 via-rose-50/20 to-white dark:from-amber-950/10 dark:to-black border-amber-200/50 dark:border-amber-900/20 shadow-lg shadow-amber-500/5' : ''}`}
                                glow={!isError}
                            >
                                {isError && (
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse" />
                                )}

                                <div className="flex gap-6 relative z-10">
                                    {/* Logo Column */}
                                    <div className="hidden sm:flex flex-col items-center shrink-0">
                                        <div className="relative">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-all duration-500 group-hover:scale-105 group-hover:rotate-1 ${isError ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 border border-amber-200 dark:border-amber-800' : 'bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400'} ${isAnalyzing ? 'animate-pulse' : ''}`}>
                                                {isError ? <ShieldAlert className="w-8 h-8" /> : companyName ? companyName.charAt(0).toUpperCase() : <Briefcase className="w-6 h-6" />}
                                            </div>
                                            {!isError && !isAnalyzing && (
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-800 flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full flex items-center justify-center bg-accent-primary/20">
                                                        <div className="w-1 h-1 rounded-full bg-accent-primary-hex" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 min-w-0">
                                        {/* Header Row */}
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                                            <div className="space-y-1.5 min-w-0">
                                                <h3 className={`text-lg sm:text-xl font-extrabold transition-colors pr-4 tracking-tight leading-tight ${isError ? 'text-rose-950 dark:text-rose-400/90' : 'text-neutral-900 dark:text-white group-hover:text-accent-primary-hex'}`}>
                                                    {isAnalyzing && !job.analysis?.distilledJob.roleTitle ? 'Analyzing New Job...' : roleTitle}
                                                </h3>
                                                
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm font-bold text-neutral-500 dark:text-neutral-400">
                                                    {companyName && (
                                                        <span className="text-neutral-700 dark:text-neutral-300">
                                                            {companyName}
                                                        </span>
                                                    )}
                                                    {location && (
                                                        <span className="underline decoration-neutral-200 dark:decoration-neutral-800 underline-offset-4">
                                                            {location}
                                                        </span>
                                                    )}
                                                    <span>
                                                        {new Date(job.dateAdded).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    {referenceCode && (
                                                        <span>
                                                            #{referenceCode}
                                                        </span>
                                                    )}
                                                    {salaryRange && (
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-black">
                                                            {salaryRange}
                                                        </span>
                                                    )}
                                                    {deadlineInfo && (
                                                        <span className={`font-black ${deadlineInfo.style}`}>
                                                            {deadlineInfo.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {!isError && !isAnalyzing && (
                                                <div className={`shrink-0 self-start px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-2 transition-all ${params.color}`}>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                    {params.label}
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer Row */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-5 border-t border-neutral-100 dark:border-neutral-800/40 mt-4 gap-4">
                                            <div className="flex-1 min-w-0">
                                                {isAnalyzing ? (
                                                    <div className="flex flex-col gap-2.5 max-w-md">
                                                        <div className="flex justify-between items-center text-[11px] font-black text-accent-primary-hex tracking-tight">
                                                            <span className="flex items-center gap-2">
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                {job.progressMessage || 'Finding your fit...'}
                                                            </span>
                                                            <span className="bg-accent-primary/10 px-2 py-0.5 rounded-md">{job.progress || 0}%</span>
                                                        </div>
                                                        <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800/50 rounded-full p-0.5 overflow-hidden border border-neutral-200/5 dark:border-white/5">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-accent-primary-hex to-accent-secondary-hex rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(79,70,229,0.3)]"
                                                                style={{ width: `${Math.max(5, job.progress || 5)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : isError ? (
                                                    <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-800/50 w-fit">
                                                        <ShieldAlert className="w-3.5 h-3.5" />
                                                        Analysis could not be completed
                                                    </div>
                                                ) : (score !== undefined && score !== null) ? (
                                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-2 w-fit ${getScoreColorClasses(score)}`}>
                                                        <span>{getScoreLabel(score)}</span>
                                                        <span className="opacity-60">{score}%</span>
                                                    </div>
                                                ) : null}
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDeleteJob(job.id); }}
                                                    title={!isAnalyzing ? "Delete" : undefined}
                                                    className="p-2.5 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                                {!isAnalyzing && (
                                                    <Button
                                                        variant={isError ? "secondary" : "accent"}
                                                        size="sm"
                                                        icon={<ArrowRight className="w-4 h-4" />}
                                                    >
                                                        {isError ? 'Retry Analysis' : 'View Analysis'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div >

        </SharedPageLayout >
    );
}
