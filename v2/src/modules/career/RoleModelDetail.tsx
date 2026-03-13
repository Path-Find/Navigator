import React, { useState } from 'react';
import {
    Trash2,
    TrendingUp,
    CheckCircle2,
    Search,
    Brain,
    Rocket,
    Briefcase
} from 'lucide-react';
import type { RoleModelProfile } from '../../types';
import { DetailHeader } from '../../components/common/DetailHeader';
import { DetailTabs } from '../../components/common/DetailTabs';
import type { TabItem } from '../../components/common/DetailTabs';
import { DetailLayout } from '../../components/common/DetailLayout';

interface RoleModelDetailProps {
    roleModel: RoleModelProfile;
    onBack: () => void;
    onDelete: (id: string) => void;
    onEmulate: (id: string) => void;
}

export const RoleModelDetail: React.FC<RoleModelDetailProps> = ({
    roleModel,
    onBack,
    onDelete,
    onEmulate
}) => {
    const [activeTab, setActiveTab] = useState('analysis');

    const tabs: TabItem[] = [
        { id: 'analysis', label: 'Analysis', icon: CheckCircle2 },
        { id: 'journey', label: 'Journey', icon: TrendingUp },
        { id: 'context', label: 'Context', icon: Brain },
    ];

    const actions = (
        <>
            <button
                onClick={() => onEmulate(roleModel.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
            >
                <TrendingUp className="w-4 h-4" />
                Emulate Path
            </button>
            <button
                onClick={() => onDelete(roleModel.id)}
                className="p-2 text-neutral-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Delete Profile"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </>
    );

    const sidebar = (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800">
            <h3 className="font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Profile Meta
            </h3>
            <div className="space-y-4">
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-700">
                    <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">Added On</div>
                    <div className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{new Date(roleModel.dateAdded).toLocaleDateString()}</div>
                </div>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-700">
                    <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1">Verification Status</div>
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-bold">Verified LinkedIn Pattern</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-neutral-950 h-full flex flex-col animate-in fade-in duration-500">
            <DetailHeader
                title={roleModel.name}
                subtitle={roleModel.headline}
                onBack={onBack}
            />

            <DetailTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                themeColor="accent"
                actions={actions}
            />

            <DetailLayout
                sidebar={activeTab === 'analysis' || activeTab === 'journey' ? sidebar : undefined}
                maxWidth="max-w-4xl"
            >
                {activeTab === 'analysis' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 shadow-sm border border-neutral-200 dark:border-neutral-800">
                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-wider">
                                <Search className="w-4 h-4 text-emerald-600" /> Career Snapshot
                            </h4>
                            <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium italic">
                                "{roleModel.careerSnapshot}"
                            </p>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 shadow-sm border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                                    <Rocket className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 dark:text-white">Distilled Hard Skills</h4>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Key technical competencies from this path</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {roleModel.topSkills.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        className="text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'journey' && (
                    <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                        <div className="border-b border-neutral-100 dark:border-neutral-800 p-6">
                            <h3 className="font-black text-neutral-900 dark:text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                Career Journey
                            </h3>
                        </div>
                        <div className="p-8">
                            {(!roleModel.experience || roleModel.experience.length === 0) ? (
                                <div className="text-center py-12">
                                    <Briefcase className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs">No experience blocks extracted yet.</p>
                                    <p className="text-neutral-400 text-[10px] mt-2">Try re-analyzing the profile for deeper insights.</p>
                                </div>
                            ) : (
                                <div className="space-y-12 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-neutral-100 dark:before:bg-neutral-800">
                                    {roleModel.experience.map((block, i) => (
                                        <div key={i} className="relative pl-12 group">
                                            {/* Dot */}
                                            <div className="absolute left-0 top-1.5 w-8 h-8 rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 flex items-center justify-center z-10 group-hover:border-emerald-500 transition-colors">
                                                <div className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-700 group-hover:bg-emerald-500 transition-colors" />
                                            </div>

                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2">
                                                        {block.type}
                                                    </div>
                                                    <h4 className="text-lg font-black text-neutral-900 dark:text-white leading-tight mb-1">
                                                        {block.title}
                                                    </h4>
                                                    <div className="text-sm font-bold text-neutral-500 dark:text-neutral-400 mb-4 flex items-center gap-2">
                                                        {block.organization}
                                                        <span className="text-neutral-300">•</span>
                                                        <span className="text-neutral-400 font-medium">{block.dateRange}</span>
                                                    </div>

                                                    <ul className="space-y-3">
                                                        {block.bullets.map((bullet, idx) => (
                                                            <li key={idx} className="flex gap-3 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                                                <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 mt-2 shrink-0" />
                                                                {bullet}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'context' && (
                    <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                        <div className="p-8">
                            <h4 className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white mb-6 uppercase text-sm tracking-wider">
                                <Brain className="w-4 h-4 text-emerald-500" />
                                AI Distillation Context
                            </h4>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                                {roleModel.rawTextSummary}
                            </div>
                        </div>
                    </div>
                )}
            </DetailLayout>
        </div>
    );
};
