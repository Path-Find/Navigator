import React, { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';
import { PageHeader } from '../../components/ui/PageHeader';
import { StandardSearchBar } from '../../components/common/StandardSearchBar';
import { StandardFilterGroup } from '../../components/common/StandardFilterGroup';
import { useJobContext } from './context/JobContext';
import { LocalStorage } from '../../utils/localStorage';
import { STORAGE_KEYS } from '../../constants';
import type { JobFeedItem } from '../../types';

// Extracted internal parts
import { useJobFeed } from './feed/useJobFeed';
import { JobFeedCard } from './feed/JobFeedCard';
import { EmptyFeedState } from './feed/EmptyFeedState';
import { LocalizedErrorBoundary } from '../../components/common/LocalizedErrorBoundary';

export const NavigatorPro: React.FC = () => {
    const {
        handleDraftApplication: onDraftApplication,
        handlePromoteFromFeed: onPromoteFromFeed,
        handleSaveFromFeed: onSaveFromFeed
    } = useJobContext();

    const {
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
    } = useJobFeed();

    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleAction = async (job: JobFeedItem) => {
        setProcessingId(job.id);
        LocalStorage.remove(STORAGE_KEYS.FEED_CACHE);
        LocalStorage.remove(STORAGE_KEYS.FEED_CACHE_TIMESTAMP);
        
        if (job.source === 'email' && onPromoteFromFeed) {
            await onPromoteFromFeed(job.id);
        } else {
            await onDraftApplication(job.url);
        }
    };

    const handleSave = async (id: string) => {
        LocalStorage.remove(STORAGE_KEYS.FEED_CACHE);
        LocalStorage.remove(STORAGE_KEYS.FEED_CACHE_TIMESTAMP);
        if (onSaveFromFeed) await onSaveFromFeed(id);
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
                            />

                            <StandardFilterGroup
                                options={[
                                    { id: 'high-match', label: 'High Match', icon: <Sparkles className="w-4 h-4" /> }
                                ]}
                                activeFilter={filterHighMatch ? 'high-match' : ''}
                                onSelect={() => setFilterHighMatch(!filterHighMatch)}
                                themeColor="indigo"
                            />

                            <StandardFilterGroup
                                options={[
                                    { id: 'closing-soon', label: 'Closing Soon', icon: <Zap className="w-4 h-4" /> }
                                ]}
                                activeFilter={filterClosingSoon ? 'closing-soon' : ''}
                                onSelect={() => setFilterClosingSoon(!filterClosingSoon)}
                                themeColor="amber"
                            />
                        </div>
                    }
                />
            </div>

            {loading && feed.length === 0 ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-700 h-40 animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {displayFeed.length === 0 ? (
                        <EmptyFeedState 
                            searchTerm={searchTerm} 
                            filterHighMatch={filterHighMatch} 
                            filterClosingSoon={filterClosingSoon} 
                            onResetFilters={() => {
                                setSearchTerm('');
                                setFilterHighMatch(false);
                                setFilterClosingSoon(false);
                            }}
                        />
                    ) : (
                        displayFeed.map((job) => (
                            <LocalizedErrorBoundary key={job.id} componentName="Job Feed Card">
                                <JobFeedCard 
                                    job={job} 
                                    processingId={processingId} 
                                    onAction={handleAction} 
                                    onSave={handleSave}
                                />
                            </LocalizedErrorBoundary>
                        ))
                    )}
                </div>
            )}
        </SharedPageLayout>
    );
};
