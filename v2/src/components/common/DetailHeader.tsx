import React from 'react';
import { ArrowLeft } from 'lucide-react';


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
        <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
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
                    <div className={hideBack ? 'pl-2' : ''}>
                        <h2 className="text-xl font-black text-neutral-900 dark:text-white truncate max-w-md tracking-tight" title={typeof title === 'string' ? title : undefined}>
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
