import React from 'react';
import {
    Users,
    Plus,
    Target,
    Loader2,
    Map,
    Link as LinkIcon,
    Sparkles,
} from 'lucide-react';
import type { RoleModelProfile, TargetJob } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { BentoCard } from '../../../components/ui/BentoCard';
import { FEATURE_COLORS } from '../../../featureRegistry';
import type { CoachViewType } from '../types';

interface CoachHeroProps {
    isUploading: boolean;
    uploadProgress: { current: number; total: number };
    triggerUpload: () => void;
    handleTargetJobSubmit: (e: React.FormEvent) => Promise<void>;
    url: string;
    setUrl: (url: string) => void;
    isScrapingUrl: boolean;
    error: string | null;
    setError: (error: string | null) => void;
    roleModels: RoleModelProfile[];
    targetJobs: TargetJob[];
    userSkills: any[];
    orgCount: number;
    onViewChange: (view: CoachViewType) => void;
}

export const CoachHero: React.FC<CoachHeroProps> = ({
    isUploading,
    uploadProgress,
    triggerUpload,
    handleTargetJobSubmit,
    url,
    setUrl,
    isScrapingUrl,
    error,
    setError,
    onViewChange
}) => {
    const isTargetMode = false;

    return (
        <>

            {/* High-Impact Input Area */}
            <div className="w-full max-w-3xl mx-auto animate-in fade-in duration-1000 delay-200">
                {!isTargetMode ? (
                    <Card variant="glass" className="p-4 border-accent-primary/20 hover:border-accent-primary/50" glow>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="w-16 h-16 bg-accent-primary/10 rounded-3xl flex items-center justify-center text-accent-primary-hex shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Users className="w-8 h-8" />}
                            </div>

                            <div className="flex-1 w-full text-center md:text-left">
                                <div className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight mb-0.5">
                                    {isUploading ? `Distilling ${uploadProgress.current}/${uploadProgress.total} profiles...` : 'Add a Role Model'}
                                </div>
                                <div className="text-xs text-neutral-400">
                                    Upload a LinkedIn PDF to analyze their career path
                                </div>
                            </div>

                            <Button
                                onClick={triggerUpload}
                                disabled={isUploading}
                                variant="accent"
                                size="lg"
                                icon={<Plus className="w-5 h-5" />}
                            >
                                Upload PDF
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <form onSubmit={handleTargetJobSubmit}>
                        <Card variant="glass" className="p-4 border-accent-primary/20 hover:border-accent-primary/50" glow>
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500 bg-accent-primary/10 text-accent-primary-hex">
                                    {isScrapingUrl ? (
                                        <Loader2 className="h-8 w-8 animate-spin" />
                                    ) : (
                                        <LinkIcon className="h-8 w-8" />
                                    )}
                                </div>

                                <div className="flex-1 w-full text-center md:text-left">
                                    <div className="text-sm font-bold text-neutral-400 mb-1">
                                        Dream Job
                                    </div>
                                    <input
                                        type="text"
                                        value={url}
                                        onChange={(e) => { setUrl(e.target.value); setError(null); }}
                                        placeholder={isScrapingUrl ? "Analyzing job requirements..." : "Enter job URL or title..."}
                                        className="w-full bg-transparent border-none rounded-xl text-lg font-medium text-neutral-600 dark:text-neutral-300 placeholder:text-neutral-400 focus:ring-0 focus:outline-none transition-all duration-300"
                                        autoFocus
                                        disabled={isScrapingUrl}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={!url.trim() || isScrapingUrl}
                                    variant="accent"
                                    size="lg"
                                    loading={isScrapingUrl}
                                    icon={<Sparkles className="w-5 h-5" />}
                                >
                                    Set Goal
                                </Button>
                            </div>
                        </Card>
                        {error && (
                            <p className="absolute -bottom-10 left-6 text-sm font-bold text-rose-500 animate-in slide-in-from-top-2">
                                {error}
                            </p>
                        )}
                    </form>
                )}

                {/* Feature Cards — same BentoCard grid as Education */}
                <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both">
                            <BentoCard
                                id="career-mentors"
                                icon={Users}
                                title="Role Models"
                                description="Upload LinkedIn profiles of people whose careers you admire. We extract their path and distill it into your roadmap."
                                color={FEATURE_COLORS.emerald}
                                actionLabel="Add mentor"
                                onAction={() => onViewChange('coach-role-models')}
                                previewContent={
                                    <ul className="space-y-3 pt-4">
                                        {['Career Path Extraction', 'Skill Gap Mapping', 'Pattern Recognition'].map(item => (
                                            <li key={item} className="flex items-center gap-3 text-xs font-bold text-neutral-400">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                }
                            />
                        </div>
                        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 fill-mode-both">
                            <BentoCard
                                id="career-goals"
                                icon={Target}
                                title="Gap Analysis"
                                description="Define your target role and get a clear breakdown of the skills you have, the skills you need, and exactly how to close the gap."
                                color={FEATURE_COLORS.sky}
                                actionLabel="Set a goal"
                                onAction={() => onViewChange('coach-gap-analysis')}
                                previewContent={
                                    <ul className="space-y-3 pt-4">
                                        {['Skill Gap Scoring', 'Priority Ranking', 'Action Plan'].map(item => (
                                            <li key={item} className="flex items-center gap-3 text-xs font-bold text-neutral-400">
                                                <div className="w-1 h-1 rounded-full bg-sky-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                }
                            />
                        </div>
                        <div className="animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-both">
                            <BentoCard
                                id="career-growth"
                                icon={Map}
                                title="Growth Roadmap"
                                description="Generate a personalized 12-month roadmap with milestones, learning resources, and weekly actions to reach your target role."
                                color={FEATURE_COLORS.violet}
                                actionLabel="View roadmap"
                                onAction={() => onViewChange('career-growth')}
                                previewContent={
                                    <ul className="space-y-3 pt-4">
                                        {['12-Month Plan', 'Weekly Milestones', 'Progress Tracking'].map(item => (
                                            <li key={item} className="flex items-center gap-3 text-xs font-bold text-neutral-400">
                                                <div className="w-1 h-1 rounded-full bg-violet-500" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
