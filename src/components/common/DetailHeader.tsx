import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useJobAnalysis } from '../../modules/job/hooks/useJobAnalysis';


interface DetailHeaderProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    onBack: () => void;
    actions?: React.ReactNode;
    center?: React.ReactNode;
    hideBack?: boolean;
}

export const DetailHeader: React.FC<DetailHeaderProps> = ({
    title,
    subtitle,
    onBack,
    actions,
    center,
    hideBack = false
}) => {


    return (
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
            <div className="mx-auto px-6 py-4 flex items-center justify-between relative">
                <div className="flex items-center gap-4 relative z-10">
                    {!hideBack && (
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all active:scale-95 group"
                        >
                            <ArrowLeft className="w-5 h-5 text-neutral-500 group-hover:-translate-x-1 transition-transform" />
                        </button>
                    )}
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
                            {title}
                        </h2>
                        {subtitle && (
                            <div className="flex flex-col gap-1.5 mt-0.5">
                                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                    <span className="font-semibold text-neutral-900 dark:text-neutral-200">{subtitle}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {center && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="pointer-events-auto">
                            {center}
                        </div>
                    </div>
                )}

                {actions && (
                    <div className="flex items-center justify-end gap-3 relative z-10 p-1 bg-neutral-100/50 dark:bg-white/5 rounded-2xl border border-neutral-200/50 dark:border-white/5">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};
