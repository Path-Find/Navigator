import React, { useState, useMemo } from 'react';
import { Calculator, Target, TrendingUp, AlertCircle, ChevronDown } from 'lucide-react';
import type { Transcript } from '../../types';

interface GPACalculatorProps {
    transcript: Transcript;
}

import { GPA_SCALES, getGradePoint } from './utils/gpaUtils';

export const GPACalculator: React.FC<GPACalculatorProps> = ({ transcript }) => {
    const [selectedScale, setSelectedScale] = useState<keyof typeof GPA_SCALES>('OMSAS');
    const [targetGPA, setTargetGPA] = useState<number>(4.0);
    const [remainingCredits, setRemainingCredits] = useState<number>(2.5); // Default ~5 courses
    // 1. Calculate Real Stats (memoized)
    const stats = useMemo(() => {
        let totalPoints = 0;
        let totalCredits = 0;
        const allGradedCourses: { points: number; credits: number }[] = [];

        transcript.semesters.forEach(sem => {
            sem.courses.forEach(c => {
                const points = getGradePoint(c.grade, selectedScale);
                const weight = c.credits || 0.5;

                if (c.grade && !c.grade.toLowerCase().includes('progress')) {
                    totalPoints += points * weight;
                    totalCredits += weight;
                    allGradedCourses.push({ points, credits: weight });
                }
            });
        });

        const calculatedGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

        // Calculate L2 (Last 10.0 credits)
        let l2Points = 0;
        let l2Credits = 0;
        const reversedCourses = [...allGradedCourses].reverse();
        for (const c of reversedCourses) {
            if (l2Credits >= 10) break;
            const creditsToTake = Math.min(c.credits, 10 - l2Credits);
            l2Points += c.points * creditsToTake;
            l2Credits += creditsToTake;
        }
        const calculatedL2 = l2Credits > 0 ? l2Points / l2Credits : null;

        return {
            cGPA: parseFloat(calculatedGPA.toFixed(2)),
            l2GPA: calculatedL2 ? parseFloat(calculatedL2.toFixed(2)) : null,
            totalCredits
        };
    }, [transcript, selectedScale]);

    // 2. Simulator Logic (memoized)
    const requiredGPA = useMemo(() => {
        if (stats.totalCredits === 0) return null;

        // Formula: (TargetAvg * FinalTotalCredits) - (CurrentAvg * CurrentCredits) / RemainingCredits
        const currentPoints = stats.cGPA * stats.totalCredits;
        const finalTotalCredits = stats.totalCredits + remainingCredits;
        const targetPoints = targetGPA * finalTotalCredits;

        const pointsNeeded = targetPoints - currentPoints;
        const avgNeeded = pointsNeeded / remainingCredits;

        return parseFloat(avgNeeded.toFixed(2));
    }, [stats, targetGPA, remainingCredits]);

    return (
        <div className="bg-white/70 dark:bg-neutral-800/70 backdrop-blur-xl rounded-3xl border border-white/50 dark:border-neutral-700/50 p-8 shadow-2xl shadow-violet-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-colors duration-700" />

            <div className="flex items-center gap-4 mb-8 relative">
                <div className="w-12 h-12 bg-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <Calculator className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-black text-xl text-neutral-900 dark:text-white tracking-tight">GPA Simulator</h3>
                    <p className="text-sm text-neutral-500 font-medium">Precision pathfinding for your academic goals.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                {/* Scale Selector */}
                <div className="p-6 bg-neutral-900 dark:bg-neutral-950 rounded-2xl md:col-span-2 shadow-inner">
                    <label className="text-[10px] font-black text-violet-400 tracking-[0.2em] block mb-3">Grading Scale</label>
                    <div className="relative">
                        <select
                            value={selectedScale}
                            onChange={(e) => setSelectedScale(e.target.value as keyof typeof GPA_SCALES)}
                            className="w-full bg-neutral-800 border-none text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-violet-500 appearance-none cursor-pointer"
                        >
                            {Object.entries(GPA_SCALES).map(([key, scale]) => (
                                <option key={key} value={key}>{scale.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* Current Stats */}
                <div className="p-6 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl shadow-lg shadow-violet-500/20 text-white flex flex-col justify-between">
                    <div>
                        <div className="text-[10px] font-black tracking-widest opacity-80 mb-1">cGPA</div>
                        <div className="text-4xl font-black">{stats.cGPA.toFixed(2)}</div>
                    </div>
                    <div className="text-[10px] font-bold opacity-70 mt-4 bg-white/20 px-2 py-1 rounded w-fit">{stats.totalCredits} Credits</div>
                </div>

                <div className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20 text-white flex flex-col justify-between">
                    <div>
                        <div className="text-[10px] font-black tracking-widest opacity-80 mb-1">Last 2 Years (L2)</div>
                        <div className="text-4xl font-black">{stats.l2GPA ? stats.l2GPA.toFixed(2) : stats.cGPA.toFixed(2)}</div>
                    </div>
                    <div className="text-[10px] font-bold opacity-70 mt-4 bg-white/20 px-2 py-1 rounded w-fit">Last 10 Credits</div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                {/* Simulation Inputs */}
                <div className="space-y-6 md:col-span-2 bg-white/50 dark:bg-neutral-900/30 p-6 rounded-2xl border border-white dark:border-neutral-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[11px] font-black text-neutral-500 dark:text-neutral-400 tracking-wider mb-2">
                                Target Cumulative GPA
                            </label>
                            <div className="relative group/input">
                                <input
                                    type="number"
                                    min="0" max="4.0" step="0.01"
                                    value={targetGPA}
                                    onChange={(e) => setTargetGPA(parseFloat(e.target.value))}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-800 border-2 border-neutral-100 dark:border-neutral-700 rounded-xl text-sm font-bold focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none"
                                />
                                <Target className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within/input:text-violet-500" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-neutral-500 dark:text-neutral-400 tracking-wider mb-2">
                                Remaining Credits
                            </label>
                            <div className="relative group/input">
                                <input
                                    type="number"
                                    min="0.5" max="20" step="0.5"
                                    value={remainingCredits}
                                    onChange={(e) => setRemainingCredits(parseFloat(e.target.value))}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-800 border-2 border-neutral-100 dark:border-neutral-700 rounded-xl text-sm font-bold focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none"
                                />
                                <TrendingUp className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within/input:text-violet-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Result */}
                <div className={`p-8 rounded-3xl flex flex-col justify-center items-center text-center transition-all duration-500 ${requiredGPA && requiredGPA > 4.0
                    ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/30'
                    : requiredGPA && requiredGPA > 3.7
                        ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/30'
                        : 'bg-violet-600 text-white shadow-xl shadow-violet-500/30'
                    }`}>
                    <div className="text-[10px] font-black tracking-[0.2em] opacity-80 mb-2 flex items-center gap-2">
                        Target Performance
                        {requiredGPA && requiredGPA > 4.0 && <AlertCircle className="w-4 h-4 animate-bounce" />}
                    </div>
                    <div className="text-5xl font-black mb-2 tracking-tighter">
                        {requiredGPA ? requiredGPA : '---'}
                    </div>
                    <div className="text-xs font-bold opacity-90 leading-tight">
                        {requiredGPA && requiredGPA > 4.0
                            ? "Impossible mathematically"
                            : "Avg needed in remaining courses"}
                    </div>
                    {requiredGPA && requiredGPA <= 4.0 && (
                        <div className="mt-4 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black tracking-wider">
                            Realistic Path
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
