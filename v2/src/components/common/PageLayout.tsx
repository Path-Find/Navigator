import React from 'react';

interface PageLayoutProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    themeColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
    children: React.ReactNode;
    spacing?: 'hero' | 'compact' | 'none';
    fullWidth?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
    title,
    description,
    icon,
    actions,
    themeColor = 'indigo',
    children,
    spacing = 'compact',
    fullWidth = false
}) => {
    const themeStyles = {
        indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-500/20',
        rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-500/20',
        slate: 'bg-neutral-100 dark:bg-neutral-900/30 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
    };

    const hasHeader = title || actions;

    const spacingClass = {
        'hero': hasHeader ? 'pt-24' : 'pt-16',
        'compact': hasHeader ? 'pt-20' : 'pt-12',
        'none': 'pt-0'
    }[spacing];

    return (
        <div className={`bg-neutral-50 dark:bg-neutral-900 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 ${spacingClass}`}>
            <div className={`${fullWidth ? 'w-full px-4 sm:px-6' : 'max-w-5xl mx-auto px-6'} py-8 sm:py-12`}>
                {/* Premium Header */}
                {hasHeader && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        {title && (
                            <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 ${themeStyles[themeColor]} rounded-2xl flex items-center justify-center border-2 shrink-0`}>
                                    {icon ? (React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-7 h-7' }) : icon) : null}
                                </div>
                                <div>
                                    <h1 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                                        {title}
                                    </h1>
                                    {description && (
                                        <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                                            {description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {actions && (
                            <div className="flex flex-wrap items-center gap-2">
                                {actions}
                            </div>
                        )}
                    </div>
                )}

                {/* Content */}
                {children}
            </div>
        </div>
    );
};
