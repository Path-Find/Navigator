import React, { useEffect, useState, useMemo } from 'react';
import { AlertTriangle, ShieldAlert, Activity, RefreshCw, TrendingUp, Users, Laptop, Cpu, Mail, Calendar, ShieldCheck, Zap, UserCheck, Search, Filter } from 'lucide-react';
import { getUsageOutliers, getAdminUsers, getDailyPulse, type UsageOutlier, type AdminUser, type DailyPulse } from '../../services/adminService';

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
    const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'pro' | 'admin' | 'tester'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dailyPulse, setDailyPulse] = useState<DailyPulse[]>([]);

    const tiers = [
        { id: 'all', label: 'All Users', icon: Users },
        { id: 'free', label: 'Free', icon: Activity },
        { id: 'pro', label: 'Pro', icon: TrendingUp },
        { id: 'admin', label: 'Admins', icon: ShieldAlert },
        { id: 'tester', label: 'Testers', icon: UserCheck },
    ];

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
        return {
            all: processCohort(outliers),
            pro: processCohort(outliers.filter(u => u.subscription_tier === 'pro')),
            free: processCohort(outliers.filter(u => u.subscription_tier === 'free')),
            admin: processCohort(outliers.filter(u => u.subscription_tier === 'admin')),
            tester: processCohort(outliers.filter(u => u.subscription_tier === 'tester')),
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
                    className="w-4 h-4 rounded-[3px] relative group border border-neutral-100/10 dark:border-white/5 transition-all duration-300 hover:ring-2 hover:ring-indigo-500/30 shrink-0"
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

    const activeStats = stats[tierFilter];

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-neutral-950 p-6 md:p-10 pt-24">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-indigo-600 rounded-lg shadow-md shadow-indigo-500/20">
                                <ShieldAlert className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Management Portal</span>
                        </div>
                        <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Admin</h1>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
                            Monitoring usage and resource utilization.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Tier filter */}
                        <div className="flex bg-neutral-100/50 dark:bg-neutral-800/50 p-1 rounded-xl border border-neutral-200/20 backdrop-blur-md">
                            {tiers.map((tier) => (
                                <button
                                    key={tier.id}
                                    onClick={() => setTierFilter(tier.id as any)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                        tierFilter === tier.id
                                            ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                                            : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                                    }`}
                                >
                                    <tier.icon className="w-3 h-3" />
                                    {tier.label}
                                </button>
                            ))}
                        </div>

                        <div className="h-7 w-px bg-neutral-200 dark:bg-neutral-800 hidden md:block" />

                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm hover:border-neutral-300 dark:hover:border-neutral-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 text-neutral-500 ${loading ? 'animate-spin' : ''}`} />
                        </button>

                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatsCard
                            title="Total users"
                            value={activeStats.count.toString()}
                            subtext={`Active ${tierFilter === 'all' ? 'users' : tierFilter + ' users'}`}
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

                {/* Usage Deviations */}
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
                            {/* Deviations table */}
                            <div className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm overflow-hidden flex flex-col">
                                <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-amber-500/10 rounded-lg">
                                            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                                        </div>
                                        <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">Deviations</span>
                                    </div>
                                    <span className="text-[10px] font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">Active loop</span>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-neutral-100 dark:border-neutral-800">
                                                <th className="px-5 py-3 text-xs font-semibold text-neutral-400">User</th>
                                                <th className="px-5 py-3 text-xs font-semibold text-neutral-400 text-right">Tokens</th>
                                                <th className="px-5 py-3 text-xs font-semibold text-neutral-400 text-right">Drift</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                            {outliers.filter(o => tierFilter === 'all' || o.subscription_tier === tierFilter).slice(0, 10).map((row) => {
                                                const mean = activeStats.meanOutput;
                                                const multiplier = mean > 0 ? (row.total_output_tokens / mean) : 1;
                                                const isExtreme = multiplier > 2.5;
                                                return (
                                                    <tr key={row.user_id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                                                        <td className="px-5 py-3">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate max-w-[140px]">{row.email || 'Anonymous'}</span>
                                                                <span className="text-[10px] font-mono text-neutral-400">{row.user_id.substring(0, 8)}...</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3 text-right font-bold text-xs text-neutral-900 dark:text-white tabular-nums">
                                                            {row.total_output_tokens.toLocaleString()}
                                                        </td>
                                                        <td className="px-5 py-3 text-right">
                                                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${isExtreme ? 'bg-red-500/10 text-red-500' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                                                                {multiplier.toFixed(1)}x
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Heatmap */}
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
                                    <div className="flex flex-wrap gap-1">
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
                                            <p className="text-xs font-medium text-neutral-400 mb-1">Cluster pulse</p>
                                            <p className="text-xl font-black text-emerald-500">Live</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users table */}
                    {!loading && (
                        <div className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm overflow-hidden mt-8">
                            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">All Users</h3>
                                        <p className="text-xs text-neutral-400">{users.length} registered</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="Search by email or ID..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="bg-neutral-100/50 dark:bg-neutral-800/50 border border-neutral-200/20 dark:border-neutral-700/30 rounded-lg pl-9 pr-4 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all w-56 placeholder:text-neutral-400"
                                        />
                                    </div>
                                    <button className="p-1.5 bg-neutral-100/50 dark:bg-neutral-800/50 border border-neutral-200/20 dark:border-neutral-700/30 rounded-lg">
                                        <Filter className="w-3.5 h-3.5 text-neutral-400" />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/20">
                                            <th className="px-6 py-3 text-xs font-semibold text-neutral-400">User</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-neutral-400 text-center">Plan</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-neutral-400 text-center">Roles</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-neutral-400 text-right">Activity</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-neutral-400 text-right">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {users.filter(u => {
                                            const matchesTier = tierFilter === 'all' || u.subscription_tier === tierFilter;
                                            const matchesSearch = u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.includes(searchQuery);
                                            return matchesTier && matchesSearch;
                                        }).map((user) => (
                                            <tr key={user.id} className="hover:bg-white/40 dark:hover:bg-neutral-800/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-center border border-neutral-200/20 shrink-0">
                                                            <Mail className="w-3.5 h-3.5 text-neutral-400" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-semibold text-neutral-900 dark:text-white">{user.email || 'N/A'}</span>
                                                            <span className="text-[10px] font-mono text-neutral-400">{user.id.substring(0, 16)}...</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                            user.subscription_tier === 'pro' ? 'bg-indigo-500/10 text-indigo-500' :
                                                            user.subscription_tier === 'admin' ? 'bg-purple-500/10 text-purple-500' :
                                                            'bg-neutral-400/10 text-neutral-400'
                                                        }`}>
                                                            {user.subscription_tier}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center gap-1.5">
                                                        {user.is_admin && <span title="Admin"><ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /></span>}
                                                        {user.is_tester && <span title="Tester"><Cpu className="w-3.5 h-3.5 text-amber-500" /></span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs font-bold text-neutral-900 dark:text-white tabular-nums flex items-center gap-1">
                                                            <Zap className="w-3 h-3 text-emerald-500" />
                                                            {user.total_ai_calls + user.job_analyses_count}
                                                        </span>
                                                        <span className="text-[10px] text-neutral-400">total ops</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-xs text-neutral-400 tabular-nums">
                                                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                            </tr>
                                        ))}
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
