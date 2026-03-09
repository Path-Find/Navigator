import React, { useEffect, useState, useMemo } from 'react';
import { getUsageOutliers, type UsageOutlier } from '../../services/adminService';
import { AlertTriangle, ShieldAlert, Activity, RefreshCw, TrendingUp, Users, Laptop } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import type { UserTier } from '../../types/app';

const StatsCard = ({ title, value, subtext, icon: Icon, color }: { title: string, value: string, subtext?: string, icon: React.ElementType, color: string }) => (
    <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-start justify-between group hover:border-indigo-500/30 transition-all duration-300">
        <div>
            <p className="text-[11px] font-bold text-neutral-400 tracking-wider mb-1.5">{title}</p>
            <h3 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{value}</h3>
            {subtext && <p className="text-xs text-neutral-500 mt-2 font-medium">{subtext}</p>}
        </div>
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 group-hover:scale-110 transition-transform duration-500`}>
            <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
    </div>
);

export const AdminDashboard: React.FC = () => {
    const { simulatedTier, setSimulatedTier } = useUser();
    const [outliers, setOutliers] = useState<UsageOutlier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cohortFilter, setCohortFilter] = useState<'all' | 'free' | 'pro'>('all');

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUsageOutliers();
            setOutliers(data);
        } catch (err) {
            setError('Failed to load usage data. Ensure you have admin permissions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- Dynamic Analytics Logic ---
    const stats = useMemo(() => {
        const calculateMedian = (values: number[]) => {
            if (values.length === 0) return 0;
            const sorted = [...values].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        };

        const processCohort = (users: UsageOutlier[]) => {
            if (users.length === 0) return { count: 0, meanOutput: 0, medianOutput: 0, avgEfficiency: 0 };
            const outputs = users.map(u => u.total_output_tokens);
            const total = outputs.reduce((a, b) => a + b, 0);
            const totalOps = users.reduce((a, b) => a + b.total_operations, 0);
            return {
                count: users.length,
                meanOutput: Math.round(total / users.length),
                medianOutput: calculateMedian(outputs),
                avgEfficiency: totalOps > 0 ? Math.round(total / totalOps) : 0
            };
        };

        const proUsers = outliers.filter(u => u.total_operations > 50);
        const freeUsers = outliers.filter(u => u.total_operations <= 50);

        return {
            all: processCohort(outliers),
            pro: processCohort(proUsers),
            free: processCohort(freeUsers)
        };
    }, [outliers]);

    const activeStats = stats[cohortFilter];

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-neutral-950 p-6 md:p-12 pt-24">
            <div className="max-w-6xl mx-auto space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                                <ShieldAlert className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">Management Portal</span>
                        </div>
                        <h1 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
                            Admin
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm font-medium">
                            Monitoring network behavior and resource utilization across cohorts.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex bg-white dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                            {(['all', 'free', 'pro'] as const).map(tier => (
                                <button
                                    key={tier}
                                    onClick={() => setCohortFilter(tier)}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg capitalize transition-all ${cohortFilter === tier
                                        ? 'bg-neutral-900 dark:bg-neutral-700 text-white shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                                        }`}
                                >
                                    {tier}
                                </button>
                            ))}
                        </div>

                        <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800 hidden md:block" />

                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 text-neutral-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                        <div className="flex bg-white dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm items-center gap-1">
                            <div className="px-3 py-1.5 flex items-center gap-2">
                                <Laptop className="w-3.5 h-3.5 text-neutral-400" />
                                <span className="text-[10px] font-bold text-neutral-400 tracking-wide">Simulation</span>
                            </div>
                            {[
                                { id: null as UserTier | null, label: 'Standard' },
                                { id: 'pro' as UserTier, label: 'Pro' },
                                { id: 'free' as UserTier, label: 'Free' }
                            ].map((tier) => (
                                <button
                                    key={tier.label}
                                    onClick={() => setSimulatedTier(tier.id)}
                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${simulatedTier === tier.id
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                                        }`}
                                >
                                    {tier.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Stats Grid */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatsCard
                            title="Cohort Population"
                            value={activeStats.count.toString()}
                            subtext={`Active ${cohortFilter} users`}
                            icon={Users}
                            color="bg-blue-600"
                        />
                        <StatsCard
                            title="Avg Resource Load"
                            value={activeStats.meanOutput.toLocaleString()}
                            subtext="Mean tokens per user"
                            icon={Activity}
                            color="bg-indigo-600"
                        />
                        <StatsCard
                            title="Consumption Efficiency"
                            value={`${activeStats.avgEfficiency}`}
                            subtext="Avg tokens per call"
                            icon={TrendingUp}
                            color="bg-emerald-600"
                        />
                    </div>

                    {/* Secondary Metrics / Info */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 flex flex-col justify-between overflow-hidden relative group">
                        <div className="relative z-10">
                            <p className="text-indigo-100 text-[10px] font-bold tracking-widest mb-1">System Health</p>
                            <h4 className="text-xl font-bold flex items-center gap-2">
                                Operational
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            </h4>
                            <p className="text-indigo-100/70 text-xs mt-2 leading-relaxed">
                                Infrastructure is scaling dynamically. Latency is within normal bounds.
                            </p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Laptop className="w-32 h-32" />
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Main Content Table */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            Usage Deviations
                            <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-bold text-neutral-500">Real-time</span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 h-96 flex flex-col items-center justify-center space-y-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full border-4 border-neutral-100 dark:border-neutral-800 border-t-indigo-500 animate-spin" />
                                <RefreshCw className="w-4 h-4 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <p className="text-neutral-500 text-sm font-medium">Analyzing behavioral patterns...</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-neutral-900/50 backdrop-blur-xl rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50">
                                            <th className="p-5 text-[10px] font-bold text-neutral-400 tracking-widest">User entity</th>
                                            <th className="p-5 text-[10px] font-bold text-neutral-400 tracking-widest text-right">Operations</th>
                                            <th className="p-5 text-[10px] font-bold text-neutral-400 tracking-widest text-right">Input tokens</th>
                                            <th className="p-5 text-[10px] font-bold text-neutral-400 tracking-widest text-right">Output tokens</th>
                                            <th className="p-5 text-[10px] font-bold text-neutral-400 tracking-widest text-right">Variance</th>
                                            <th className="p-5 text-[10px] font-bold text-neutral-400 tracking-widest text-right">Recent activity</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {outliers.map((row) => {
                                            const mean = activeStats.meanOutput;
                                            const multiplier = mean > 0 ? (row.total_output_tokens / mean) : 0;
                                            const isExtreme = multiplier > 3.0;
                                            const isHigh = multiplier > 1.5;

                                            return (
                                                <tr
                                                    key={row.user_id}
                                                    className={`group transition-all duration-300 border-l-4 ${isExtreme ? 'bg-red-50/30 dark:bg-red-950/10 border-red-500' :
                                                        isHigh ? 'bg-amber-50/20 dark:bg-amber-950/5 border-amber-400' :
                                                            'hover:bg-neutral-50 dark:hover:bg-neutral-800/30 border-transparent'
                                                        }`}
                                                >
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-inner transition-transform group-hover:scale-105 ${isExtreme ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                                isHigh ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                    'bg-neutral-100 text-neutral-500 dark:bg-neutral-800/50 dark:text-neutral-400'
                                                                }`}>
                                                                {row.user_id.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400 font-bold" title={row.user_id}>
                                                                    {row.user_id.substring(0, 16)}...
                                                                </span>
                                                                {isExtreme && (
                                                                    <span className="text-[9px] font-black text-red-600 dark:text-red-400 mt-0.5">High Deviation</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-5 text-right font-bold text-neutral-700 dark:text-neutral-300 text-sm">
                                                        {row.total_operations.toLocaleString()}
                                                    </td>
                                                    <td className="p-5 text-right text-neutral-500 dark:text-neutral-500 text-sm">
                                                        {row.total_input_tokens.toLocaleString()}
                                                    </td>
                                                    <td className={`p-5 text-right font-black text-sm ${isExtreme ? 'text-red-600 dark:text-red-400' : isHigh ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-900 dark:text-neutral-200'}`}>
                                                        {row.total_output_tokens.toLocaleString()}
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${isHigh ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                                                            }`}>
                                                            {multiplier.toFixed(1)}x
                                                            <TrendingUp className="w-2.5 h-2.5" />
                                                        </div>
                                                    </td>
                                                    <td className="p-5 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400">
                                                        {new Date(row.last_active).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {outliers.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-20 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Users className="w-10 h-10 text-neutral-200 dark:text-neutral-800" />
                                                        <p className="text-neutral-400 text-sm font-medium">No behavioral anomalies detected in this cohort.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
