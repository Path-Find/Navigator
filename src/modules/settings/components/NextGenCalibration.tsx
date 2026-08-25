import React, { useEffect, useState } from 'react';
import { RefreshCw, Cpu, Gauge } from 'lucide-react';
import { motion } from 'framer-motion';
import { RdFeedbackService } from '../../../services/ai/rd/feedbackService';
import { RdStyleService } from '../../../services/ai/rd/styleService';
import { useUser } from '../../../contexts/UserContext';
import { Button } from '../../../components/ui/Button';

export const NextGenCalibration: React.FC = () => {
    const { user } = useUser();
    const [stats, setStats] = useState<{ total: number; breakdown: Record<string, number> } | null>(null);
    const [style, setStyle] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadModelData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [statsData, styleData] = await Promise.all([
                RdFeedbackService.getSignalStats(user.id),
                RdStyleService.getPersonalizedStyle(user.id, 'all'),
            ]);
            setStats(statsData);
            setStyle(styleData);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadModelData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <div className="bg-white dark:bg-neutral-900/50 rounded-3xl border border-neutral-100 dark:border-neutral-800 p-8 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-neutral-500/10 rounded-xl">
                        <Cpu className="w-5 h-5 text-neutral-500" />
                    </div>
                    <div>
                        <h4 className="font-bold text-neutral-900 dark:text-white">NextGen Engine</h4>
                        <p className="text-xs text-neutral-400 mt-0.5">Learns from your application activity to personalize assistance</p>
                    </div>
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Enabled</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Learned style */}
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-neutral-500/10 rounded-lg">
                                <Cpu className="w-3.5 h-3.5 text-neutral-500" />
                            </div>
                            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Learned writing style</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={loadModelData}
                            loading={isLoading}
                            icon={<RefreshCw className="w-3 h-3" />}
                            className="!h-7 !px-2.5 !text-xs"
                        >
                            Refresh
                        </Button>
                    </div>
                    <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                        Generated from recorded cover-letter usage. This is separate from your editable cover-letter preference.
                    </p>
                    <div className="min-h-[80px] flex items-center justify-center">
                        {style ? (
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed italic border-l-2 border-neutral-500/30 pl-3">
                                "{style}"
                            </p>
                        ) : (
                            <p className="text-xs text-neutral-400 text-center">No cover letters yet</p>
                        )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <div className="h-1 flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: style ? '100%' : '0%' }}
                                className="h-full bg-neutral-500"
                            />
                        </div>
                        <span className="text-[10px] font-medium text-neutral-400">{style ? 'Ready' : 'Empty'}</span>
                    </div>
                </div>

                {/* Activity signals */}
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-5 border border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                            <Gauge className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Activity signals</span>
                    </div>
                    <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                        Recorded automatically as you save, edit, and approve. Used to tune match quality over time.
                    </p>
                    <div className="min-h-[80px] flex items-center justify-center">
                        {stats?.total ? (
                            <div className="grid grid-cols-2 gap-2 w-full">
                                {Object.entries(stats.breakdown).map(([type, count]) => (
                                    <div key={type} className="p-2.5 bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                        <p className="text-[10px] text-neutral-400 capitalize mb-0.5">{type.replace('_', ' ')}</p>
                                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{count}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-neutral-400 text-center">No signals yet — use the app and they'll appear here</p>
                        )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                        <span className="text-xs text-neutral-400">{stats?.total || 0} signals recorded</span>
                        <span className="text-xs font-medium text-neutral-500">{stats?.total ? 'Active' : 'Waiting'}</span>
                    </div>
                </div>
            </div>

        </div>
    );
};
