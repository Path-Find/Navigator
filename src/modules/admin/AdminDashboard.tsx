import React, { useEffect, useState, useMemo } from 'react';
import { AlertTriangle, ShieldAlert, Activity, RefreshCw, TrendingUp, Users, Laptop, Cpu, Mail, Calendar, ShieldCheck, Zap, UserCheck, Search, Filter } from 'lucide-react';
import { getUsageOutliers, getAdminUsers, getDailyPulse, type UsageOutlier, type AdminUser, type DailyPulse } from '../../services/adminService';
import { useUser } from '../../contexts/UserContext';
import type { UserTier } from '../../types/app';

const StatsCard = ({ title, value, subtext, icon: Icon, color }: { title: string, value: string, subtext?: string, icon: React.ElementType, color: string }) => (
    <div className="flex flex-col bg-white/60 dark:bg-neutral-900/40 backdrop-blur-md rounded-[32px] p-8 border border-neutral-200/50 dark:border-neutral-800/50 shadow-sm group hover:border-indigo-500/20 transition-all duration-500 hover:translate-y-[-4px]">
        <div className="flex items-start justify-between mb-6">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20 transition-all duration-500 group-hover:scale-110`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{title}</span>
            </div>
        </div>
        <div>
            <h3 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tighter tabular-nums">{value}</h3>
            {subtext && (
                <div className="flex items-center gap-1.5 mt-3">
                    <div className="w-1 h-1 rounded-full bg-neutral-300" />
                    <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">{subtext}</p>
                </div>
            )}
        </div>
    </div>
);

export const AdminDashboard: React.FC = () => {
    const { simulatedTier, setSimulatedTier } = useUser();
    const [outliers, setOutliers] = useState<UsageOutlier[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cohortFilter, setCohortFilter] = useState<'all' | 'free' | 'pro' | 'admin' | 'tester'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dailyPulse, setDailyPulse] = useState<DailyPulse[]>([]);

    const cohorts = [
        { id: 'all', label: 'All Users', icon: Users },
        { id: 'free', label: 'Free Tier', icon: Activity },
        { id: 'pro', label: 'Pro Tier', icon: TrendingUp },
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

        const proUsers = outliers.filter(u => u.subscription_tier === 'pro');
        const freeUsers = outliers.filter(u => u.subscription_tier === 'free');
        const adminUsers = outliers.filter(u => u.subscription_tier === 'admin');
        const testerUsers = outliers.filter(u => u.subscription_tier === 'tester');
 
        return {
            all: processCohort(outliers),
            pro: processCohort(proUsers),
            free: processCohort(freeUsers),
            admin: processCohort(adminUsers),
            tester: processCohort(testerUsers)
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
            
            // Calculate intensity (0.1 for empty, up to 1 for max)
            const intensity = count > 0 ? (0.3 + (count / maxOps) * 0.7) : 0.05;
            
            return (
                <div 
                    key={`${dateStr}-${i}`} 
                    className="aspect-square rounded-[3px] relative group border border-neutral-100/10 dark:border-white/5 transition-all duration-500 hover:ring-2 hover:ring-indigo-500/30"
                    style={{ 
                        backgroundColor: count > 0 
                            ? `rgba(99, 102, 241, ${intensity})` 
                            : 'rgba(99, 102, 241, 0.05)'
                    }}
                >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-800 text-[8px] text-white rounded-[4px] hidden group-hover:block whitespace-nowrap z-50 shadow-2xl border border-white/10">
                        <div className="font-black mb-0.5">{dateStr}</div>
                        <div className="text-indigo-400">{count} operations</div>
                    </div>
                </div>
            );
        });
    }, [dailyPulse]);

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
                        <div className="flex bg-neutral-100/50 dark:bg-neutral-800/50 p-1 rounded-2xl border border-neutral-200/20 backdrop-blur-md">
                            {cohorts.map((cohort) => (
                                <button
                                    key={cohort.id}
                                    onClick={() => setCohortFilter(cohort.id as any)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                                        cohortFilter === cohort.id
                                            ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] ring-1 ring-neutral-200/20'
                                            : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                                    }`}
                                >
                                    <cohort.icon className="w-3.5 h-3.5" />
                                    {cohort.label}
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
                        <div className="bg-white/50 dark:bg-neutral-900/40 backdrop-blur-xl rounded-[32px] border border-neutral-200/50 dark:border-neutral-800/50 h-96 flex flex-col items-center justify-center space-y-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full border-4 border-neutral-100 dark:border-neutral-800 border-t-indigo-500 animate-spin" />
                                <RefreshCw className="w-4 h-4 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <p className="text-neutral-500 text-sm font-medium">Analyzing behavioral patterns...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Usage Deviations */}
                            <div className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl rounded-[32px] border border-neutral-200/50 dark:border-neutral-800/50 shadow-xl overflow-hidden flex flex-col">
                                <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-500/10 rounded-xl">
                                            <ShieldAlert className="w-4 h-4 text-amber-500" />
                                        </div>
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Usage Deviations</span>
                                    </div>
                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">Active Loop</span>
                                </div>
                                <div className="overflow-x-auto flex-1">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/30">
                                                <th className="p-5 text-[9px] font-black text-neutral-400 tracking-[0.2em] uppercase">User</th>
                                                <th className="p-5 text-[9px] font-black text-neutral-400 tracking-[0.2em] uppercase text-right">Tokens</th>
                                                <th className="p-5 text-[9px] font-black text-neutral-400 tracking-[0.2em] uppercase text-right">Drift</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                            {outliers.filter(o => cohortFilter === 'all' || o.subscription_tier === cohortFilter).slice(0, 10).map((row) => {
                                                const mean = activeStats.meanOutput;
                                                const multiplier = mean > 0 ? (row.total_output_tokens / mean) : 1;
                                                const isExtreme = multiplier > 2.5;

                                                return (
                                                    <tr key={row.user_id} className="group transition-colors duration-300 hover:bg-white/50 dark:hover:bg-neutral-800/40">
                                                        <td className="p-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-neutral-900 dark:text-white truncate max-w-[140px]">{row.email || 'Anonymous'}</span>
                                                                <span className="text-[10px] font-mono text-neutral-400">{row.user_id.substring(0, 8)}...</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-5 text-right font-black text-xs text-neutral-900 dark:text-white tabular-nums">
                                                            {row.total_output_tokens.toLocaleString()}
                                                        </td>
                                                        <td className="p-5 text-right">
                                                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black ${isExtreme ? 'bg-red-500/10 text-red-500' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
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

                            {/* Activity Heatmap (Simplified for Beta) */}
                            <div className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl rounded-[32px] p-8 border border-neutral-200/50 dark:border-neutral-800/50 shadow-xl flex flex-col">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/10 rounded-xl">
                                            <Calendar className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Network Pulse</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-lg">
                                        <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter">Less</span>
                                        {[0, 0.25, 0.5, 0.75, 1].map(lvl => (
                                            <div key={lvl} className="w-2.5 h-2.5 rounded-[2px] transition-colors duration-500" style={{ backgroundColor: `rgba(99, 102, 241, ${Math.max(0.1, lvl)})` }} />
                                        ))}
                                        <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-tighter ml-0.5">More</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-center gap-8">
                                     <div className="grid grid-cols-7 gap-2">
                                        {pulseHeatmap}
                                    </div>
                                    <div className="flex justify-between items-end border-t border-neutral-100 dark:border-neutral-800 pt-8">
                                        <div>
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Peak Utilization</p>
                                            <p className="text-2xl font-black text-neutral-900 dark:text-white">
                                                {dailyPulse.length > 0 ? Math.max(...dailyPulse.map(p => p.count)) : 0}
                                                <span className="text-[10px] text-indigo-500 ml-1 uppercase font-bold tracking-wider">req/day</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Cluster Pulse</p>
                                            <p className="text-2xl font-black text-emerald-500">Live</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Matrix */}
                    {!loading && (
                        <div className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl rounded-[32px] border border-neutral-200/50 dark:border-neutral-800/50 shadow-xl overflow-hidden mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="p-8 border-b border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-500/10 rounded-xl">
                                        <Users className="w-4 h-4 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">User Matrix</h3>
                                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">All Registered Entities</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="relative group">
                                        <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                                        <input 
                                            type="text" 
                                            placeholder="Search by email or ID..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="bg-neutral-100/50 dark:bg-neutral-800/50 border border-neutral-200/20 dark:border-neutral-700/30 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all w-64 placeholder:text-neutral-400"
                                        />
                                    </div>
                                    <button className="p-2.5 bg-neutral-100/50 dark:bg-neutral-800/50 border border-neutral-200/20 dark:border-neutral-700/30 rounded-xl">
                                        <Filter className="w-3.5 h-3.5 text-neutral-400" />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/20">
                                            <th className="p-6 text-[9px] font-black text-neutral-400 tracking-[0.2em] uppercase">Identity</th>
                                            <th className="p-6 text-[9px] font-black text-neutral-400 tracking-[0.2em] uppercase text-center">Cohort</th>
                                            <th className="p-6 text-[9px] font-black text-neutral-400 tracking-[0.2em] uppercase text-center">Status</th>
                                            <th className="p-6 text-[9px] font-black text-neutral-400 tracking-[0.2em] uppercase text-right">Activity</th>
                                            <th className="p-6 text-[9px] font-black text-neutral-400 tracking-[0.2em] uppercase text-right">Registered</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                        {users.filter(u => {
                                            const matchesCohort = cohortFilter === 'all' || u.subscription_tier === cohortFilter;
                                            const matchesSearch = u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.includes(searchQuery);
                                            return matchesCohort && matchesSearch;
                                        }).map((user) => (
                                            <tr key={user.id} className="group hover:bg-white/40 dark:hover:bg-neutral-800/20 transition-colors">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-center border border-neutral-200/20">
                                                            <Mail className="w-4 h-4 text-neutral-400" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-neutral-900 dark:text-white leading-tight mb-0.5">{user.email || 'N/A'}</span>
                                                            <span className="text-[10px] font-mono text-neutral-400 leading-none">{user.id.substring(0, 16)}...</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex justify-center">
                                                        <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                            user.subscription_tier === 'pro' ? 'bg-indigo-500/10 text-indigo-500' :
                                                            user.subscription_tier === 'admin' ? 'bg-purple-500/10 text-purple-500' :
                                                            'bg-neutral-400/10 text-neutral-400'
                                                        }`}>
                                                            {user.subscription_tier}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex justify-center gap-1.5">
                                                        {user.is_admin && <span title="Admin Access"><ShieldCheck className="w-4 h-4 text-indigo-500" /></span>}
                                                        {user.is_tester && <span title="Tester Enabled"><Cpu className="w-4 h-4 text-amber-500" /></span>}
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-xs font-black text-neutral-900 dark:text-white flex items-center gap-1.5 tabular-nums">
                                                            <Zap className="w-3 h-3 text-emerald-500" />
                                                            {user.total_ai_calls + user.job_analyses_count}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-neutral-400 uppercase">Total Ops</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right font-bold text-neutral-500 text-xs tabular-nums">
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
