import { CoverLetterEditor } from '../CoverLetterEditor';
import type { SavedJob } from '../types';
import type { TargetJob } from '../../../types/target';
import type { ResumeProfile } from '../../resume/types';
import type { UserTier } from '../../../types/app';

interface CoverLetterTabProps {
    job: SavedJob;
    bestResume?: ResumeProfile;
    userTier?: UserTier;
    targetJobs: TargetJob[];
    onUpdateJob: (job: SavedJob) => void;
}

export const CoverLetterTab: React.FC<CoverLetterTabProps> = ({
    job,
    bestResume,
    userTier,
    targetJobs,
    onUpdateJob
}) => {
    if (!job.analysis) return null;

    return (
        <div className="pb-8">
            <CoverLetterEditor
                job={job}
                analysis={job.analysis}
                bestResume={bestResume}
                userTier={userTier || 'free'}
                targetJobs={targetJobs}
                onJobUpdate={onUpdateJob}
            />
        </div>
    );
};
