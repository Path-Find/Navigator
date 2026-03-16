import type { LucideIcon } from 'lucide-react';
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
    title?: string;
    message: string;
    variant?: 'info' | 'success' | 'warning' | 'error';
    onClose?: () => void;
    className?: string;
}

const VARIANTS: Record<string, { icon: LucideIcon; container: string; iconColor: string }> = {
    info: {
        icon: Info,
        container: "bg-blue-50/50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400",
        iconColor: "text-blue-500",
    },
    success: {
        icon: CheckCircle2,
        container: "bg-emerald-50/50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-400",
        iconColor: "text-emerald-500",
    },
    warning: {
        icon: AlertTriangle,
        container: "bg-amber-50/50 border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-400",
        iconColor: "text-amber-500",
    },
    error: {
        icon: AlertCircle,
        container: "bg-rose-50/50 border-rose-100 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800/50 dark:text-rose-400",
        iconColor: "text-rose-500",
    }
};

export const Alert: React.FC<AlertProps> = ({
    title,
    message,
    variant = 'info',
    onClose,
    className = ""
}) => {
    const config = VARIANTS[variant];
    const Icon = config.icon;

    return (
        <div className={`
            relative overflow-hidden
            flex gap-4 p-4 rounded-2xl border backdrop-blur-md
            animate-in fade-in slide-in-from-top-4 duration-500
            ${config.container}
            ${className}
        `}>
            {/* Background Accent */}
            <div className={`absolute top-0 left-0 w-1 h-full ${config.iconColor} opacity-50`} />

            <div className="shrink-0 pt-0.5">
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>

            <div className="flex-1 space-y-1">
                {title && <h4 className="text-sm font-black tracking-tight leading-none">{title}</h4>}
                <p className="text-xs font-medium leading-relaxed opacity-90">{message}</p>
            </div>

            {onClose && (
                <button
                    onClick={onClose}
                    className="shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors h-fit"
                >
                    <X className="w-4 h-4 opacity-50" />
                </button>
            )}
        </div>
    );
};
