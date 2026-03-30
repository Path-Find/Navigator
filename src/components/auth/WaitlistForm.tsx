import React from 'react';
import { Mail, Clock, Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface WaitlistFormProps {
    email: string;
    onEmailChange: () => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    success: boolean;
    error: string | null;
    onClose: () => void;
}

export const WaitlistForm: React.FC<WaitlistFormProps> = ({
    email,
    onEmailChange,
    onSubmit,
    loading,
    success,
    error,
    onClose
}) => {
    if (success) {
        return (
            <div className="text-center py-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">You're on the list!</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">We'll email you as soon as an invite spot opens up.</p>
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl font-bold text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                    Got it
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl flex items-start gap-3">
                <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                    <h5 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-1">Invite Required</h5>
                    Navigator is currently invite-only
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-neutral-500 dark:text-neutral-400 mb-2 ml-1">Email</label>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl flex items-center justify-between border border-neutral-100 dark:border-neutral-700 mb-6">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 truncate max-w-[200px]">{email}</span>
                    </div>
                    <button
                        type="button"
                        onClick={onEmailChange}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        Change
                    </button>
                </div>

                <button
                    onClick={onSubmit}
                    disabled={loading}
                    className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    <span>Join the Waitlist</span>
                </button>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-2xl flex items-start gap-3 text-rose-600 dark:text-rose-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="font-medium">{error}</span>
                </div>
            )}
        </div>
    );
};
