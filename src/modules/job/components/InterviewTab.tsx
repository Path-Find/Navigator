import React from 'react';
import { Sparkles, ShieldCheck, Search, Copy } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { SavedJob } from '../types';
import type { ModalType, ModalData } from '../../../contexts/ModalContext';

interface InterviewTabProps {
    job: SavedJob;
    userTier: string | undefined;
    openModal: (type: ModalType, data?: ModalData | null) => void;
}

export const InterviewTab: React.FC<InterviewTabProps> = ({
    job,
    userTier,
    openModal
}) => {
    const analysis = job.analysis;

    return (
        <div className="pb-8 overflow-x-hidden">
            <section className="space-y-8">
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Interview Mission Control</h2>
                        <p className="text-sm text-neutral-500 font-bold">The "Eve of Battle" Prep Deck for {analysis?.distilledJob?.roleTitle || job.position}</p>
                    </div>
                    <div className="px-4 py-1.5 bg-indigo-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                        Beta
                    </div>
                </div>

                {userTier === 'free' ? (
                    <Card variant="premium" className="relative p-12 border-indigo-500/20 overflow-hidden group">
                        {/* Blurry Content Placeholder */}
                        <div className="absolute inset-0 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md z-10 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-3">Interview Successfully Secured?</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-8 font-bold">
                                Unlock your personalized "Interview Prep Deck" including the top 5 questions they'll likely ask you based on this specific JD and your background.
                            </p>
                            <Button
                                variant="accent"
                                onClick={() => openModal('UPGRADE', { initialView: 'upgrade' })}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20"
                                icon={<Sparkles className="w-4 h-4" />}
                            >
                                Unlock Mission Control
                            </Button>
                        </div>

                        <div className="space-y-6 opacity-20 filter blur-sm select-none pointer-events-none" aria-hidden="true">
                            <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded-full w-1/3"></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-40 bg-neutral-50 dark:bg-neutral-800 rounded-3xl"></div>
                                <div className="h-40 bg-neutral-50 dark:bg-neutral-800 rounded-3xl"></div>
                            </div>
                            <div className="h-24 bg-neutral-50 dark:bg-neutral-800 rounded-3xl w-full"></div>
                        </div>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card variant="glass" className="p-8 border-indigo-500/10">
                            <h4 className="text-xs font-black text-indigo-500 dark:text-indigo-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Predicted Interview Questions
                            </h4>
                            <div className="space-y-4">
                                {[
                                    "How did you handle [Specific Project] at [Organization]?",
                                    "What's your experience with [Key Skill]?",
                                    "Tell us about a time you [Competency Value]...",
                                    "How would you approach [Problem Context]?",
                                    "Why this role specifically for you?"
                                ].map((q, i) => (
                                    <div key={i} className="p-4 bg-neutral-50/50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-white/5 text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                        {q}
                                    </div>
                                ))}
                            </div>
                            <Button variant="ghost" size="xs" className="mt-6 text-[10px] uppercase font-black tracking-widest opacity-50 hover:opacity-100">
                                Regenerate based on JD
                            </Button>
                        </Card>

                        <Card variant="glass" className="p-8 border-emerald-500/10 h-full">
                            <h4 className="text-xs font-black text-emerald-500 dark:text-emerald-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                                <Search className="w-4 h-4" /> Reverse Interview Questions
                            </h4>
                            <div className="space-y-4">
                                {[
                                    "I noticed the role focuses on [X]. How does your team handle the [Y] challenge?",
                                    "How do you measure success for [Key Goal] in the first 90 days?",
                                    "What's the #1 priority for this role over the next quarter?"
                                ].map((q, i) => (
                                    <div key={i} className="flex gap-4 p-4 bg-emerald-50/10 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/10 text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                        {q}
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card variant="premium" className="md:col-span-2 p-8 border-accent-primary/10">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Your "Eve of Battle" Cheat Sheet</h4>
                                <Button variant="secondary" size="xs" icon={<Copy className="w-3 h-3" />}>Copy to clipboard</Button>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-white/5 shadow-sm">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase mb-2">The Match Hook</div>
                                    <p className="text-xs font-bold leading-relaxed">"I see you're scaling [X]. My experience at [Y] where I [Z] is exactly what's needed here."</p>
                                </div>
                                <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-white/5 shadow-sm">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase mb-2">Addressing Gaps</div>
                                    <p className="text-xs font-bold leading-relaxed">"While I haven't used [Skill X] directly, my [Skill Y] experience allows me to ramp up quickly."</p>
                                </div>
                                <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-white/5 shadow-sm">
                                    <div className="text-[10px] font-black text-neutral-400 uppercase mb-2">Desired Outcome</div>
                                    <p className="text-xs font-bold leading-relaxed">Clarify next steps and set a timeline for follow-up.</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </section>
        </div>
    );
};
