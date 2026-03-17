import React from 'react';
import { X, type LucideIcon } from 'lucide-react';

export interface NotificationAction {
    label: string;
    onClick?: (e: React.MouseEvent) => void;
    href?: string;
    icon?: LucideIcon;
    variant?: 'primary' | 'secondary' | 'outline';
}

interface NotificationBannerProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: NotificationAction;
    onDismiss: () => void;
    theme?: 'sky' | 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet';
    className?: string;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
    icon: Icon,
    title,
    description,
    action,
    onDismiss,
    theme = 'sky',
    className = '',
}) => {
    const linkRef = React.useRef<HTMLAnchorElement>(null);

    const isDangerousProtocol = (url: string) => {
        const normalized = url.trim().toLowerCase();
        return normalized.startsWith('javascript:') ||
            normalized.startsWith('data:') ||
            normalized.startsWith('vbscript:');
    };

    React.useEffect(() => {
        if (linkRef.current && action?.href && isDangerousProtocol(action.href)) {
            linkRef.current.setAttribute('href', action.href);
        }
    }, [action?.href]);

    const themeStyles = {
        sky: {
            bg: 'bg-sky-50 dark:bg-sky-900/10',
            border: 'border-sky-100 dark:border-sky-800',
            iconBg: 'bg-sky-100 dark:bg-sky-900/30',
            iconText: 'text-sky-600 dark:text-sky-400',
            button: 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-500/20',
            gradient: 'from-sky-500/5',
            titleText: 'text-neutral-900 dark:text-sky-100',
        },
        indigo: {
            bg: 'bg-indigo-50 dark:bg-indigo-900/10',
            border: 'border-indigo-100 dark:border-indigo-800',
            iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
            iconText: 'text-indigo-600 dark:text-indigo-400',
            button: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20',
            gradient: 'from-indigo-500/5',
            titleText: 'text-neutral-900 dark:text-indigo-100',
        },
        emerald: {
            bg: 'bg-emerald-50 dark:bg-emerald-900/10',
            border: 'border-emerald-100 dark:border-emerald-800',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
            iconText: 'text-emerald-600 dark:text-emerald-400',
            button: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20',
            gradient: 'from-emerald-500/5',
            titleText: 'text-neutral-900 dark:text-emerald-100',
        },
        rose: {
            bg: 'bg-rose-50 dark:bg-rose-900/10',
            border: 'border-rose-100 dark:border-rose-800',
            iconBg: 'bg-rose-100 dark:bg-rose-900/30',
            iconText: 'text-rose-600 dark:text-rose-400',
            button: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/20',
            gradient: 'from-rose-500/5',
            titleText: 'text-neutral-900 dark:text-rose-100',
        },
        amber: {
            bg: 'bg-amber-50 dark:bg-amber-900/10',
            border: 'border-amber-100 dark:border-amber-800',
            iconBg: 'bg-amber-100 dark:bg-amber-900/30',
            iconText: 'text-amber-600 dark:text-amber-400',
            button: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20',
            gradient: 'from-amber-500/5',
            titleText: 'text-neutral-900 dark:text-amber-100',
        },
        violet: {
            bg: 'bg-violet-50 dark:bg-violet-900/10',
            border: 'border-violet-100 dark:border-violet-800',
            iconBg: 'bg-violet-100 dark:bg-violet-900/30',
            iconText: 'text-violet-600 dark:text-violet-400',
            button: 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20',
            gradient: 'from-violet-500/5',
            titleText: 'text-neutral-900 dark:text-violet-100',
        },
    }[theme];

    return (
        <div className={`w-full ${className} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className={`${themeStyles.bg} border ${themeStyles.border} rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm relative overflow-hidden group`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${themeStyles.gradient} to-transparent pointer-events-none`} />

                <div className="flex items-center gap-4 relative z-10 flex-1">
                    <div className={`w-10 h-10 ${themeStyles.iconBg} rounded-xl flex items-center justify-center ${themeStyles.iconText} shrink-0`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-300">
                        <strong className={`font-semibold ${themeStyles.titleText} block mb-0.5`}>{title}</strong>
                        {description}
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto justify-end">
                    {action && (
                        action.href ? (
                            <a
                                ref={linkRef}
                                href={isDangerousProtocol(action.href) ? '#' : action.href}
                                onClick={(e) => {
                                    if (action.href && isDangerousProtocol(action.href)) {
                                        // Legacy bookmarklet support or security block
                                    }
                                    action.onClick?.(e);
                                }}
                                className={`flex items-center gap-2 px-3 py-2 ${themeStyles.button} rounded-lg text-sm font-bold shadow-md transition-all hover:scale-105 whitespace-nowrap`}
                                title={action.label}
                            >
                                {action.icon && <action.icon className="w-3 h-3" />}
                                {action.label}
                            </a>
                        ) : (
                            <button
                                onClick={action.onClick}
                                className={`flex items-center gap-2 px-3 py-2 ${themeStyles.button} rounded-lg text-sm font-bold shadow-md transition-all hover:scale-105 whitespace-nowrap`}
                            >
                                {action.icon && <action.icon className="w-3 h-3" />}
                                {action.label}
                            </button>
                        )
                    )}
                    <button
                        onClick={onDismiss}
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors p-2 -mr-1"
                    >
                        <div className="sr-only">Dismiss</div>
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

