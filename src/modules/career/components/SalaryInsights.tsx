import React, { useMemo, useState } from 'react';
import { TrendingUp, Search, Briefcase, BarChart2 } from 'lucide-react';
import { useJobContext } from '../../job/context/JobContext';
import { parseSalary, formatSalary } from '../../../utils/salaryParser';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';

const MIN_POINTS_FOR_RANGE = 10;

interface RoleInsight {
    canonicalTitle: string;
    jobCount: number;
    salaryCount: number;
    min: number;
    max: number;
    avg: number;
}

function SalaryRangeBar({ insight }: { insight: RoleInsight }) {
    const { min, max, avg } = insight;
    const range = max - min;

    // Avoid division by zero for single-point salaries
    const avgPct = range > 0 ? ((avg - min) / range) * 100 : 50;

    return (
        <div className="mt-3">
            {/* Labels */}
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    {formatSalary(min)}
                </span>
                <span className="text-xs font-bold text-accent-primary-hex">
                    avg {formatSalary(avg)}
                </span>
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    {formatSalary(max)}
                </span>
            </div>

            {/* Track */}
            <div className="relative h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-visible">
                {/* Filled range */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-primary/30 to-accent-primary/60" />

                {/* Average marker */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-accent-primary-hex border-2 border-white dark:border-neutral-900 shadow-md shadow-accent-primary/40 z-10"
                    style={{ left: `${Math.max(3, Math.min(97, avgPct))}%` }}
                />
            </div>

            <div className="mt-1.5 text-[10px] text-neutral-400 text-right">
                {insight.salaryCount} of {insight.jobCount} listings included salary
            </div>
        </div>
    );
}

function RoleCard({ insight }: { insight: RoleInsight }) {
    const hasRange = insight.salaryCount >= MIN_POINTS_FOR_RANGE;
    const needed = MIN_POINTS_FOR_RANGE - insight.salaryCount;

    return (
        <Card variant="glass" className="p-5">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-neutral-900 dark:text-white text-sm truncate">
                        {insight.canonicalTitle}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Briefcase className="w-3 h-3 text-neutral-400" />
                        <span className="text-[11px] text-neutral-400">
                            {insight.jobCount} application{insight.jobCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
                <div className="shrink-0 w-8 h-8 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary-hex">
                    <BarChart2 className="w-4 h-4" />
                </div>
            </div>

            {hasRange ? (
                <SalaryRangeBar insight={insight} />
            ) : insight.salaryCount > 0 ? (
                <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        Seen: {formatSalary(insight.min)}{insight.min !== insight.max ? ` – ${formatSalary(insight.max)}` : ''}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                        {needed} more point{needed !== 1 ? 's' : ''} for full range
                    </div>
                </div>
            ) : (
                <div className="mt-3 text-[11px] text-neutral-400">
                    No salary data in listings yet
                </div>
            )}
        </Card>
    );
}

export const SalaryInsights: React.FC = () => {
    const { jobs } = useJobContext();
    const [query, setQuery] = useState('');

    const insights = useMemo<RoleInsight[]>(() => {
        const map = new Map<string, { jobCount: number; salaries: { min: number; max: number; mid: number }[] }>();

        for (const job of jobs) {
            if (job.status === 'feed') continue;
            const title = job.analysis?.distilledJob?.canonicalTitle;
            if (!title) continue;

            const entry = map.get(title) ?? { jobCount: 0, salaries: [] };
            entry.jobCount++;

            const rawSalary = job.analysis?.distilledJob?.salaryRange;
            if (rawSalary) {
                const parsed = parseSalary(rawSalary);
                if (parsed) {
                    entry.salaries.push({ min: parsed.min, max: parsed.max, mid: parsed.midpoint });
                }
            }

            map.set(title, entry);
        }

        return Array.from(map.entries())
            .map(([canonicalTitle, { jobCount, salaries }]): RoleInsight => {
                const salaryCount = salaries.length;
                const min = salaryCount > 0 ? Math.min(...salaries.map(s => s.min)) : 0;
                const max = salaryCount > 0 ? Math.max(...salaries.map(s => s.max)) : 0;
                const avg = salaryCount > 0
                    ? salaries.reduce((sum, s) => sum + s.mid, 0) / salaryCount
                    : 0;
                return { canonicalTitle, jobCount, salaryCount, min, max, avg };
            })
            .sort((a, b) => b.jobCount - a.jobCount);
    }, [jobs]);

    const filtered = useMemo(() => {
        if (!query.trim()) return insights;
        const q = query.toLowerCase();
        return insights.filter(i => i.canonicalTitle.toLowerCase().includes(q));
    }, [insights, query]);

    const hasAnySalaryData = insights.some(i => i.salaryCount > 0);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PageHeader
                variant="simple"
                title="Salary Insights"
                subtitle="Salary ranges across the roles you're targeting, built from your own application history."
                className="mb-8"
            />

            {/* Search */}
            <div className="relative mb-6 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Filter roles..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary/50 transition-all"
                />
            </div>

            {insights.length === 0 ? (
                <Card variant="glass" className="p-10 text-center">
                    <div className="w-14 h-14 bg-accent-primary/10 rounded-2xl flex items-center justify-center text-accent-primary-hex mx-auto mb-4">
                        <TrendingUp className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-1">No role data yet</h3>
                    <p className="text-sm text-neutral-400 max-w-xs mx-auto">
                        Save and analyze jobs to start building salary insights for the roles you're targeting.
                    </p>
                </Card>
            ) : filtered.length === 0 ? (
                <p className="text-sm text-neutral-400 text-center py-10">No roles match "{query}"</p>
            ) : (
                <>
                    {!hasAnySalaryData && (
                        <div className="mb-4 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
                            Range bars appear once a role has {MIN_POINTS_FOR_RANGE}+ listings with salary data. Keep saving jobs to unlock them.
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(insight => (
                            <RoleCard key={insight.canonicalTitle} insight={insight} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
