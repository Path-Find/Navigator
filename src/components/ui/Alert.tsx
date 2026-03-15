import type { LucideIcon } from 'lucide-react';
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
    title?: string;
    message: React.ReactNode;
    variant?: 'info' | 'success' | 'warning' | 'error';
    onClose?: () => void;
    className?: string;
}

const VARIANTS: Record<string, { icon: LucideIcon; container: string; iconColor: string; accent: string; bg: string }> = {
    info: {
        icon: Info,
        container: "border-neutral-200/50 dark:border-white/10 text-neutral-900 dark:text-neutral-100 shadow-xl shadow-black/5",
        iconColor: "text-blue-500",
        accent: "bg-blue-500",
        bg: "bg-white/80 dark:bg-neutral-900/80",
    },
    success: {
        icon: CheckCircle2,
        container: "border-emerald-500/20 dark:border-emerald-400/20 text-emerald-900 dark:text-emerald-100 shadow-emerald-500/5",
        iconColor: "text-emerald-500",
        accent: "bg-emerald-500",
        bg: "bg-emerald-50/30 dark:bg-emerald-950/20",
    },
    warning: {
        icon: AlertTriangle,
        container: "border-amber-500/30 dark:border-amber-500/20 text-amber-900 dark:text-amber-100 shadow-amber-500/5",
        iconColor: "text-amber-600 dark:text-amber-500",
        accent: "bg-amber-500",
        bg: "bg-white/80 dark:bg-neutral-900/80", // Using neutral background for warning to avoid "big yellow box"
    },
    error: {
        icon: AlertCircle,
        container: "border-rose-500/20 dark:border-rose-400/20 text-rose-900 dark:text-rose-100 shadow-rose-500/5",
        iconColor: "text-rose-500",
        accent: "bg-rose-500",
        bg: "bg-rose-50/30 dark:bg-rose-950/20",
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
            flex gap-4 p-5 rounded-[2rem] border backdrop-blur-2xl
            animate-in fade-in slide-in-from-top-4 duration-700
            ${config.bg}
            ${config.container}
            ${className}
        `}>
            {/* Professional Left Accent Bar */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${config.accent} opacity-80`} />
            
            {/* Subtle Inner Glow */}
            <div className={`absolute -top-20 -left-20 w-40 h-40 ${config.accent} opacity-[0.05] rounded-full blur-3xl pointer-events-none`} />

            <div className={`shrink-0 flex items-center justify-center w-11 h-11 rounded-2xl bg-neutral-100 dark:bg-white/5`}>
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>

            <div className="flex-1 space-y-1.5 py-1">
                {title && <h4 className="text-[10px] font-black tracking-widest leading-none text-neutral-400 dark:text-neutral-500 mb-2">{title}</h4>}
                <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {message}
                </div>
            </div>

            {onClose && (
                <button
                    onClick={onClose}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all h-fit self-start active:scale-90"
                >
                    <X className="w-4 h-4 opacity-30 hover:opacity-100 transition-opacity" />
                </button>
            )}
        </div>
    );
};
