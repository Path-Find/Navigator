import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessStateProps {
    message: string;
    onClose: () => void;
}

export const SuccessState: React.FC<SuccessStateProps> = ({ message, onClose }) => {
    return (
        <div className="text-center py-8 animate-in fade-in slide-in-from-bottom-2">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Check your inbox</h4>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-xs mx-auto leading-relaxed">{message}</p>
            <button
                onClick={onClose}
                className="text-neutral-600 dark:text-neutral-400 font-semibold hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors flex items-center justify-center gap-2 w-full py-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
            >
                Close
            </button>
        </div>
    );
};
