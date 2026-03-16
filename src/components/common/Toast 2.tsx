import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import type { ToastType } from '../../contexts/ToastContext';

interface ToastItemProps {
    id: string;
    message: string;
    type: ToastType;
}

const ToastItem: React.FC<ToastItemProps> = ({ id, message, type }) => {
    const { removeToast } = useToast();

    const getStyle = () => {
        switch (type) {
            case 'success':
                return 'border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
            case 'error':
                return 'border-rose-500/20 text-rose-600 dark:text-rose-400';
            case 'info':
                return 'border-indigo-500/20 text-indigo-600 dark:text-indigo-400';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-4 h-4 flex-shrink-0" />;
            case 'error':
                return <AlertCircle className="w-4 h-4 flex-shrink-0" />;
            case 'info':
                return <Info className="w-4 h-4 flex-shrink-0" />;
        }
    };

    return (
        <div
            className={`flex items-center gap-3 pl-3 pr-2 py-2 rounded-2xl border bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl shadow-2xl animate-toast-slide-in ${getStyle()}`}
        >
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-current/10">
                {getIcon()}
            </div>
            <p className="flex-1 text-sm font-semibold pr-2">{message}</p>
            <button
                onClick={() => removeToast(id)}
                className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 max-w-sm">
            {toasts.map((toast: { id: string; message: string; type: ToastType }) => (
                <ToastItem key={toast.id} {...toast} />
            ))}
        </div>
    );
};
