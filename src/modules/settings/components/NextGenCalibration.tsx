import React, { useEffect, useState } from 'react';
import { Shield, Activity, RefreshCw, Zap } from 'lucide-react';
import { RdFeedbackService } from '../../../services/ai/rd/feedbackService';
import { RdStyleService } from '../../../services/ai/rd/styleService';
import { useUser } from '../../../contexts/UserContext';
import { Button } from '../../../components/ui/Button';

export const NextGenCalibration: React.FC = () => {
    const { user, isNextGenEnabled, updateProfile } = useUser();
    const [stats, setStats] = useState<{ total: number; breakdown: Record<string, number> } | null>(null);
    const [style, setStyle] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadModelData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const [statsData, styleData] = await Promise.all([
                RdFeedbackService.getSignalStats(user.id),
                RdStyleService.getPersonalizedStyle(user.id, 'all')
            ]);
            setStats(statsData);
            setStyle(styleData);
        } finally {
            setIsLoading(false);
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
                    <div className="flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Signal Density</span>
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
        </div>
    );
};
