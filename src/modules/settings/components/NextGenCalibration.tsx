import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, TrendingUp, ArrowRight, Share2, Target, Cpu, Binary, Gauge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-8 md:p-10 shadow-sm"
        >
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-400/20 text-indigo-500">
                            <Cpu className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xl md:text-2xl tracking-tight text-neutral-900 dark:text-white uppercase">
                                    NextGen <span className="text-neutral-400 font-medium lowercase">Modeling Engine</span>
                                </h4>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Admin-only Calibration Portal</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                        <div className="flex flex-col items-end">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isNextGenEnabled ? 'text-indigo-500' : 'text-neutral-500'}`}>
                                {isNextGenEnabled ? 'Core Active' : 'Core Standby'}
                            </span>
                        </div>
                        <button
                            onClick={handleToggleNextGen}
                            className={`group relative w-12 h-6 rounded-full transition-all duration-300 p-1 ${isNextGenEnabled ? 'bg-indigo-600' : 'bg-neutral-200 dark:bg-neutral-700'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 transform shadow-sm ${isNextGenEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Style Model */}
                    <motion.div 
                        whileHover={{ y: -2 }}
                        className="flex flex-col bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl p-6 border border-neutral-100 dark:border-neutral-800 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-xl">
                                    <Cpu className="w-4 h-4 text-indigo-500" />
                                </div>
                                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Latent Model</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="!text-[9px] !h-7 !px-3 font-bold bg-neutral-100 dark:bg-neutral-800/50 uppercase tracking-tighter"
                                onClick={loadModelData}
                                loading={isLoading}
                                icon={<RefreshCw className="w-3 h-3" />}
                            >
                                Re-sync
                            </Button>
                        </div>
                        <div className="flex-1 flex flex-col justify-center min-h-[140px] relative">
                            {style ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="relative"
                                >
                                    <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 leading-relaxed italic pl-4 border-l-2 border-indigo-500/30">
                                        "{style}"
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-6 opacity-40">
                                    <Binary className="w-10 h-10 text-neutral-400" />
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-center">No Style Matrix</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="h-1 flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: style ? '100%' : '0%' }}
                                    className="h-full bg-indigo-500" 
                                />
                            </div>
                            <span className="text-[8px] font-bold text-indigo-500">{style ? 'READY' : 'EMPTY'}</span>
                        </div>
                    </motion.div>

                    {/* Signal Stats */}
                    <motion.div 
                        whileHover={{ y: -2 }}
                        className="flex flex-col bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl p-6 border border-neutral-100 dark:border-neutral-800 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-xl">
                                    <Gauge className="w-4 h-4 text-emerald-500" />
                                </div>
                                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">Signal Intelligence</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="!text-[9px] !h-7 !px-3 font-bold bg-neutral-100 dark:bg-neutral-800/50 uppercase tracking-tighter"
                                onClick={handleSyncLatentSpace}
                                loading={isVectorizing}
                                icon={<Share2 className="w-3 h-3 text-emerald-500" />}
                            >
                                Mapping
                            </Button>
                        </div>
                        <div className="space-y-4 flex-1">
                            {stats ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(stats.breakdown).map(([type, count]) => (
                                        <div key={type} className="flex flex-col gap-1 p-3 bg-white dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                            <span className="capitalize text-[8px] font-bold text-neutral-400 tracking-wider font-mono">{type.replace('_', ' ')}</span>
                                            <span className="text-sm font-bold text-neutral-900 dark:text-white tabular-nums">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 py-6 opacity-40">
                                    <Activity className="w-10 h-10 text-neutral-400" />
                                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-center">Awaiting Signals</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 pt-4 border-t border-dashed border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-neutral-400 uppercase">Vector Modeling</span>
                                <span className="text-xl font-bold text-indigo-500 tabular-nums">{stats?.total || 0} <span className="text-[10px] text-neutral-400 font-medium lowercase ml-1">signals mapped</span></span>
                            </div>
                            <div className="p-3 bg-indigo-500/5 rounded-2xl">
                                <Binary className="w-6 h-6 text-indigo-500 opacity-20" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Role Projection Controls */}
                <div className="relative p-1 bg-neutral-50 dark:bg-neutral-900/50 rounded-[28px] border border-neutral-100 dark:border-neutral-800">
                    <div className="flex flex-col md:flex-row items-center gap-4 p-2">
                        <div className="flex-1 w-full relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-focus-within:scale-110">
                                <Target className="w-5 h-5 text-indigo-500" />
                            </div>
                            <input
                                type="text"
                                value={targetTitle}
                                onChange={(e) => setTargetTitle(e.target.value)}
                                placeholder="Target Role Manifest (e.g. Lead Designer)..."
                                className="w-full text-sm font-black bg-neutral-100 dark:bg-neutral-800/80 border-none rounded-2xl pl-16 pr-6 py-4.5 outline-none ring-0 placeholder:text-neutral-500 focus:bg-white dark:focus:bg-neutral-800 transition-all shadow-inner"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto p-1">
                            <Button
                                variant="premium"
                                className="flex-1 md:flex-none !rounded-2xl !py-4 px-8 shadow-xl shadow-indigo-500/20 whitespace-nowrap"
                                onClick={loadTrajectory}
                                loading={isTrajectoryLoading}
                                disabled={!targetTitle}
                                icon={<TrendingUp className="w-5 h-5" />}
                            >
                                Project Trajectory
                            </Button>
                            <Button
                                variant="secondary"
                                className="!rounded-2xl !py-4 px-6 bg-white dark:bg-neutral-800 whitespace-nowrap"
                                onClick={handleTestMatchDistance}
                                loading={isSimilarityLoading}
                                disabled={!targetTitle}
                                icon={<Activity className="w-5 h-5 text-emerald-500" />}
                            >
                                Test Match
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Outputs */}
                <AnimatePresence>
                    {(trajectory || similarity) && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10"
                        >
                            {/* Trajectory Output */}
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-100 dark:border-neutral-800 relative overflow-hidden shadow-sm"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <TrendingUp className="w-32 h-32 text-indigo-500" />
                                </div>
                                
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-violet-500/10 rounded-xl">
                                        <TrendingUp className="w-4 h-4 text-violet-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.3em]">Growth Projection Summary</span>
                                </div>
                                
                                {trajectory ? (
                                    <div className="space-y-6 relative z-10">
                                        <h5 className="text-xl font-black text-neutral-900 dark:text-white leading-tight">{trajectory.heading}</h5>
                                        
                                        <div className="flex items-center p-4 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl border border-indigo-500/10">
                                            <div className="flex-1 flex flex-col gap-1 items-center">
                                                <span className="text-[9px] font-black text-neutral-500 uppercase">Baseline</span>
                                                <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-black text-neutral-600 dark:text-neutral-400">{trajectory.archetypeShift.from}</span>
                                            </div>
                                            <div className="px-4">
                                                <div className="w-10 h-[2px] bg-gradient-to-r from-neutral-300 to-indigo-500 relative">
                                                    <ArrowRight className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                                                </div>
                                            </div>
                                            <div className="flex-1 flex flex-col gap-1 items-center">
                                                <span className="text-[9px] font-black text-indigo-500 uppercase">Target</span>
                                                <span className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-black shadow-lg shadow-indigo-500/20">{trajectory.archetypeShift.to}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="relative p-6 bg-white dark:bg-black/20 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed italic font-mono">
                                                {trajectory.trajectoryGap}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 flex flex-col items-center opacity-30">
                                        <Activity className="w-12 h-12 text-neutral-400 mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Execute Projection To Reveal Path</p>
                                    </div>
                                )}
                            </motion.div>

                            {/* Similarity Output */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-100 dark:border-neutral-800 relative overflow-hidden shadow-sm"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Activity className="w-32 h-32 text-emerald-500" />
                                </div>

                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-emerald-500/10 rounded-xl">
                                        <Activity className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.3em]">Semantic Alignment Matrix</span>
                                </div>
                                
                                {similarity ? (
                                    <div className="space-y-8 relative z-10">
                                        <div className="flex items-end justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Compatibility Score</span>
                                                <span className="text-6xl font-black text-neutral-900 dark:text-white tabular-nums tracking-tighter">
                                                    {similarity.score}<span className="text-2xl text-indigo-500">%</span>
                                                </span>
                                            </div>
                                            <div className={`text-[10px] font-black px-4 py-2 rounded-xl mb-2 tracking-widest border ${
                                                similarity.score > 70 
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            }`}>
                                                {similarity.score > 80 ? 'EXCELLENT ALIGNMENT' : similarity.score > 60 ? 'HIGH POTENTIAL' : 'MODERATE DRIFT'}
                                            </div>
                                        </div>

                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-bold">
                                            {similarity.explanation}
                                        </p>

                                        <div className="space-y-3">
                                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Feature Weights (Top 3)</span>
                                            {similarity.matchedBlocks.slice(0, 3).map((block, i) => (
                                                <div key={i} className="group flex flex-col gap-2 p-3 bg-white/50 dark:bg-black/20 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                                    <div className="flex justify-between items-center text-[10px]">
                                                        <span className="font-black text-neutral-500 uppercase tracking-tighter truncate max-w-[200px]">Signal Block: {block.title}</span>
                                                        <span className="font-mono text-emerald-500">{Math.round(block.score * 100)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${block.score * 100}%` }}
                                                            className="h-full bg-emerald-500/60" 
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 flex flex-col items-center opacity-30">
                                        <Gauge className="w-12 h-12 text-neutral-400 mb-4" />
                                        <p className="text-xs font-black uppercase tracking-widest">Measure Distance To Reveal Alignment</p>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
