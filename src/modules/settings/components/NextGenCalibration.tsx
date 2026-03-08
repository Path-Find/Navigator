import React, { useEffect, useState } from 'react';
import { Shield, Activity, RefreshCw, Zap } from 'lucide-react';
import { RdFeedbackService } from '../../../services/ai/rd/feedbackService';
import { RdStyleService } from '../../../services/ai/rd/styleService';
import { RdTrajectoryService } from '../../../services/ai/rd/trajectoryService';
import { RdEmbeddingService } from '../../../services/ai/rd/embeddingService';
import { ResumeStorage } from '../../../services/storage/resumeStorage';
import { CoachStorage } from '../../../services/storage/coachStorage';
import type { GrowthTrajectory } from '../../../services/ai/rd/types';
import { useUser } from '../../../contexts/UserContext';
import { Button } from '../../../components/ui/Button';
import { TrendingUp, ArrowRight, Share2 } from 'lucide-react';

export const NextGenCalibration: React.FC = () => {
    const { user, isNextGenEnabled, updateProfile } = useUser();
    const [stats, setStats] = useState<{ total: number; breakdown: Record<string, number> } | null>(null);
    const [style, setStyle] = useState<string | null>(null);
    const [trajectory, setTrajectory] = useState<GrowthTrajectory | null>(null);
    const [targetTitle, setTargetTitle] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTrajectoryLoading, setIsTrajectoryLoading] = useState(false);
    const [isVectorizing, setIsVectorizing] = useState(false);

    const handleSyncLatentSpace = async () => {
        if (!user) return;
        setIsVectorizing(true);
        try {
            const resumes = await ResumeStorage.getResumes();
            const master = resumes.find(r => r.id === 'master') || resumes[0];
            if (!master) return;

            // Vectorize each visible block
            const promises = master.blocks
                .filter(b => b.isVisible && b.bullets.length > 0)
                .map(b => RdEmbeddingService.vectorizeAndStore(
                    user.id,
                    `[${b.type}] ${b.title} at ${b.organization}: ${b.bullets.join(' ')}`,
                    'experience_block',
                    b.id
                ));

            await Promise.all(promises);
            await loadModelData(); // Refresh signal stats
        } finally {
            setIsVectorizing(false);
        }
    };

    const loadModelData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [statsData, styleData, targets] = await Promise.all([
                RdFeedbackService.getSignalStats(user.id),
                RdStyleService.getPersonalizedStyle(user.id, 'all'),
                CoachStorage.getTargetJobs()
            ]);
            setStats(statsData);
            setStyle(styleData);

            if (targets.length > 0) {
                setTargetTitle(targets[0].title);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const loadTrajectory = async () => {
        if (!user || !targetTitle) return;
        setIsTrajectoryLoading(true);
        try {
            const trajectoryData = await RdTrajectoryService.getTrajectoryProjection(user.id, targetTitle);
            setTrajectory(trajectoryData);
        } finally {
            setIsTrajectoryLoading(false);
        }
    };

    useEffect(() => {
        loadModelData();
    }, [user]);

    const handleToggleNextGen = () => {
        updateProfile({ next_gen_enabled: !isNextGenEnabled });
    };

    return (
        <div className="bg-neutral-50 dark:bg-neutral-800/30 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <Zap className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white">NextGen Modeling Engine</h4>
                        <p className="text-xs text-neutral-400">Admin-only R&D calibration portal</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">
                        {isNextGenEnabled ? 'Active' : 'Disabled'}
                    </span>
                    <button
                        onClick={handleToggleNextGen}
                        className={`w-12 h-6 rounded-full transition-colors relative ${isNextGenEnabled ? 'bg-indigo-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isNextGenEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Style Model */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Active Personal Style</span>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800 min-h-[100px] flex flex-col">
                        {style ? (
                            <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                                "{style}"
                            </p>
                        ) : (
                            <p className="text-xs text-neutral-400 text-center my-auto">No style model distilled yet.</p>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-4 self-end !text-[10px]"
                            onClick={loadModelData}
                            loading={isLoading}
                            icon={<RefreshCw className="w-3 h-3" />}
                        >
                            Recalibrate
                        </Button>
                    </div>
                </div>

                {/* Signal Stats */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Signal Density</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="!text-[9px] !h-6 !px-2"
                            onClick={handleSyncLatentSpace}
                            loading={isVectorizing}
                            icon={<Share2 className="w-2.5 h-2.5" />}
                        >
                            Map Latent Space
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {stats ? (
                            Object.entries(stats.breakdown).map(([type, count]) => (
                                <div key={type} className="flex justify-between items-center text-xs">
                                    <span className="capitalize text-neutral-500">{type.replace('_', ' ')}</span>
                                    <span className="font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-lg">{count} tokens</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-neutral-400 text-center py-8">Awaiting sensory data...</p>
                        )}
                        <div className="pt-4 border-t border-dashed border-neutral-100 dark:border-neutral-800">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-neutral-400">Total Modeling Power</span>
                                <span className="font-black text-indigo-500">{stats?.total || 0} signals</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trajectory Analysis (Level 2) */}
            <div className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-violet-500" />
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Semantic Trajectory (Level 2)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={targetTitle}
                            onChange={(e) => setTargetTitle(e.target.value)}
                            placeholder="Target Role..."
                            className="text-xs bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-violet-500/30 w-48"
                        />
                        <Button
                            variant="premium"
                            size="sm"
                            className="!text-[10px] !py-1.5"
                            onClick={loadTrajectory}
                            loading={isTrajectoryLoading}
                            disabled={!targetTitle}
                        >
                            Project Path
                        </Button>
                    </div>
                </div>

                {trajectory ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="md:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800">
                            <h5 className="text-sm font-bold text-neutral-900 dark:text-white mb-2">{trajectory.heading}</h5>
                            <div className="flex items-center gap-3 my-4">
                                <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-[10px] font-bold text-neutral-500 capitalize">{trajectory.archetypeShift.from}</span>
                                <ArrowRight className="w-3 h-3 text-neutral-300" />
                                <span className="px-3 py-1 bg-violet-500/10 text-violet-500 rounded-lg text-[10px] font-bold capitalize">{trajectory.archetypeShift.to}</span>
                            </div>
                            <div className="mt-4 p-4 bg-violet-500/5 rounded-xl border border-violet-500/10">
                                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                                    {trajectory.trajectoryGap}
                                </p>
                            </div>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-6 border border-neutral-100 dark:border-neutral-800">
                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-4">Growth Signals</span>
                            <div className="space-y-3">
                                {trajectory.keyGrowthSignals.map((signal, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                                        <span className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-tight">{signal}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-neutral-900/50 rounded-2xl p-12 border border-dashed border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center text-center">
                        <TrendingUp className="w-8 h-8 text-neutral-200 dark:text-neutral-800 mb-4" />
                        <p className="text-xs text-neutral-400 max-w-xs">
                            Select or type a target role to calculate the semantic drift and growth path.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
