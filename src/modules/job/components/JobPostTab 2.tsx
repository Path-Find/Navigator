import React from 'react';
import { FileText } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import type { SavedJob } from '../types';

interface JobPostTabProps {
    job: SavedJob;
}

export const JobPostTab: React.FC<JobPostTabProps> = ({ job }) => {
    return (
        <div className="pb-8">
            <Card variant="premium" className="p-8 border-accent-primary/10 shadow-indigo-500/5">
                <h4 className="flex items-center gap-2 font-black text-accent-primary-hex mb-8 text-xs">
                    <FileText className="w-4 h-4" />
                    Job Description
                </h4>
                <div className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap font-sans font-medium bg-neutral-50 dark:bg-neutral-800/50 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                    {job.analysis?.cleanedDescription || job.description}
                </div>
            </Card>
        </div>
    );
};
