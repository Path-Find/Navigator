import React, { useEffect, useState, useMemo } from 'react';
import { AlertTriangle, ShieldAlert, Activity, TrendingUp, Users, Laptop, Cpu, Calendar, ShieldCheck, Zap, Search } from 'lucide-react';
import { getUsageOutliers, getAdminUsers, getDailyPulse, type UsageOutlier, type AdminUser, type DailyPulse } from '../../services/adminService';
import { SharedPageLayout } from '../../components/common/SharedPageLayout';

const StatsCard = ({ title, value, subtext, icon: Icon, iconBg, iconColor }: {
    title: string, value: string, subtext?: string,
    icon: React.ElementType, iconBg: string, iconColor: string
}) => (
    <div className="flex flex-col bg-white/60 dark:bg-neutral-900/40 backdrop-blur-md rounded-2xl p-6 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm group hover:border-indigo-500/20 transition-all duration-300 hover:translate-y-[-2px]">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-2.5 rounded-xl ${iconBg} transition-all duration-300 group-hover:scale-105`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <span className="text-[11px] font-semibold text-neutral-400">{title}</span>
        </div>
        <h3 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tighter tabular-nums">{value}</h3>
        {subtext && (
            <p className="text-[11px] font-medium text-neutral-400 mt-1.5">{subtext}</p>
        )}
    </div>
);

export const AdminDashboard: React.FC = () => {
    const [outliers, setOutliers] = useState<UsageOutlier[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [dailyPulse, setDailyPulse] = useState<DailyPulse[]>([]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [outlierData, userData, pulseData] = await Promise.all([
                getUsageOutliers(),
                getAdminUsers(),
                getDailyPulse()
            ]);
            setDailyPulse(pulseData);
            setOutliers(outlierData);
            setUsers(userData);
        } catch {
            setError('Failed to load usage data. Ensure you have admin permissions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const activeStats = useMemo(() => {
        if (outliers.length === 0) return { count: 0, meanOutput: 0, avgEfficiency: 0 };
        const total = outliers.reduce((a, b) => a + b.total_output_tokens, 0);
        const totalOps = outliers.reduce((a, b) => a + b.total_operations, 0);
        return {
            count: outliers.length,
            meanOutput: Math.round(total / outliers.length),
            avgEfficiency: totalOps > 0 ? Math.round(total / totalOps) : 0
        };
    }, [outliers]);

    const pulseHeatmap = useMemo(() => {
        const pulseCounts = dailyPulse.map(p => p.count);
        const maxOps = pulseCounts.length > 0 ? Math.max(...pulseCounts, 1) : 100;
        const today = new Date();
        return Array.from({ length: 28 }).map((_, i) => {
            const dateObj = new Date(today);
            dateObj.setDate(today.getDate() - (27 - i));
            const dateStr = dateObj.toISOString().split('T')[0];
            const entry = dailyPulse.find(p => p.date === dateStr);
            const count = entry?.count || 0;
            const intensity = count > 0 ? (0.3 + (count / maxOps) * 0.7) : 0.05;
            return (
                <div
                    key={`${dateStr}-${i}`}
                    className="w-4 h-4 rounded-[3px] relative group border border-neutral-100/10 dark:border-white/5 transition-all duration-300 hover:ring-2 hover:ring-indigo-500/30"
                    style={{ backgroundColor: count > 0 ? `rgba(99, 102, 241, ${intensity})` : 'rgba(99, 102, 241, 0.05)' }}
                >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-neutral-900 text-[9px] text-white rounded-md hidden group-hover:block whitespace-nowrap z-50 shadow-xl border border-white/10">
                        <div className="font-bold">{dateStr}</div>
                        <div className="text-indigo-400">{count} ops</div>
                    </div>
                </div>
            );
        });
    }, [dailyPulse]);

    const filteredUsers = useMemo(() => users.filter(u =>
        !searchQuery || u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.includes(searchQuery)
    ), [users, searchQuery]);

    const maxActivity = useMemo(() => Math.max(...users.map(u => u.total_ai_calls + u.job_analyses_count), 1), [users]);

    return (
        <SharedPageLayout maxWidth="6xl" spacing="compact">
            <div className="space-y-8 pb-16">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Admin</h1>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
                        Monitoring usage and resource utilization.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatsCard
                            title="Total users"
                            value={activeStats.count.toString()}
                            subtext="Registered accounts"
                            icon={Users}
                            iconBg="bg-blue-500/10"
                            iconColor="text-blue-600 dark:text-blue-400"
                        />
                        <StatsCard
                            title="Avg resource load"
                            value={activeStats.meanOutput.toLocaleString()}
                            subtext="Mean tokens per user"
                            icon={Activity}
                            iconBg="bg-indigo-500/10"
                            iconColor="text-indigo-600 dark:text-indigo-400"
                        />
                        <StatsCard
                            title="Avg efficiency"
                            value={`${activeStats.avgEfficiency}`}
                            subtext="Avg tokens per call"
                            icon={TrendingUp}
                            iconBg="bg-emerald-500/10"
                            iconColor="text-emerald-600 dark:text-emerald-400"
                        />
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-500/20 flex flex-col justify-between overflow-hidden relative group">
                        <div className="relative z-10">
                            <p className="text-indigo-100 text-xs font-medium mb-1">System health</p>
                            <h4 className="text-lg font-bold flex items-center gap-2">
                                Operational
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            </h4>
                            <p className="text-indigo-100/70 text-xs mt-2 leading-relaxed">
                                Infrastructure scaling dynamically. Latency within normal bounds.
                            </p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Laptop className="w-24 h-24" />
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Usage Deviations + Activity */}
                <div className="space-y-4">
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2 px-1">
                        Usage Deviations
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-semibold text-neutral-500">Real-time</span>
                    </h2>

                    {loading ? (
                        <div className="bg-white/50 dark:bg-neutral-900/40 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 h-64 flex flex-col items-center justify-center space-y-3">
                            <div className="w-8 h-8 rounded-full border-2 border-neutral-100 dark:border-neutral-800 border-t-indigo-500 animate-spin" />
                            <p className="text-neutral-400 text-sm">Loading...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Deviations card — static list */}
                            {(() => {
                                const extremeCount = outliers.filter(o =>
                                    activeStats.meanOutput > 0 && (o.total_output_tokens / activeStats.meanOutput) > 2.5
                                ).length;
                                return (
                                    <div className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm overflow-hidden flex flex-col">
                                        <div className="px-5 py-4 flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800">
                                            <div className="p-1.5 bg-amber-500/10 rounded-lg">
                                                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                                            </div>
                                            <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">Deviations</span>
                                            <div className="ml-auto flex items-center gap-2">
                                                {extremeCount > 0 && (
                                                    <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">{extremeCount} extreme</span>
                                                )}
                                                <span className="text-xs font-medium text-neutral-400">{outliers.length} users</span>
                                            </div>
                                        </div>
                                        <div className="px-5 py-4 flex flex-col gap-3">
                                            {outliers.length === 0 ? (
                                                <p className="text-xs text-neutral-400 py-4 text-center">No deviations detected</p>
                                            ) : outliers.slice(0, 6).map((row) => {
                                                const multiplier = activeStats.meanOutput > 0 ? (row.total_output_tokens / activeStats.meanOutput) : 1;
                                                const isExtreme = multiplier > 2.5;
                                                return (
                                                    <div key={row.user_id} className="flex items-center justify-between">
                                                        <span className="text-xs text-neutral-600 dark:text-neutral-300 truncate max-w-[220px]">{row.email || 'Anonymous'}</span>
                                                        <div className={`text-xs font-bold px-2 py-0.5 rounded-lg ${isExtreme ? 'bg-red-500/10 text-red-500' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                                                            {multiplier.toFixed(1)}x
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Activity heatmap */}
                            <div className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl rounded-2xl p-5 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm flex flex-col">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">Activity (28d)</span>
                                    </div>
                                    <div className="flex items-center gap-1 px-2 py-1 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-lg">
                                        <span className="text-[10px] font-medium text-neutral-400">Less</span>
                                        {[0, 0.25, 0.5, 0.75, 1].map(lvl => (
                                            <div key={lvl} className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: `rgba(99, 102, 241, ${Math.max(0.1, lvl)})` }} />
                                        ))}
                                        <span className="text-[10px] font-medium text-neutral-400">More</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-center gap-5">
                                    <div className="grid grid-cols-7 gap-1">
                                        {pulseHeatmap}
                                    </div>
                                    <div className="flex justify-between items-end border-t border-neutral-100 dark:border-neutral-800 pt-4">
                                        <div>
                                            <p className="text-xs font-medium text-neutral-400 mb-1">Peak utilization</p>
                                            <p className="text-xl font-black text-neutral-900 dark:text-white tabular-nums">
                                                {dailyPulse.length > 0 ? Math.max(...dailyPulse.map(p => p.count)) : 0}
                                                <span className="text-xs text-indigo-500 ml-1 font-semibold">req/day</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-neutral-400 mb-1">Total (28d)</p>
                                            <p className="text-xl font-black text-neutral-900 dark:text-white tabular-nums">
                                                {dailyPulse.reduce((sum, p) => sum + p.count, 0)}
                                                <span className="text-xs text-indigo-500 ml-1 font-semibold">ops</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users heatmap */}
                    {!loading && (
                        <div className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm overflow-hidden mt-8">
                            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">All Users</h3>
                                        <p className="text-xs text-neutral-400">{filteredUsers.length} registered</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-neutral-100/50 dark:bg-neutral-800/50 border border-neutral-200/20 dark:border-neutral-700/30 rounded-lg pl-9 pr-4 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all w-48 placeholder:text-neutral-400"
                                    />
                                </div>
                            </div>
                            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                                {filteredUsers.map(user => {
                                    const activity = user.total_ai_calls + user.job_analyses_count;
                                    const intensity = activity > 0 ? 0.06 + (activity / maxActivity) * 0.22 : 0.03;
                                    return (
                                        <div
                                            key={user.id}
                                            className="rounded-xl p-3 border border-indigo-100/20 dark:border-indigo-500/10 transition-all hover:scale-[1.01]"
                                            style={{ backgroundColor: `rgba(99, 102, 241, ${intensity})` }}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                                                    user.subscription_tier === 'pro' ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300' :
                                                    user.subscription_tier === 'admin' ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300' :
                                                    'bg-neutral-400/15 text-neutral-500'
                                                }`}>{user.subscription_tier}</span>
                                                <div className="flex gap-1">
                                                    {user.is_admin && <ShieldCheck className="w-3 h-3 text-indigo-500" />}
                                                    {user.is_tester && <Cpu className="w-3 h-3 text-amber-500" />}
                                                </div>
                                            </div>
                                            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 truncate mb-2">{user.email || 'Unknown'}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                                                    <Zap className="w-2.5 h-2.5" />
                                                    {activity}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SharedPageLayout>
    );
};
