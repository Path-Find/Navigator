import React from 'react';
import { Card } from '../../../components/ui/Card';
import type { SavedJob } from '../types';

interface JobPostTabProps {
    job: SavedJob;
}

export const JobPostTab: React.FC<JobPostTabProps> = ({ job }) => {
    return (
        <div className="pb-8">
            <Card variant="premium" className="p-8 border-accent-primary/10 shadow-indigo-500/5">
                <div className="flex justify-between items-start mb-6 border-b border-neutral-100 dark:border-neutral-800/50 pb-4">
                    <h3 className="text-xs font-bold text-indigo-500 dark:text-indigo-400">Job Description</h3>
                </div>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap font-medium">
                    {job.analysis?.cleanedDescription || job.description}
                </p>
            </Card>
        </div>
    );
};
