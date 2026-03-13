import React, { useEffect, useState } from 'react';
import { Shield, Activity, RefreshCw, Zap, TrendingUp, ArrowRight, Share2, Target } from 'lucide-react';
import { RdFeedbackService } from '../../../services/ai/rd/feedbackService';
import { RdStyleService } from '../../../services/ai/rd/styleService';
import { RdTrajectoryService } from '../../../services/ai/rd/trajectoryService';
import { RdEmbeddingService } from '../../../services/ai/rd/embeddingService';
import { RdSimilarityService, type SimilarityResult } from '../../../services/ai/rd/similarityService';
import { ResumeStorage } from '../../../services/storage/resumeStorage';
import { CoachStorage } from '../../../services/storage/coachStorage';
import type { GrowthTrajectory } from '../../../services/ai/rd/types';
import { useUser } from '../../../contexts/UserContext';
import { Button } from '../../../components/ui/Button';

export const NextGenCalibration: React.FC = () => {
    const { user, isNextGenEnabled, updateProfile } = useUser();
    const [stats, setStats] = useState<{ total: number; breakdown: Record<string, number> } | null>(null);
    const [style, setStyle] = useState<string | null>(null);
    const [trajectory, setTrajectory] = useState<GrowthTrajectory | null>(null);
    const [similarity, setSimilarity] = useState<SimilarityResult | null>(null);
    const [targetTitle, setTargetTitle] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTrajectoryLoading, setIsTrajectoryLoading] = useState(false);
    const [isVectorizing, setIsVectorizing] = useState(false);
    const [isSimilarityLoading, setIsSimilarityLoading] = useState(false);

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

            if (targets.length > 0 && !targetTitle) {
                setTargetTitle(targets[0].title);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSyncLatentSpace = async () => {
        if (!user) return;
        setIsVectorizing(true);
        try {
            const resumes = await ResumeStorage.getResumes();
            const master = resumes.find(r => r.id === 'master') || resumes[0];
            if (!master) return;

            const promises = master.blocks
                .filter(b => b.isVisible && b.bullets.length > 0)
                .map(b => RdEmbeddingService.vectorizeAndStore(
                    user.id,
                    `[${b.type}] ${b.title} at ${b.organization}: ${b.bullets.join(' ')}`,
                    'experience_block',
                    b.id
                ));

            await Promise.all(promises);
            await loadModelData();
        } finally {
            setIsVectorizing(false);
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

    const handleTestMatchDistance = async () => {
        if (!user || !targetTitle) return;
        setIsSimilarityLoading(true);
        try {
            const match = await RdSimilarityService.calculateSemanticMatch(user.id, targetTitle);
            setSimilarity(match);
        } finally {
            setIsSimilarityLoading(false);
        }
    };

    useEffect(() => {
        loadModelData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800 min-h-[120px] flex flex-col">
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
                                    <span className="font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-lg">{count} signals</span>
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

            {/* Target Role Controls */}
            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 relative">
                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                        <input
                            type="text"
                            value={targetTitle}
                            onChange={(e) => setTargetTitle(e.target.value)}
                            placeholder="Type a Role Title (e.g. Senior Product Manager)..."
                            className="w-full text-xs bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500/30 font-medium"
                        />
                    </div>
                    <Button
                        variant="premium"
                        size="sm"
                        className="!text-[10px] !py-2"
                        onClick={loadTrajectory}
                        loading={isTrajectoryLoading}
                        disabled={!targetTitle}
                        icon={<TrendingUp className="w-3 h-3" />}
                    >
                        Project Trajectory (L2)
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="!text-[10px] !py-2"
                        onClick={handleTestMatchDistance}
                        loading={isSimilarityLoading}
                        disabled={!targetTitle}
                        icon={<Activity className="w-3 h-3" />}
                    >
                        Test Match Match Distance (L4)
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Trajectory Output */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-3.5 h-3.5 text-violet-500" />
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Growth Vector</span>
                        </div>
                        {trajectory ? (
                            <div className="space-y-3">
                                <h5 className="text-xs font-bold text-neutral-900 dark:text-white">{trajectory.heading}</h5>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-[9px] font-bold text-neutral-500">{trajectory.archetypeShift.from}</span>
                                    <ArrowRight className="w-2.5 h-2.5 text-neutral-300" />
                                    <span className="px-2 py-0.5 bg-violet-500/10 text-violet-500 rounded-md text-[9px] font-bold">{trajectory.archetypeShift.to}</span>
                                </div>
                                <p className="text-[11px] text-neutral-500 leading-relaxed italic">{trajectory.trajectoryGap}</p>
                            </div>
                        ) : (
                            <p className="text-xs text-neutral-400 py-8 text-center italic">Run projection to see path analysis.</p>
                        )}
                    </div>

                    {/* Similarity Output */}
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Semantic Match Distance</span>
                        </div>
                        {similarity ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-black text-neutral-900 dark:text-white">{similarity.score}%</span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${similarity.score > 70 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {similarity.score > 80 ? 'EXCELLENT ALIGNMENT' : similarity.score > 60 ? 'HIGH POTENTIAL' : 'MODERATE DRIFT'}
                                    </span>
                                </div>
                                <p className="text-[11px] text-neutral-500 leading-relaxed">{similarity.explanation}</p>
                                <div className="space-y-2">
                                    {similarity.matchedBlocks.map((block, i) => (
                                        <div key={i} className="flex items-center justify-between text-[10px]">
                                            <span className="text-neutral-400 font-medium truncate max-w-[150px]">Block ID: {block.title.substring(0, 8)}...</span>
                                            <span className="font-bold text-neutral-600">{Math.round(block.score * 100)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-neutral-400 py-8 text-center italic">Test distance to see vector alignment.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
