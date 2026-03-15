import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { ModalType, ModalData } from '../../../contexts/ModalContext';

interface InterviewTabProps {
    userTier: string | undefined;
    openModal: (type: ModalType, data?: ModalData | null) => void;
}

export const InterviewTab: React.FC<InterviewTabProps> = ({
    userTier,
    openModal
}) => {
    return (
        <div className="pb-8 overflow-x-hidden">
            <section className="space-y-8">
                {userTier === 'free' ? (
                    <Card variant="premium" className="relative p-12 border-indigo-500/20 overflow-hidden group">
                        <div className="absolute inset-0 bg-white/40 dark:bg-neutral-900/40 backdrop-blur-md z-10 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-black text-neutral-900 dark:text-white mb-2">Got an interview?</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
                                Unlock your personalized prep deck — predicted questions, reverse questions, and talking points tailored to this specific role.
                            </p>
                            <Button
                                variant="accent"
                                onClick={() => openModal('UPGRADE', { initialView: 'upgrade' })}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20"
                                icon={<Sparkles className="w-4 h-4" />}
                            >
                                Unlock Interview Prep
                            </Button>
                        </div>

                        <div className="space-y-6 opacity-20 filter blur-sm select-none pointer-events-none" aria-hidden="true">
                            <div className="h-8 bg-neutral-100 dark:bg-neutral-800 rounded-full w-1/3"></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-40 bg-neutral-50 dark:bg-neutral-800 rounded-2xl"></div>
                                <div className="h-40 bg-neutral-50 dark:bg-neutral-800 rounded-2xl"></div>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <Card variant="glass" className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="w-7 h-7 text-neutral-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-neutral-900 dark:text-white mb-2">Interview Prep Coming Soon</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
                                AI-generated questions, talking points, and reverse questions tailored to this role will appear here.
                            </p>
                        </div>
                    </Card>
                )}
            </section>
        </div>
    );
};
