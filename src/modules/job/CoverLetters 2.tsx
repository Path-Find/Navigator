import React, { useMemo } from 'react';
import { PenTool, ArrowRight, Copy, Building, Calendar } from 'lucide-react';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { StandardSearchBar } from '../../components/common/StandardSearchBar';


import { useJobContext } from './context/JobContext';

export const CoverLetters: React.FC = () => {
    const { jobs, setActiveJobId: onSelectJob } = useJobContext();
    const [searchQuery, setSearchQuery] = React.useState('');

    const letters = useMemo(() => {
        return jobs
            .filter(job => job.coverLetter && !job.status?.includes('feed'))
            .filter(job => {
                if (!searchQuery.trim()) return true;
                const query = searchQuery.toLowerCase();
                const role = (job.analysis?.distilledJob.roleTitle || job.position || '').toLowerCase();
                const company = (job.analysis?.distilledJob.companyName || job.company || '').toLowerCase();
                return role.includes(query) || company.includes(query);
            })
            .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    }, [jobs, searchQuery]);

    const handleCopy = async (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(text);
        // Simple visual feedback could be added here
    };

    return (
        <SharedPageLayout className="theme-job" spacing="compact" maxWidth="6xl">
            <PageHeader
                title="Cover Letters"
                subtitle="Your AI-generated narratives optimized for selection."
            />

            {/* Search */}
            <div className="mb-10">
                <StandardSearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search"
                    themeColor="indigo"
                />
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {letters.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-neutral-50/50 dark:bg-neutral-900/50 rounded-[2.5rem] border border-dashed border-neutral-200 dark:border-neutral-800">
                        <div className="w-20 h-20 bg-white dark:bg-neutral-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <PenTool className="w-8 h-8 text-neutral-300" />
                        </div>
                        <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2">No letters generated yet</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                            Generated cover letters for your applications will appear here.
                        </p>
                        <button
                            onClick={() => (window.location.href = '/')}
                            className="mt-8 text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-2 justify-center mx-auto"
                        >
                            Find a job to start <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    letters.map((job) => (
                        <div
                            key={job.id}
                            onClick={() => onSelectJob(job.id)}
                            className="group relative bg-white dark:bg-neutral-900 rounded-[2.5rem] p-8 border border-neutral-200 dark:border-neutral-800/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full"
                        >
                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 font-black">
                                        {(job.analysis?.distilledJob.companyName || job.company || 'C').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => handleCopy(e, job.coverLetter!)}
                                            className="p-2 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all"
                                            title="Copy Letter"
                                        >
                                            <Copy className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <h3 className="text-xl font-black text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                                        {job.analysis?.distilledJob.roleTitle || job.position}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm font-bold text-neutral-500">
                                        <Building className="w-3.5 h-3.5" />
                                        <span className="truncate">{job.analysis?.distilledJob.companyName || job.company}</span>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="text-sm text-neutral-600 dark:text-neutral-400 font-serif leading-relaxed line-clamp-4 relative z-10">
                                        {job.coverLetter}
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-neutral-900 to-transparent z-20" />
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(job.dateAdded).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-black group-hover:translate-x-1 transition-transform">
                                    View Full Draft <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </SharedPageLayout>
    );
};
