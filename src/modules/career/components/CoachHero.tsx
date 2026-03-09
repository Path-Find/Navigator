import React, { useMemo } from 'react';
import {
    Users,
    Plus,
    Target,
    Loader2,
    CheckCircle2,
    Link as LinkIcon,
    Sparkles,
    ArrowRight,
    Map,
    Building2,
    TrendingUp
} from 'lucide-react';
import type { CustomSkill, RoleModelProfile, TargetJob } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { CoachViewType } from '../types';
import { useJobContext } from '../../job/context/JobContext';
import { useUser } from '../../../contexts/UserContext';

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
    userSkills: CustomSkill[];
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
    roleModels,
    targetJobs,
    userSkills,
    orgCount,
    onViewChange
}) => {
    const isTargetMode = false;
    const { isAdmin } = useUser();
    const { jobs } = useJobContext();
    const canonicalRoleCount = useMemo(() => {
        const titles = new Set(
            jobs
                .filter(j => j.status !== 'feed' && j.analysis?.distilledJob?.canonicalTitle)
                .map(j => j.analysis!.distilledJob!.canonicalTitle!)
        );
        return titles.size;
    }, [jobs]);

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
                                    <div className="text-sm font-bold text-neutral-400 tracking-widest mb-1">
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

                {/* Stats Summary */}
                <div className="mt-12 flex flex-wrap items-center justify-center gap-8 animate-in fade-in duration-1000 delay-500">
                    <div
                        onClick={() => onViewChange('coach-role-models')}
                        className="flex items-center gap-3 cursor-pointer group transition-all hover:scale-105"
                    >
                        <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 shadow-sm group-hover:border-accent-primary/50 group-hover:text-accent-primary-hex transition-colors">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-lg font-black text-neutral-900 dark:text-white leading-none">{roleModels.length}</div>
                            <div className="text-[10px] tracking-widest font-bold text-neutral-400 group-hover:text-accent-primary-hex transition-colors">Profiles</div>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800" />

                    <div
                        onClick={() => onViewChange('coach-gap-analysis')}
                        className="flex items-center gap-3 cursor-pointer group transition-all hover:scale-105"
                    >
                        <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 shadow-sm group-hover:border-accent-primary/50 group-hover:text-accent-primary-hex transition-colors">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-lg font-black text-neutral-900 dark:text-white leading-none">{targetJobs.length}</div>
                            <div className="text-[10px] tracking-widest font-bold text-neutral-400 group-hover:text-accent-primary-hex transition-colors">Goals</div>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800" />

                    <div
                        onClick={() => onViewChange('skills')}
                        className="flex items-center gap-3 cursor-pointer group transition-all hover:scale-105"
                    >
                        <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 shadow-sm group-hover:border-accent-primary/50 group-hover:text-accent-primary-hex transition-colors">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-lg font-black text-neutral-900 dark:text-white leading-none">{userSkills.length}</div>
                            <div className="text-[10px] tracking-widest font-bold text-neutral-400 group-hover:text-accent-primary-hex transition-colors">Skills</div>
                        </div>
                    </div>

                    <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800" />

                    <div
                        onClick={() => onViewChange('career-orgs')}
                        className="flex items-center gap-3 cursor-pointer group transition-all hover:scale-105"
                    >
                        <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 shadow-sm group-hover:border-accent-primary/50 group-hover:text-accent-primary-hex transition-colors">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-lg font-black text-neutral-900 dark:text-white leading-none">{orgCount}</div>
                            <div className="text-[10px] tracking-widest font-bold text-neutral-400 group-hover:text-accent-primary-hex transition-colors">Orgs</div>
                        </div>
                    </div>

                    {isAdmin && (
                        <>
                            <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800" />

                            <div
                                onClick={() => onViewChange('career-salary')}
                                className="flex items-center gap-3 cursor-pointer group transition-all hover:scale-105"
                            >
                                <div className="w-10 h-10 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 shadow-sm group-hover:border-accent-primary/50 group-hover:text-accent-primary-hex transition-colors">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-lg font-black text-neutral-900 dark:text-white leading-none">{canonicalRoleCount}</div>
                                    <div className="text-[10px] tracking-widest font-bold text-neutral-400 group-hover:text-accent-primary-hex transition-colors">Roles</div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Quick-Start Guide (only when empty) */}
                {roleModels.length === 0 && targetJobs.length === 0 && (
                    <div className="mt-14 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
                        <div className="text-center mb-6">
                            <div className="text-[10px] tracking-widest font-black text-neutral-400">Quick Start</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div
                                onClick={() => onViewChange('coach-role-models')}
                                className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 cursor-pointer group hover:border-accent-primary/30 hover:shadow-lg hover:shadow-accent-primary/5 transition-all hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 bg-accent-primary/10 rounded-2xl flex items-center justify-center text-accent-primary-hex mb-4 group-hover:scale-110 transition-transform">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="text-[10px] tracking-widest font-black text-accent-primary-hex mb-1">Step 1</div>
                                <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Add Mentors</h4>
                                <p className="text-xs text-neutral-400 leading-relaxed">Upload LinkedIn profiles of people whose careers you admire.</p>
                                <div className="flex items-center gap-1 mt-3 text-xs font-bold text-accent-primary-hex opacity-0 group-hover:opacity-100 transition-opacity">
                                    Start here <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>

                            <div
                                onClick={() => onViewChange('coach-gap-analysis')}
                                className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 cursor-pointer group hover:border-accent-primary/30 hover:shadow-lg hover:shadow-accent-primary/5 transition-all hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 bg-accent-primary/10 rounded-2xl flex items-center justify-center text-accent-primary-hex mb-4 group-hover:scale-110 transition-transform">
                                    <Target className="w-6 h-6" />
                                </div>
                                <div className="text-[10px] tracking-widest font-black text-accent-primary-hex mb-1">Step 2</div>
                                <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Set Goals</h4>
                                <p className="text-xs text-neutral-400 leading-relaxed">Define your dream role and run a gap analysis against your profile.</p>
                                <div className="flex items-center gap-1 mt-3 text-xs font-bold text-accent-primary-hex opacity-0 group-hover:opacity-100 transition-opacity">
                                    Set a goal <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>

                            <div
                                onClick={() => onViewChange('career-growth')}
                                className="p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 cursor-pointer group hover:border-accent-primary/30 hover:shadow-lg hover:shadow-accent-primary/5 transition-all hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 bg-accent-primary/10 rounded-2xl flex items-center justify-center text-accent-primary-hex mb-4 group-hover:scale-110 transition-transform">
                                    <Map className="w-6 h-6" />
                                </div>
                                <div className="text-[10px] tracking-widest font-black text-accent-primary-hex mb-1">Step 3</div>
                                <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Track Growth</h4>
                                <p className="text-xs text-neutral-400 leading-relaxed">Generate a 12-month roadmap and track milestones as you progress.</p>
                                <div className="flex items-center gap-1 mt-3 text-xs font-bold text-accent-primary-hex opacity-0 group-hover:opacity-100 transition-opacity">
                                    View roadmap <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
